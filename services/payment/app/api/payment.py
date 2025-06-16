from fastapi import APIRouter, Depends, HTTPException, status,Form, File,UploadFile,BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.concurrency import run_in_threadpool
from typing import List
from sqlalchemy import select,update
from dependencies.database import get_session
import crud.crud as crud
from schemas.payment import RazorpayOrder,WalletWithTransactionsOut,WalletBalanceOut,UserConsultationMoney
from fastapi.responses import JSONResponse
from fastapi.logger import logger
from datetime import date 
from fastapi import HTTPException
from dependencies.razorpay import create_razorpay_order
from crud.crud import money_to_wallet,get_wallet_balance_by_id,money_from_wallet
import os
from dotenv import load_dotenv
load_dotenv()


router = APIRouter(tags=["payments"])


from fastapi import HTTPException
from razorpay.errors import BadRequestError, ServerError

@router.post("/create_razorpay_order")
async def create_razorpay_orders(
    rzrpay_schema: RazorpayOrder,
    session: AsyncSession = Depends(get_session)
):
    try:
        razorpay_order = await create_razorpay_order(rzrpay_schema.totalAmount)
        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content={
                "razorpay_order_id": razorpay_order["id"],
                "currency": razorpay_order["currency"],
                "amount": rzrpay_schema.totalAmount,
            }
        )
    except (BadRequestError, ServerError) as e:
        raise HTTPException(status_code=400, detail=f"Razorpay error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/add_money_to_wallet")
async def add_money_to_wallet(
    rzrpay_schema: RazorpayOrder,
    session: AsyncSession = Depends(get_session)
):
    try:
        await money_to_wallet(session, rzrpay_schema.user_id, rzrpay_schema.totalAmount)
        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content={"status": "success"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {str(e)}"
        )
        
@router.post("/fetch_money_from_wallet")
async def fetch_money_from_wallet(
    fetch_money_schema: UserConsultationMoney,
    session: AsyncSession = Depends(get_session)
):
    try:
        await money_from_wallet(session, fetch_money_schema.user_id, fetch_money_schema.psychologist_fee)
        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content={"status": "success"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {str(e)}"
        )


@router.get('/get_wallet_details_with_transactions/{user_id}', response_model=WalletWithTransactionsOut)
async def get_wallet_details_with_transactions(user_id : int ,session: AsyncSession = Depends(get_session)):
    try:
        data = await crud.get_wallet_details_with_transactions_by_id(session,user_id)
        return data
    except HTTPException as http_exc:
        logger.error('dddfdddd',http_exc)
        raise http_exc
    
    except Exception as e:
        logger.error('dddfdddd',e)
        
        raise HTTPException(status_code=500, detail="Internal server error while fetching wallet.")  
    
    
@router.get("/get_wallet_balance/{user_id}", response_model=WalletBalanceOut)
async def get_wallet_balance(user_id: int, session: AsyncSession = Depends(get_session)):
    try:
        wallet = await get_wallet_balance_by_id(session, user_id)
        if not wallet:
            raise HTTPException(status_code=404, detail="Wallet not found.")
        return wallet
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error while fetching wallet balance.")
    
@router.get("/get_wallet_balance/{user_id}", response_model=WalletBalanceOut)
async def get_wallet_balance(user_id: int, session: AsyncSession = Depends(get_session)):
    try:
        wallet = await get_wallet_balance_by_id(session, user_id)
        if not wallet:
            raise HTTPException(status_code=404, detail="Wallet not found.")
        return wallet
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error while fetching wallet balance.")
    
    
# @router.post("/signup", response_model=users.UserOut)
# async def create_user(user: users.UserCreate,background_tasks: BackgroundTasks, session: AsyncSession = Depends(get_session)):
#     db_user = await crud.get_user_by_email(session, user.email_address)
#     if db_user:
#         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
#     new_user = await crud.create_user(session, user)
#     otp = otp_generate()  # simple 6-digit OTP
#     await redis_client.set(f"otp:{user.email_address}", otp, ex=300)
#     background_tasks.add_task(send_otp_email, user.email_address, otp)
#     return new_user



