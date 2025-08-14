from fastapi import APIRouter, Depends, HTTPException, status,Form, File,UploadFile,BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.concurrency import run_in_threadpool
from typing import List,Optional
from sqlalchemy import select,update
from dependencies.database import get_session
import crud.crud as crud
import schemas.users as users
from utility.email_utils import send_otp_email
from utility.security import verify_password
from utility.cloudinary_utils import upload_to_cloudinary
from core.redis import redis_client
from utility.otp_generator import otp_generate
from fastapi.responses import JSONResponse
from utility.jwt_handler import create_access_token,create_refresh_token,verify_token
from fastapi.logger import logger
from datetime import date 
from dependencies.get_current_user import get_current_user
from infra.external.consultation_service import get_psycholgist_rating
from asyncio import gather
import logging
from fastapi import Request
import os
from fastapi import Query
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
logger = logging.getLogger("uvicorn.error")
router = APIRouter(tags=["users"])
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")



@router.post("/users", response_model=users.UserOut)
async def create_user(
    user: users.UserCreate,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session)
    ):
    try:
        db_user = await crud.get_user_by_email(session, user.email_address)
        if db_user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
        new_user = await crud.create_user(session, user)
        otp = otp_generate()
        await redis_client.set(f"otp:{user.email_address}", otp, ex=300)
        send_otp_email.delay(user.email_address, otp)
        return new_user
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Something Went Wrong")

@router.put("/users/{user_id}")
async def update_user_details(
    user_id: int, 
    user_and_profile: users.UserWithOptionalProfileOut,
    current_user: str = Depends(get_current_user), 
    session: AsyncSession = Depends(get_session)
    ):
    if int(current_user['user_id']) != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot update another user's details"
        )
    try:
        updated_user = await crud.update_user_and_profile(session, user_id, user_and_profile)
        if not updated_user:
            raise HTTPException(status_code=404, detail="User not found")
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Error updating user: {e}")
        raise HTTPException(status_code=400, detail="Failed to update user")
    
@router.post("/google-login")
async def google_login(
    data: users.GoogleLoginSchema, 
    request: Request, 
    session: AsyncSession = Depends(get_session)
    ):
    credential = data.credential
    if not credential:
        raise HTTPException(status_code=400, detail="No credential provided")
    try:
        id_info = id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            GOOGLE_CLIENT_ID
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid Google token")
    email = id_info.get("email")
    name = id_info.get("name", "")
    picture = id_info.get("picture", "")
    if not email:
        raise HTTPException(status_code=400, detail="Email not found in Google token")
    user = await crud.get_user_by_email(session,email)
    if not user:
        password =otp_generate()
        user= await crud.create_google_user(session,name,email,picture,password)
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Your account has been blocked.")
    access_token = create_access_token(user_id=str(user.id),role=user.role)
    refresh_token = create_refresh_token(user_id=str(user.id))
    response = JSONResponse(content={
        "user": {
            "access_token": access_token,
            "id": user.id,
            "email": user.email_address,
            "name": user.name,
            "role": user.role,
            "is_verified": user.is_verified,
            "is_active": user.is_active,
        }
    })
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True, 
        samesite="strict", 
        max_age=60 * 60 * 24 * 7 
    )
    return response
@router.put("/update_psychologist_details/{user_id}")
async def update_psychologist_details(
    user_id: int, 
    user_and_profile: users.DoctorVerificationOut,
    current_user: str = Depends(get_current_user), 
    session: AsyncSession = Depends(get_session)
    ):
    try:
        if int(current_user['user_id']) != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot update another user's details"
            )
        updated_user = await crud.update_psychologist_and_profile(session, user_id, user_and_profile)
        if not updated_user:
            raise HTTPException(status_code=404, detail="User not found")
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Error updating user: {e}")
        raise HTTPException(status_code=400, detail="Failed to update user")
   
