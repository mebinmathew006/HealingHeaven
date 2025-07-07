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
# from dependencies.auth import create_access_token,create_refresh_token,verify_refresh_token
from utility.jwt_handler import create_access_token,create_refresh_token,verify_token
from fastapi.logger import logger
from datetime import date 
from dependencies.get_current_user import get_current_user
from infra.external.consultation_service import get_psycholgist_rating
from asyncio import gather
import logging
from fastapi import Request
import os
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
logger = logging.getLogger("uvicorn.error")
router = APIRouter(tags=["users"])
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

@router.post("/google-login")
async def google_login(data: users.GoogleLoginSchema, request: Request, session: AsyncSession = Depends(get_session)):
    credential = data.credential
    if not credential:
        raise HTTPException(status_code=400, detail="No credential provided")

    try:
        # Verify token
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

    # Check if user exists
    user = await crud.get_user_by_email(session,email)

    if not user:
       
        password =otp_generate()
        user= await crud.create_google_user(session,name,email,picture,password)
      

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Your account has been blocked.")

    # Generate tokens
    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    # Set refresh token in cookie
    response = JSONResponse(content={
        "user": {
            "access_token": access_token,
            "id": user.id,
            "email": user.email_address,
            "name": user.name,
            "role": user.role,
            "is_verified": user.is_verified,
            "is_active": user.is_active,
            # "profile_image": user.profile_image
        }
    })

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,  # Set to False only in dev
        samesite="strict",  # or "lax" if needed
        max_age=60 * 60 * 24 * 7  # 7 days
    )

    return response


@router.post("/signup", response_model=users.UserOut)
async def create_user(user: users.UserCreate,background_tasks: BackgroundTasks, session: AsyncSession = Depends(get_session)):
    db_user = await crud.get_user_by_email(session, user.email_address)
    if db_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    new_user = await crud.create_user(session, user)
    otp = otp_generate()  # simple 6-digit OTP
    await redis_client.set(f"otp:{user.email_address}", otp, ex=300)
    send_otp_email.delay(user.email_address, otp)
    return new_user



@router.put("/update_user_details/{user_id}")
async def update_user_details(user_id: int, user_and_profile: users.UserWithOptionalProfileOut,current_user_id: str = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    
    
    if int(current_user_id) != user_id:
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
    
   
@router.put("/update_psychologist_details/{user_id}")
async def update_psychologist_details(user_id: int, user_and_profile: users.DoctorVerificationOut,current_user_id: str = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    try:
        updated_user = await crud.update_psychologist_and_profile(session, user_id, user_and_profile)
        if not updated_user:
            raise HTTPException(status_code=404, detail="User not found")
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Error updating user: {e}")
        raise HTTPException(status_code=400, detail="Failed to update user")
   

@router.post('/email_otp_verify')
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
        
        access_token = create_access_token({"sub": str(user_details.id)})  # Convert to string
        refresh_token = create_refresh_token({"sub": str(user_details.id)})     
        
        response = JSONResponse(
            content={'user': {
                'access_token': access_token,
                'id': user_details.id,
                'email': user_details.email_address,
                'name': user_details.name,
                'role': user_details.role,
                'is_verified': user_details.is_verified,#uses this field to know whther the user is verified or not
                'is_active': user_details.is_active,#uses this field to know whther the user is verified or not
            }}        )
        # Set refresh token in secure HTTP-only cookie
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

@router.post('/forgetpassword')
async def forgetpassword(
    email_schema: users.ForgetPasswordSchema,session: AsyncSession = Depends(get_session)
):
    try:
        db_user = await crud.get_user_by_email(session, email_schema.email)
        if db_user:
            otp = otp_generate()  # simple 6-digit OTP
            await redis_client.delete(f"otp:{email_schema.email}")
            await redis_client.set(f"otp:{email_schema.email}", otp, ex=300)
            # background_tasks.add_task(send_otp_email,email_schema.email, otp)
            # Use Celery instead of background task
            send_otp_email.delay(email_schema.email, otp)
            return JSONResponse(content={"status": "success"}, status_code=200)

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email"
        )

    except HTTPException as http_exc:
        raise http_exc  # re-raise known HTTP exceptions

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Something went wrong. Please try again later."
        )
    