# @router.put("/update_user_details/{user_id}")
# async def update_user_details(user_id: int, user_and_profile: users.UserWithOptionalProfileOut, session: AsyncSession = Depends(get_session)):
#     try:
#         updated_user = await crud.update_user_and_profile(session, user_id, user_and_profile)
#         if not updated_user:
#             raise HTTPException(status_code=404, detail="User not found")
#         return {"status": "success"}
#     except Exception as e:
#         logger.error(f"Error updating user: {e}")
#         raise HTTPException(status_code=400, detail="Failed to update user")
   
# @router.put("/update_psychologist_details/{user_id}")
# async def update_psychologist_details(user_id: int, user_and_profile: users.DoctorVerificationOut, session: AsyncSession = Depends(get_session)):
#     try:
#         updated_user = await crud.update_psychologist_and_profile(session, user_id, user_and_profile)
#         if not updated_user:
#             raise HTTPException(status_code=404, detail="User not found")
#         return {"status": "success"}
#     except Exception as e:
#         logger.error(f"Error updating user: {e}")
#         raise HTTPException(status_code=400, detail="Failed to update user")
   
   
   

# @router.post('/email_otp_verify')
# async def verify_email_otp(otp_schema:users.OtpVerification,session: AsyncSession = Depends(get_session)):
#     stored_otp = await redis_client.get(f"otp:{otp_schema.email}")
#     if otp_schema.otp == stored_otp:
#         await crud.update_user_status_email(session,otp_schema.email)
#         await redis_client.delete(f"otp:{otp_schema.email}")
#         return JSONResponse(content={"status": "success"}, status_code=200)
#     else:
#         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="")
    
    
    
# @router.post('/login')
# async def login(    login_schema: users.LoginSchema, session: AsyncSession = Depends(get_session)):
#     user_details = await crud.get_user_by_email(session, login_schema.email)
#     if user_details and verify_password(login_schema.password, user_details.password):
        
#         access_token = create_access_token({"id": user_details.id})
#         refresh_token = create_refresh_token({"id": user_details.id})
        
#         response = JSONResponse(
#             content={'user': {
#                 'access_token': access_token,
#                 'id': user_details.id,
#                 'email': user_details.email_address,
#                 'name': user_details.name,
#                 'role': user_details.role,
#                 'is_verified': user_details.is_verified,#uses this field to know whther the user is verified or not
#                 'is_active': user_details.is_active,#uses this field to know whther the user is verified or not
#             }}        )
#         # Set refresh token in secure HTTP-only cookie
#         response.set_cookie(
#             key="refresh_token",
#             value=refresh_token,
#             httponly=True,
#             secure=True,
#             samesite="strict"
#         )
#         return response
#     else:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Invalid email or password"
#         )

# @router.post('/forgetpassword')
# async def forgetpassword(
#     email_schema: users.ForgetPasswordSchema,background_tasks: BackgroundTasks,
#     session: AsyncSession = Depends(get_session)
# ):
#     try:
#         db_user = await crud.get_user_by_email(session, email_schema.email)
#         if db_user:
#             otp = otp_generate()  # simple 6-digit OTP
#             print(otp)
#             await redis_client.delete(f"otp:{email_schema.email}")
#             await redis_client.set(f"otp:{email_schema.email}", otp, ex=300)
#             background_tasks.add_task(send_otp_email,email_schema.email, otp)
#             return JSONResponse(content={"status": "success"}, status_code=200)

#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Invalid email"
#         )

#     except HTTPException as http_exc:
#         raise http_exc  # re-raise known HTTP exceptions

#     except Exception as e:
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail="Something went wrong. Please try again later."
#         )
    

    
    


# @router.patch('/update_availability/{user_id}')
# async def update_availability(user_id:int,session: AsyncSession = Depends(get_session)):
#     try :
#         data= await crud.psychologist_availability_update(session,user_id)
#         return JSONResponse(content={"status": data}, status_code=200)
#     except:
#         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="")
    


# @router.get("/get_user_details/{user_id}", response_model=users.UserWithOptionalProfileOut)
# async def get_user_details(user_id: int, session: AsyncSession = Depends(get_session)):

#     data = await crud.get_user_by_id_for_profile(session,user_id)
#     if not data:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
#     return data


# @router.get("/get_psycholgist_details/{user_id}", response_model=users.DoctorVerificationOut)
# async def get_psycholgist_details(user_id: int, session: AsyncSession = Depends(get_session)):
#     try:
#         try:
#             data = await crud.get_psycholgist_by_id(session, user_id)
#         except Exception as e:
#             raise HTTPException(
#                 status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#                 detail=f"Database error: {str(e)}"
#             )