@router.post('/email-verification')
async def verify_email_otp(otp_schema:users.OtpVerification,session: AsyncSession = Depends(get_session)):
    stored_otp = await redis_client.get(f"otp:{otp_schema.email}")
    if otp_schema.otp == stored_otp:
        await crud.update_user_status_email(session,otp_schema.email)
        await redis_client.delete(f"otp:{otp_schema.email}")
        return JSONResponse(content={"status": "success"}, status_code=200)
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="")
    
@router.post('/login')
async def login(    login_schema: users.LoginSchema, session: AsyncSession = Depends(get_session)):
    user_details = await crud.get_user_by_email(session, login_schema.email)
    if user_details and verify_password(login_schema.password, user_details.password):
        
        access_token = create_access_token(user_id=str(user_details.id),role=user_details.role)
        refresh_token = create_refresh_token(user_id=str(user_details.id))
        response = JSONResponse(
            content={'user': {
                'access_token': access_token,
                'id': user_details.id,
                'email': user_details.email_address,
                'name': user_details.name,
                'role': user_details.role,
                'is_verified': user_details.is_verified,
                'is_active': user_details.is_active,
                
            }}        )
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=True,
            samesite="strict"
        )
        return response
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email or password"
        )

@router.post('/password-reset')
async def forgetpassword(
    email_schema: users.ForgetPasswordSchema,session: AsyncSession = Depends(get_session)
):
    try:
        db_user = await crud.get_user_by_email(session, email_schema.email)
        if db_user:
            otp = otp_generate()  
            await redis_client.delete(f"otp:{email_schema.email}")
            await redis_client.set(f"otp:{email_schema.email}", otp, ex=300)
            # Use Celery 
            send_otp_email.delay(email_schema.email, otp)
            return JSONResponse(content={"status": "success"}, status_code=200)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email"
        )
    except HTTPException as http_exc:
        raise http_exc  
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Something went wrong. Please try again later."
        )
    
@router.post('/password-reset/verify-otp')
async def verify_password_otp(
    otp_schema: users.ForgetPasswordOTPSchema,
    session: AsyncSession = Depends(get_session)
):
    stored_otp = await redis_client.get(f"otp:{otp_schema.email}")
    if stored_otp is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP has expired or is invalid. Please request a new one."
        )
    if int(otp_schema.otp) == int(stored_otp):
        await crud.update_user_password(session, otp_schema.email, otp_schema.password)
        await redis_client.delete(f"otp:{otp_schema.email}")
        return JSONResponse(content={"status": "success"}, status_code=200)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP. Please check and try again."
        )

@router.get('/psychologists', response_model=users.PaginatedPsychologistResponse)
async def view_psychologist(
    session: AsyncSession = Depends(get_session),
    page: int = Query(1, ge=1),
    limit: int = Query(10, le=100),
):
    try:
        offset = (page - 1) * limit
        data = await crud.get_all_psychologist_with_profile(session,limit,skip=offset)
        total = await crud.count_all_psychologists(session)
        if not data:
            raise HTTPException(status_code=404, detail="No psychologists found")

        rating_tasks = [get_psycholgist_rating(p.user_id) for p in data]
        ratings = await gather(*rating_tasks, return_exceptions=True)

        processed_ratings = []
        for rating in ratings:
            if isinstance(rating, Exception):
                logger.warning("Failed to fetch rating: %s", str(rating))
                processed_ratings.append(0.0)
            else:
                processed_ratings.append(rating if rating is not None else 0.0)

        enriched_ratings = []
        for i, p in enumerate(data):
            try:
                profile_out = users.PsychologistProfileOut(
                    id=p.id,
                    specialization=p.specialization,
                    profile_image=p.profile_image,
                    is_verified=p.is_verified,
                    is_available=p.is_available,
                    experience =p.experience,
                    fees = p.fees,
                    about_me =p.about_me,
                    qualification =p.qualification,
                    user=p.user,
                    rating=processed_ratings[i]
                )
                enriched_ratings.append(profile_out)
            except Exception as e:
                logger.error("Error creating profile out for psychologist %s: %s", p.id, str(e))
                continue  # Skip problematic entries or handle differently
        if not enriched_ratings:
            raise HTTPException(status_code=404, detail="No valid psychologist profiles found")
        next_url = f"/view_psychologist?page={page + 1}&limit={limit}" if offset + limit < total else None
        prev_url = f"/view_psychologist?page={page - 1}&limit={limit}" if page > 1 else None
        return {
            "count": total,
            "next": next_url,
            "previous": prev_url,
            "results": enriched_ratings
        }
    except HTTPException as http_exc:
        logger.error("HTTP error while fetching psychologists: %s", str(http_exc))
        raise http_exc
    except Exception as e:
        logger.error("Internal error while fetching psychologists: %s", str(e), exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Internal server error while fetching psychologists."
        )
        