@router.post('/forget_password_otp_verify')
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

    
    
@router.get('/view_psychologist', response_model=List[users.PsychologistProfileOut])
async def view_psychologist(session: AsyncSession = Depends(get_session)):
    try:
        data = await crud.get_all_psychologist_with_profile(session)
        if not data:
            raise HTTPException(status_code=404, detail="No psychologists found")

        # Parallel rating fetch
        ratings = await gather(
            *(get_psycholgist_rating(p.user_id) for p in data)
        )

        enriched_ratings = [
            users.PsychologistProfileOut(
                id=p.id,
                specialization=p.specialization,
                profile_image=p.profile_image,
                is_verified=p.is_verified,
                is_available=p.is_available,
                user=p.user,
                rating=ratings[i] if ratings[i] is not None else 0.0
            )
            for i, p in enumerate(data)
        ]

        return enriched_ratings

    except HTTPException as http_exc:
        logger.error("HTTP error while fetching psychologists: %s", http_exc)
        raise http_exc

    except Exception as e:
        logger.error("Internal error while fetching psychologists: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error while fetching psychologists.")


@router.patch('/update_availability/{user_id}/{isAvailable}')
async def update_availability(user_id:int,isAvailable:bool,current_user_id: str = Depends(get_current_user),session: AsyncSession = Depends(get_session)):
    try :
        data= await crud.psychologist_availability_update(session,user_id,isAvailable)
        return JSONResponse(content={"status": data}, status_code=200)
    except:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="")
    
@router.patch('/update_psychologist_documents/{user_id}')
async def update_psychologist_documents(user_id:int,identification_doc: Optional[UploadFile] = File(None),education_certificate: Optional[UploadFile] = File(None),
    experience_certificate: Optional[UploadFile] = File(None),current_user_id: str = Depends(get_current_user),session:AsyncSession =Depends(get_session)):
    try:
        if experience_certificate:
            edu_url = await run_in_threadpool(upload_to_cloudinary, experience_certificate, "doctor_verification/education")
            await crud.update_psychologist_documents_crud(session,user_id,edu_url,'edu_url')
        elif identification_doc:
            id_url = await run_in_threadpool(upload_to_cloudinary, identification_doc, "doctor_verification/id")
            await crud.update_psychologist_documents_crud(session,user_id,id_url,'id_url')
        elif education_certificate:
            exp_url = await run_in_threadpool(upload_to_cloudinary, education_certificate, "doctor_verification/experience")
            await crud.update_psychologist_documents_crud(session,user_id,exp_url,'exp_url')
    except Exception as e :
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY,detail='unable to upload image')


@router.get("/get_user_details/{user_id}", response_model=users.UserWithOptionalProfileOut)
async def get_user_details(user_id: int, session: AsyncSession = Depends(get_session)):

    data = await crud.get_user_by_id_for_profile(session,user_id)
    if not data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return data