#         if not data:
#             raise HTTPException(
#                 status_code=status.HTTP_404_NOT_FOUND,
#                 detail="User not found"
#             )

#         return data

#     except HTTPException as http_exc:
#         raise http_exc

#     except Exception as e:
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail=f"Internal server error: {str(e)}"
#         )

# @router.post("/doctor_verification/{user_id}")
# async def doctor_verification(
#     user_id: int,
#     dateOfBirth: date = Form(...),
#     experience: str = Form(...),
#     gender: str = Form(...),
#     fees: int = Form(...),
#     qualification: str = Form(...),
#     specialization: str = Form(...),
#     aboutMe: str = Form(...),
#     id: UploadFile = File(...),
#     educationalCertificate: UploadFile = File(...),
#     experienceCertificate: UploadFile = File(...),
#     session: AsyncSession = Depends(get_session),
# ):
#     try:
#         # Upload files to Cloudinary
#         try:
#             id_url = await run_in_threadpool(upload_to_cloudinary, id, "doctor_verification/id")
#             edu_url = await run_in_threadpool(upload_to_cloudinary, educationalCertificate, "doctor_verification/education")
#             exp_url = await run_in_threadpool(upload_to_cloudinary, experienceCertificate, "doctor_verification/experience")
#         except Exception as e:
#             raise HTTPException(
#                 status_code=status.HTTP_502_BAD_GATEWAY,
#                 detail=f"Cloudinary upload failed: {str(e)}"
#             )

#         # Save to database
#         try:
#             await crud.doctor_profile_creation(session,user_id,dateOfBirth,experience,gender,fees,qualification,
#                 specialization,aboutMe,id_url,edu_url,exp_url)
            
#         except Exception as e:
#             raise HTTPException(
#                 status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#                 detail=f"Database error: {str(e)}"
#             )

#         return JSONResponse(content={"status": "success"}, status_code=200)

#     except HTTPException as http_exc:
#         raise http_exc  # Re-raise to send the correct status and message

#     except Exception as e:
#         # Fallback for any unexpected errors
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail=f"Internal server error: {str(e)}"
#         )


# @router.get("/admin_view_users")
# async def admin_view_users(session: AsyncSession = Depends(get_session)):
#     try:
#         result = await crud.get_all_users(session)
#         return result
#     except Exception as e:
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail="Failed to retrieve users"
#         )
        
# @router.get("/admin_view_psychologist")
# async def admin_view_psychologist(session: AsyncSession = Depends(get_session)):
#     try:
#         result = await crud.get_all_psychologist(session)
#         return result
#     except Exception as e:
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail="Failed to retrieve users"
#         )
        
# @router.patch('/toggle_user_status/{user_id}')
# async def toggle_user_status(user_id:int,session: AsyncSession = Depends(get_session)):
#     try :
#         data= await crud.toggle_user_status_by_id(session,user_id)
#         return JSONResponse(content={"status": data}, status_code=200)
#     except:
#         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="")
    
    
# @router.patch('/update_user_profile_image/{user_id}')
# async def toggle_user_status(user_id:int,profile_image: UploadFile = File(...),session: AsyncSession = Depends(get_session)):
#     try :
#         profile_url = await run_in_threadpool(upload_to_cloudinary, profile_image, "profile_images/id")
#         data= await crud.update_user_profile_image(session,user_id,profile_url)
#         return JSONResponse(content={"status": data}, status_code=200)
#     except:
#         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="")
    
# @router.patch('/update_psychologist_profile_image/{user_id}')
# async def toggle_user_status(user_id:int,profile_image: UploadFile = File(...),session: AsyncSession = Depends(get_session)):
#     try :
#         profile_url = await run_in_threadpool(upload_to_cloudinary, profile_image, "profile_images/id")
#         data= await crud.update_user_psychologist_image(session,user_id,profile_url)
#         return JSONResponse(content={"status": data}, status_code=200)
#     except:
#         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="")
    
    
# @router.patch('/change_psychologist_verification/{user_id}')
# async def change_psychologist_verification(user_id:int,session: AsyncSession = Depends(get_session)):
#     try :
#         data= await crud.toggle_psychologist_status_by_id(session,user_id)
#         return JSONResponse(content={"status": data}, status_code=200)
#     except:
#         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="")