@router.patch('/psychologists/{user_id}/availability')
async def update_availability(
    user_id:int,
    data: users.AvailabilityUpdate,
    current_user: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
    ):
    try :
        data= await crud.psychologist_availability_update(session,user_id,data.is_available)
        return JSONResponse(content={"status": data}, status_code=200)
    except:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="")  
    
@router.patch('/update_psychologist_for_consultaion/{user_id}/{is_available}')
async def update_availability_interservice(
    user_id:int,
    is_available:bool,
    session: AsyncSession = Depends(get_session)
    ):
    try :
        data= await crud.psychologist_availability_update(session,user_id,is_available)
        return JSONResponse(content={"status": data}, status_code=200)
    except:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="")  
    
@router.patch('/update_psychologist_documents/{user_id}')
async def update_psychologist_documents(
    user_id:int,
    identification_doc: Optional[UploadFile] = File(None),
    education_certificate: Optional[UploadFile] = File(None),
    experience_certificate: Optional[UploadFile] = File(None),
    current_user: str = Depends(get_current_user),
    session:AsyncSession =Depends(get_session)
    ):
    try:
        if experience_certificate:
            edu_url = await run_in_threadpool(
                upload_to_cloudinary, 
                experience_certificate, 
                "doctor_verification/education"
                )
            await crud.update_psychologist_documents_crud(session,user_id,edu_url,'edu_url')
        elif identification_doc:
            id_url = await run_in_threadpool(
                upload_to_cloudinary, 
                identification_doc, 
                "doctor_verification/id"
                )
            await crud.update_psychologist_documents_crud(session,user_id,id_url,'id_url')
        elif education_certificate:
            exp_url = await run_in_threadpool(
                upload_to_cloudinary, 
                education_certificate, 
                "doctor_verification/experience"
                )
            await crud.update_psychologist_documents_crud(session,user_id,exp_url,'exp_url')
    except Exception as e :
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY,detail='unable to upload image')

@router.get("/get_user_details/{user_id}", response_model=users.UserWithOptionalProfileOut)
async def get_user_details(user_id: int,current_user: str = Depends(get_current_user), session: AsyncSession = Depends(get_session)):

    try:
        userId = current_user["user_id"]
        if int(user_id) != int(userId):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="User is not authorized")
        data = await crud.get_user_by_id_for_profile(session,user_id)
        if not data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/get_user_details_by_id/{user_id}", response_model=users.UserNameWithProfileImage)
async def get_user_details_by_id(user_id: int, session: AsyncSession = Depends(get_session)):
    data = await crud.get_user_by_id_for_profile(session,user_id)
    if not data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return data

@router.get("/check_doctor_availability/{psychologist_id}")
async def get_user_details_by_id(psychologist_id: int, session: AsyncSession = Depends(get_session)):
    data = await crud.check_doctor_availability(session,psychologist_id)
    if not data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return data

@router.get("/get_doctor_details_by_id/{psychologist_id}", response_model=users.DoctorNameWithProfileImage)
async def get_doctor_details_by_id(psychologist_id: int, session: AsyncSession = Depends(get_session)):
    data = await crud.get_doctor_by_id_for_profile(session,psychologist_id)
    if not data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return data