@router.get("/get_user_details_by_id/{user_id}", response_model=users.UserNameWithProfileImage)
async def get_user_details_by_id(user_id: int, session: AsyncSession = Depends(get_session)):

    data = await crud.get_user_by_id_for_profile(session,user_id)
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
    current_user_id: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    try:
        # Upload files to Cloudinary
        try:
            id_url = await run_in_threadpool(upload_to_cloudinary, id, "doctor_verification/id")
            edu_url = await run_in_threadpool(upload_to_cloudinary, educationalCertificate, "doctor_verification/education")
            exp_url = await run_in_threadpool(upload_to_cloudinary, experienceCertificate, "doctor_verification/experience")
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Cloudinary upload failed: {str(e)}"
            )

        # Save to database
        try:
            await crud.doctor_profile_creation(session,user_id,date_of_birth,experience,gender,fees,qualification,
                specialization,about_me,id_url,edu_url,exp_url)
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}"
            )

        return JSONResponse(content={"status": "success"}, status_code=200)

    except HTTPException as http_exc:
        raise http_exc  # Re-raise to send the correct status and message

    except Exception as e:
        # Fallback for any unexpected errors
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
    id: UploadFile = File(None),  # Optional file
    educationalCertificate: UploadFile = File(None),  # Optional file
    experienceCertificate: UploadFile = File(None),  # Optional file
    current_user_id: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    try:
        # Initialize URLs as None
        id_url = None
        edu_url = None
        exp_url = None
        
        # Upload files to Cloudinary only if they are provided
        try:
            if id and id.filename:  # Check if file exists and has a filename
                id_url = await run_in_threadpool(upload_to_cloudinary, id, "doctor_verification/id")
            
            if educationalCertificate and educationalCertificate.filename:
                edu_url = await run_in_threadpool(upload_to_cloudinary, educationalCertificate, "doctor_verification/education")
            
            if experienceCertificate and experienceCertificate.filename:
                exp_url = await run_in_threadpool(upload_to_cloudinary, experienceCertificate, "doctor_verification/experience")
                
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Cloudinary upload failed: {str(e)}"
            )
        print(user_id,date_of_birth,experience,gender,fees,qualification,specialization,about_me,id_url, edu_url,exp_url,'ikkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk')
        
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
                id_url=id_url,  # Will be None if not provided
                edu_url=edu_url,  # Will be None if not provided
                exp_url=exp_url  # Will be None if not provided
            )
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}"
            )

        return JSONResponse(content={"status": "success", "message": "Doctor profile updated successfully"}, status_code=200)

    except HTTPException as http_exc:
        raise http_exc  # Re-raise to send the correct status and message

    except Exception as e:
        # Fallback for any unexpected errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/admin_view_users")
async def admin_view_users(current_user_id: str = Depends(get_current_user),session: AsyncSession = Depends(get_session)):
    try:
        result = await crud.get_all_users(session)
        return result
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
        
@router.get("/admin_view_psychologist")
async def admin_view_psychologist(current_user_id: str = Depends(get_current_user),session: AsyncSession = Depends(get_session)):
    try:
        result = await crud.get_all_psychologist(session)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve users"
        )
        
@router.patch('/toggle_user_status/{user_id}')
async def toggle_user_status(user_id:int,current_user_id: str = Depends(get_current_user),session: AsyncSession = Depends(get_session)):
    try :
        data= await crud.toggle_user_status_by_id(session,user_id)
        return JSONResponse(content={"status": data}, status_code=200)
    except:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="")
    
    
@router.patch('/update_user_profile_image/{user_id}')
async def toggle_user_status(user_id:int,profile_image: UploadFile = File(...),current_user_id: str = Depends(get_current_user),session: AsyncSession = Depends(get_session)):
    try :
        profile_url = await run_in_threadpool(upload_to_cloudinary, profile_image, "profile_images/id")
        data= await crud.update_user_profile_image(session,user_id,profile_url)
        return JSONResponse(content={"status": data}, status_code=200)
    except:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="")
    
@router.patch('/update_psychologist_profile_image/{user_id}')
async def toggle_user_status(user_id:int,profile_image: UploadFile = File(...),current_user_id: str = Depends(get_current_user),session: AsyncSession = Depends(get_session)):
    try :
        profile_url = await run_in_threadpool(upload_to_cloudinary, profile_image, "profile_images/id")
        data= await crud.update_user_psychologist_image(session,user_id,profile_url)
        return JSONResponse(content={"status": data}, status_code=200)
    except:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="")
    
    
@router.patch('/change_psychologist_verification/{user_id}/{status}')
async def change_psychologist_verification(user_id:int,status:str,current_user_id: str = Depends(get_current_user),session: AsyncSession = Depends(get_session)):
    try :
        data= await crud.toggle_psychologist_status_by_id(session,user_id,status)
        return JSONResponse(content={"status": data}, status_code=200)
    except:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="")
    
@router.put('/revoke_psychologist_verification/{user_id}')
async def change_psychologist_verification(user_id:int,revoke_details:users.RevokeDetails,current_user_id: str = Depends(get_current_user),session: AsyncSession = Depends(get_session)):
    try :
        data= await crud.revoke_psychologist_status_by_id(session,user_id,revoke_details)
        return JSONResponse(content={"status": data}, status_code=200)
    except:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="")
    
    



@router.post("/refresh_token")
async def refresh_token(request: Request):
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

    new_access_token = create_access_token(data={"sub": user_id})
    return {
        "access_token": new_access_token,
        "token_type": "bearer"
    }