@router.get("/get_psycholgist_details/{user_id}", response_model=users.DoctorVerificationOut)
async def get_psycholgist_details(user_id: int, session: AsyncSession = Depends(get_session)):
    try:
        try:
            data = await crud.get_psycholgist_by_id(session, user_id)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}"
            )
        if not data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return data 
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.post("/doctor_verification/{user_id}")
async def doctor_verification(
    user_id: int,
    date_of_birth: date = Form(...),
    experience: str = Form(...),
    gender: str = Form(...),
    fees: int = Form(...),
    qualification: str = Form(...),
    specialization: str = Form(...),
    about_me: str = Form(...),
    id: UploadFile = File(...),
    educationalCertificate: UploadFile = File(...),
    experienceCertificate: UploadFile = File(...),
    current_user: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    try:
        try:
            id_url = await run_in_threadpool(upload_to_cloudinary, id, "doctor_verification/id")
            edu_url = await run_in_threadpool(
                upload_to_cloudinary, 
                educationalCertificate, 
                "doctor_verification/education"
                )
            exp_url = await run_in_threadpool(
                upload_to_cloudinary, 
                experienceCertificate, 
                "doctor_verification/experience"
                )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Cloudinary upload failed: {str(e)}"
            )
        try:
            await crud.doctor_profile_creation(
                session, user_id, date_of_birth, experience, gender, fees, qualification, 
                specialization, about_me, id_url, edu_url, exp_url
                )
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}"
            )
        return JSONResponse(content={"status": "success"}, status_code=200)
    except HTTPException as http_exc:
        raise http_exc  
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )
        
@router.put("/doctor_verification_update/{user_id}")
async def doctor_verification_update(
    user_id: int,
    date_of_birth: date = Form(...),
    experience: str = Form(...),
    gender: str = Form(...),
    fees: int = Form(...),
    qualification: str = Form(...),
    specialization: str = Form(...),
    about_me: str = Form(...),
    id: UploadFile = File(None),  
    educationalCertificate: UploadFile = File(None),  
    experienceCertificate: UploadFile = File(None),  
    current_user: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    try:
        id_url = None
        edu_url = None
        exp_url = None
        try:
            if id and id.filename:  
                id_url = await run_in_threadpool(upload_to_cloudinary, id, "doctor_verification/id")
            
            if educationalCertificate and educationalCertificate.filename:
                edu_url = await run_in_threadpool(
                    upload_to_cloudinary, 
                    educationalCertificate, 
                    "doctor_verification/education"
                    )
            
            if experienceCertificate and experienceCertificate.filename:
                exp_url = await run_in_threadpool(
                    upload_to_cloudinary, 
                    experienceCertificate, 
                    "doctor_verification/experience"
                    )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Cloudinary upload failed: {str(e)}"
            )
        try:
            await crud.doctor_profile_update(
                session=session,
                user_id=user_id,
                date_of_birth=date_of_birth,
                experience=experience,
                gender=gender,
                fees=fees,
                qualification=qualification,
                specialization=specialization,
                about_me=about_me,
                id_url=id_url,  
                edu_url=edu_url,  
                exp_url=exp_url  
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}"
            )
        return JSONResponse(
            content={
                "status": "success",
                "message": "Doctor profile updated successfully"
                }, status_code=200
            )
    except HTTPException as http_exc:
        raise http_exc 
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/admin_view_users",)
async def admin_view_users(
    current_user: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
    page: int = Query(1, ge=1),
    limit: int = Query(10, le=100),
    search: str = Query(None)
    ):
    try:
        role = current_user["role"]
        if role != 'admin':
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="User is not authorized")
        
        offset = (page - 1) * limit
        total = await crud.count_all_users(session)
        result = await crud.get_all_users(session,search,limit, skip=offset)
        next_url = f"/admin_view_users?page={page + 1}&limit={limit}" if offset + limit < total else None
        prev_url = f"/admin_view_users?page={page - 1}&limit={limit}" if page > 1 else None
        return {
            "count": total,
            "next": next_url,
            "previous": prev_url,
            "results": result
        }
    except HTTPException:
        raise 
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve users"
        )
        
@router.get("/admin_view_psychologist")
async def admin_view_psychologist(
    page: int = Query(1, ge=1),
    limit: int = Query(10, le=100),
    search: str = Query(None),
    current_user: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
    ):
    role = current_user["role"]
    if role != 'admin':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="User is not authorized")
    try:
        offset = (page - 1) * limit
        total = await crud.count_all_users(session)
        result = await crud.get_all_psychologist(session,search,limit, skip=offset)
        next_url = f"/admin_view_psychologist?page={page + 1}&limit={limit}" if offset + limit < total else None
        prev_url = f"/admin_view_psychologist?page={page - 1}&limit={limit}" if page > 1 else None
        return {
            "count": total,
            "next": next_url,
            "previous": prev_url,
            "results": result
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve users"
        )
        
@router.get("/doctor_profile_images")
async def doctor_profile_images(session: AsyncSession = Depends(get_session)):
    try:
        # get first 9 doctors images
        result = await crud.doctor_profile_images_crud(session)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve users"
        )

        
@router.patch('/toggle_user_status/{user_id}')
async def toggle_user_status(
    user_id:int,
    current_user: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
    ):
    try :
        role = current_user["role"]
        if role != 'admin':
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="User is not authorized")
        
        data= await crud.toggle_user_status_by_id(session,user_id)
        return JSONResponse(content={"status": data}, status_code=200)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to toggle user status"
        )
    
@router.patch('/update_user_profile_image/{user_id}')
async def toggle_user_status(
    user_id:int,
    profile_image: UploadFile = File(...),
    current_user: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
    ):
    try :
        userId = current_user["user_id"]
        if user_id != int(userId):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="User is not authorized")

        profile_url = await run_in_threadpool(upload_to_cloudinary, profile_image, "profile_images/id")
        data= await crud.update_user_profile_image(session,user_id,profile_url)
        return JSONResponse(content={"status": data}, status_code=200)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected Error Happend"
        )
    
@router.patch('/update_psychologist_profile_image/{user_id}')
async def toggle_user_status(
                                user_id:int,
                                profile_image: UploadFile = File(...),
                                current_user: str = Depends(get_current_user),
                                session: AsyncSession = Depends(get_session)
                                ):
    try :
        userId = current_user["user_id"]
        if user_id != int(userId):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="User is not authorized")
        
        profile_url = await run_in_threadpool(upload_to_cloudinary, profile_image, "profile_images/id")
        data= await crud.update_user_psychologist_image(session,user_id,profile_url)
        return JSONResponse(content={"status": data}, status_code=200)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected Error Happend"
        )
    
@router.patch('/change_psychologist_verification/{user_id}/{status}')
async def change_psychologist_verification(
    user_id:int,
    status:str,
    current_user: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
    ):
    try :
        role = current_user["role"]
        if role != 'admin':
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="User is not authorized")
        data= await crud.toggle_psychologist_status_by_id(session,user_id,status)
        return JSONResponse(content={"status": data}, status_code=200)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected Error Happend"
        )
    
@router.put('/revoke_psychologist_verification/{user_id}')
async def change_psychologist_verification(
    user_id:int,
    revoke_details:users.RevokeDetails,
    current_user: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
    ):
    try :
        role = current_user["role"]
        if role != 'admin':
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="User is not authorized")
        data= await crud.revoke_psychologist_status_by_id(session,user_id,revoke_details)
        return JSONResponse(content={"status": data}, status_code=200)
    except:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="")
    
@router.post("/refresh_token")
async def refresh_token(request: Request,session:AsyncSession= Depends(get_session)):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token missing in cookies",
        )

    payload = verify_token(refresh_token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )
    user_details= await crud.get_user_details_by_id(session, user_id)
    new_access_token = create_access_token(user_id=str(user_id),role=user_details.role)
    return {
        "access_token": new_access_token,
        "token_type": "bearer"
    }

@router.get("/get_fees_of_doctor/{psychologist_id}")
async def get_fees_of_doctor(psychologist_id:int ,session: AsyncSession = Depends(get_session)):
    try:
        result = await crud.doctor_fees_crud(session,psychologist_id)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve fees"
        )