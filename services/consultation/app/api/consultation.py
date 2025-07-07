from fastapi import APIRouter, Depends, HTTPException,status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from dependencies.database import get_session
import crud.crud as crud
from schemas.consultation import PaginatedConsultationResponse,CompliantSchema,ConsultationResponseUser,NotificationResponse,FeedbackCreationSchema
from schemas.consultation import CreateConsultationSchema,ConsultationResponse,ConsultationResponseUserCompliant,MappingResponse,MappingResponseUser ,CompliantSchemaa
from schemas.consultation import UpdateConsultationSchema,CreateFeedbackSchema,CreateNotificationSchema,PaginatedNotificationResponse
from schemas.consultation import CompliantPaginatedResponse,UpdateComplaintSchema,UserNameWithProfileImage,UserProfileImage,TokenRequest
from fastapi.logger import logger
from datetime import datetime 
# from starlette.websockets import WebSocketState  # ✅ correct
from crud.crud import count_consultations,get_complaints_crud,register_complaint_crud,consultation_for_user,get_all_notifications,update_consultation_status
from crud.crud import doctor_dashboard_details_crud,admin_dashboard_details_crud,save_chat_message_with_attachments,get_doctor_fee_after_platform_fee
from crud.crud import get_psychologist_rating_crud,get_feedbacks_crud,count_consultations_by_doctor_crud,consultation_for_doctor,consultation_details_with_id
from crud.crud import create_notification,create_consultation,get_all_consultation,get_doctor_consultations,get_all_mapping_for_chat
from crud.crud import get_chat_messages_using_cons_id,get_all_mapping_for_chat_user,update_analysis_consultation,save_recording_database
from crud.crud import create_feedback,count_notifications,get_notifications_crud,count_compliants,get_compliants_crud,update_complaints_curd
from infra.external.user_service import get_user_details,get_doctor_details,get_minimal_user_details
from infra.external.payment_service import fetch_money_from_wallet,add_money_to_wallet
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict
import asyncio
import logging
import requests
from requests.auth import HTTPBasicAuth
import os
import re
from fastapi import Query
from asyncio import gather
import aiofiles
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, UploadFile, File, Form, HTTPException,Request
from fastapi.responses import FileResponse,JSONResponse
from pathlib import Path
from typing import Optional
TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID', default=None)
TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN', default=None)
import uuid
from slowapi import Limiter
from slowapi.util import get_remote_address
import json
from dependencies.get_current_user import get_current_user
from sqlalchemy.ext.asyncio import AsyncSession
from dotenv import load_dotenv
load_dotenv()
from uuid import uuid4
from fastapi.concurrency import run_in_threadpool
from utils.cloudinary_utils import upload_to_cloudinary
from utils.zego_server_assistant import generate_token04, TokenInfo

router = APIRouter(tags=["consultations"])


logger = logging.getLogger("uvicorn.error")

ZEGO_APP_ID = int(os.getenv("ZEGO_APP_ID"))
ZEGO_SERVER_SECRET = os.getenv("ZEGO_SERVER_SECRET")


# Configuration
RECORDINGS_DIR = "recordings"
os.makedirs(RECORDINGS_DIR, exist_ok=True)

# In-memory storage for tracking recording parts (use DB in production)
recording_sessions = {}

import subprocess
from pathlib import Path

@router.post("/recordings")
async def upload_recording(
    file: UploadFile = File(...),
    roomId: str = Form(...),
    userId: str = Form(...),
    isFinal: str = Form(...),
    session: AsyncSession = Depends(get_session)
):
    try:
        is_final = isFinal.lower() == 'true'
        session_id = f"{roomId}_{userId}"
        recordings_dir = Path(RECORDINGS_DIR).absolute()  # Use absolute path

        # Debug info
        print(f"\nReceived {'FINAL' if is_final else 'chunk'} recording from {userId}")
        print(f"File size: {file.size} bytes")
        print(f"Content type: {file.content_type}")
        print(f"Base recordings directory: {recordings_dir}")

        # Validation
        if not file.content_type.startswith('video/'):
            raise HTTPException(status_code=400, detail="Only video files are accepted")

        contents = await file.read()
        if len(contents) == 0:
            raise HTTPException(status_code=400, detail="Empty file received")

        # Create session-specific directory
        session_dir = recordings_dir / session_id
        session_dir.mkdir(exist_ok=True, parents=True)
        print(f"Session directory: {session_dir}")

        # Save chunk with unique name in session directory only
        chunk_filename = f"chunk_{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}.webm"
        chunk_path = session_dir / chunk_filename
        
        with open(chunk_path, 'wb') as f:
            f.write(contents)
        print(f"Saved chunk to: {chunk_path}")

        # Initialize/update session tracking
        if session_id not in recording_sessions:
            recording_sessions[session_id] = {
                'chunks': [],
                'created_at': datetime.now(),
                'session_dir': str(session_dir)  # Track the directory
            }
        
        recording_sessions[session_id]['chunks'].append(str(chunk_path))
        recording_sessions[session_id]['last_updated'] = datetime.now()

        # Process final chunk
        if is_final:
            final_filename = f"recording_{session_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.webm"
            final_path = recordings_dir / final_filename
            
            print(f"\nCombining {len(recording_sessions[session_id]['chunks'])} chunks...")
            print(f"Final path: {final_path}")

            # Create concat list file in session directory
            concat_file = session_dir / "concat.txt"
            with open(concat_file, 'w') as f:
                for chunk in recording_sessions[session_id]['chunks']:
                    f.write(f"file '{chunk}'\n")

            # Combine using ffmpeg
            try:
                subprocess.run([
                    'ffmpeg',
                    '-f', 'concat',
                    '-safe', '0',
                    '-i', str(concat_file),
                    '-c', 'copy',
                    '-y',
                    str(final_path)
                ], check=True)
                print("Successfully combined chunks")
            except subprocess.CalledProcessError as e:
                print(f"FFmpeg error: {e}")
                raise HTTPException(status_code=500, detail="Failed to combine video chunks")

            # Clean up - remove all chunks and session directory
            print("Cleaning up temporary files...")
            for chunk in recording_sessions[session_id]['chunks']:
                try:
                    Path(chunk).unlink(missing_ok=True)
                except Exception as e:
                    print(f"Error deleting chunk {chunk}: {e}")

            try:
                concat_file.unlink(missing_ok=True)
                session_dir.rmdir()  # Only works if directory is empty
            except Exception as e:
                print(f"Error cleaning up session dir: {e}")

            # Verify final file exists
            if not final_path.exists():
                raise HTTPException(status_code=500, detail="Final recording not created")

            # Remove session tracking
            del recording_sessions[session_id]

            # Save to database
            final_url = f"/recordings/{final_filename}"
            
            consultation_id=int(roomId[4:])
            await save_recording_database(session, final_url, consultation_id)

            return JSONResponse({
                "status": "success",
                "message": "Recording completed",
                "finalUrl": final_url,  
                "fileSize": final_path.stat().st_size
            })

        return JSONResponse({
            "status": "success",
            "message": "Chunk uploaded",
            "chunkSize": len(contents),
            "totalChunks": len(recording_sessions[session_id]['chunks'])
        })

    except Exception as e:
        print(f"\nError processing recording: {str(e)}", flush=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/recordings/{filename}")
async def get_recording(filename: str):
    try:
        file_path = os.path.join(RECORDINGS_DIR, filename)
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Recording not found")

      
        from fastapi.responses import FileResponse
        return FileResponse(
            file_path,
            media_type="video/webm",
            filename=filename
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Cleanup old sessions (run periodically)
def cleanup_old_sessions(hours_old=24):
    now = datetime.now()
    for session_id, session_data in list(recording_sessions.items()):
        if (now - session_data['last_updated']).total_seconds() > hours_old * 3600:
            print(f"Cleaning up old session: {session_id}")
            try:
                session_dir = os.path.join(RECORDINGS_DIR, session_id)
                for chunk in session_data['chunks']:
                    if os.path.exists(chunk):
                        os.remove(chunk)
                if os.path.exists(session_dir):
                    os.rmdir(session_dir)
                del recording_sessions[session_id]
            except Exception as e:
                print(f"Error cleaning up session {session_id}: {e}")


def generate_zego_token(user_id: str, room_id: str) -> dict:
    """Generate a ZEGOCLOUD token"""
    app_id = int(os.getenv("ZEGO_APP_ID")) 
    server_secret = os.getenv("ZEGO_SERVER_SECRET")  
    effective_time = 3600  # 1 hour expiry

    # Payload for room privileges
    payload = json.dumps({
        "room_id": room_id,
        "privilege": {1: 1, 2: 1}  # 1=Login, 2=Publish
    })

    # Generate token
    token_info: TokenInfo = generate_token04(
        app_id=app_id,
        user_id=user_id,
        secret=server_secret,
        effective_time_in_seconds=effective_time,
        payload=payload
    )

    if token_info.error_code != 0:
        raise Exception(f"Token generation failed: {token_info.error_message}")

    return {
        "token": token_info.token,
        "app_id": app_id
    }

@router.post("/generate-token")
async def generate_token(data :TokenRequest):
    try:
        token_data = generate_zego_token(data.user_id, data.room_id)
        return token_data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    
@router.post("/create_consultation")
async def create_consultation_route(data: CreateConsultationSchema,current_user_id: str = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    try:
        await fetch_money_from_wallet(data.dict())
        
        return await create_consultation(session, data)
    except Exception as e:
        logger.info(f"Error creating user: {e}")
        raise HTTPException(status_code=400, detail="Failed to update user")
    
@router.post("/register_complaint")
async def register_complaint_route(data:CompliantSchemaa,current_user_id: str = Depends(get_current_user),session: AsyncSession = Depends(get_session)
):
    try:
        complaint = await register_complaint_crud(session, data)
        return complaint

    except Exception as e:
        logger.error(f"Error creating complaint: {e}")
        raise HTTPException(status_code=400, detail="Failed to create complaint")
    
@router.post("/add_feedback")
async def add_feedback(data: FeedbackCreationSchema,current_user_id: str = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    try:
        return await create_feedback(session, data)
    except Exception as e:
        logger.info(f"Error creating feedback: {e}")
        raise HTTPException(status_code=400, detail="Failed to create feedback")
    
    
@router.post("/create_new_notification")
async def create_new_notification(data: CreateNotificationSchema,current_user_id: str = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    try:
        return await create_notification(session, data)
    except Exception as e:
        logger.info(f"Error creating notification: {e}")
        raise HTTPException(status_code=400, detail="Failed to create notification")
    
@router.put("/set_analysis_from_doctor")
async def set_analysis_from_doctor(data: UpdateConsultationSchema,current_user_id: str = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    try:
        await update_analysis_consultation(session, data)
        income = await get_doctor_fee_after_platform_fee(session,data.consultation_id)
        data={'user_id':current_user_id,'totalAmount':income}
        await add_money_to_wallet(data)

    except Exception as e:
        logger.info(f"Error creating user: {e}")
        raise HTTPException(status_code=400, detail="Failed to update user")
    
@router.put("/update_consultation_status/{status}/{consultation_id}")
async def update_consultation_status_route(status: str,consultation_id:int,current_user_id: str = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    try:
        return await update_consultation_status(session,status,consultation_id)
    except Exception as e:
        logger.info(f"Error creating user: {e}")
        raise HTTPException(status_code=400, detail="Failed to update user")
    
@router.get("/get_all_notifications", response_model=List[NotificationResponse])
async def get_all_notifications_route(current_user_id: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    Notification = await get_all_notifications(session)
    if not Notification:
        raise HTTPException(status_code=404, detail="Notifications not found")
    return Notification

@router.get("/get_consultation", response_model=List[ConsultationResponse])
async def get_consultation(current_user_id: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    consultation = await get_all_consultation(session)
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")
    return consultation

@router.get("/get_consultation_mapping_for_chat/{doctorId}", response_model=List[MappingResponse])
async def get_consultation(doctorId:int,current_user_id: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    try:
        consultation = await get_all_mapping_for_chat(session,doctorId)
        
        if not consultation:
            raise HTTPException(status_code=404, detail="Consultation not found")
        enriched_consultations=[]
        for consult in consultation:
            user_data = await get_user_details(consult.user_id) 
            enriched_consultations.append(MappingResponse(
                id=consult.id,
                user_id=consult.user_id,
                psychologist_id=consult.psychologist_id,
                user=user_data  
            ))

        return enriched_consultations

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/get_consultation_mapping_for_user_chat/{userId}", response_model=List[MappingResponseUser])
async def get_consultation_mapping_for_user_chat(userId:int,current_user_id: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    try:
        
        consultation = await get_all_mapping_for_chat_user(session,userId)
    
        if not consultation:
            raise HTTPException(status_code=404, detail="Consultation not found")
        enriched_consultations=[]
        for consult in consultation:
            user_data = await get_doctor_details(consult.psychologist_id) 
            enriched_consultations.append(MappingResponseUser(
                id=consult.id,
                user_id=consult.user_id,    
                psychologist_id=consult.psychologist_id,
                user=user_data  
            ))

        return enriched_consultations

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    
    
@router.get("/get_consulted_user_details/{doctorId}", response_model=List[ConsultationResponse])
async def get_consultation(doctorId:int,current_user_id: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    consultation = await get_doctor_consultations(session,doctorId)
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")
    return consultation



@router.get("/turn-credentials")
async def get_turn_credentials():
    url = await f"https://api.twilio.com/2025-06-20/Accounts/{TWILIO_ACCOUNT_SID}/Tokens.json"
    response = requests.post(url, auth=HTTPBasicAuth(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN))
    return {"iceServers": response.json()["ice_servers"]}



@router.get('/get_chat_messages/{consultation_id}')
async def get_chat_messages(
    consultation_id: int,current_user_id: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    try:
        messages = await get_chat_messages_using_cons_id(session, consultation_id)
        return messages
    except Exception as e:
        logger.error(f"Error fetching messages: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch messages")

    
@router.get('/get_complaints/{user_id}',response_model=List[CompliantSchema])
async def get_complaints_route(user_id:int,current_user_id: str = Depends(get_current_user),session : AsyncSession = Depends(get_session)):
    try:
        complaints = await get_complaints_crud(session,user_id)
        return complaints
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/get_consultation_for_user/{user_id}", response_model=PaginatedConsultationResponse)
async def get_consultation_for_user(
    user_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(10, le=100),current_user_id: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    try:
        total = await count_consultations(session, user_id)
        offset = (page - 1) * limit
        consultations = await consultation_for_user(session, user_id, skip=offset, limit=limit)

        #  Parallel fetch user_data
        user_details_tasks = [
            get_doctor_details(consult.psychologist_id)
            for consult in consultations
        ]
        user_details = await gather(*user_details_tasks)

        #  Combine consultation with corresponding user data
        enriched = [
            ConsultationResponseUser(
                id=consult.id,
                analysis=consult.analysis,
                created_at=consult.created_at,
                status=consult.status,
                duration=consult.duration,
                video=consult.video,
                user=user_details[i]
            )
            for i, consult in enumerate(consultations)
        ]

        next_url = f"/get_consultation_for_user/{user_id}?page={page + 1}&limit={limit}" if offset + limit < total else None
        prev_url = f"/get_consultation_for_user/{user_id}?page={page - 1}&limit={limit}" if page > 1 else None

        return {
            "count": total,
            "next": next_url,
            "previous": prev_url,
            "results": enriched
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@router.get("/get_compliant_consultation/{consultations_id}", response_model=ConsultationResponseUserCompliant)
async def get_compliant_consultation(
    consultations_id: int,
    current_user_id: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    try:
        # Get consultation details
        consultation = await consultation_details_with_id(session, consultations_id)
        if not consultation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Consultation not found"
            )

        # Get user and doctor details
        doctor = await get_doctor_details(consultation.psychologist_id)
        user = await get_user_details(consultation.user_id)
        
        if not doctor or not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Associated user or doctor not found"
            )

        # Build response dictionary
        response_data = {
            "id": consultation.id,
            "analysis": consultation.analysis,
            "created_at": consultation.created_at,
            "status": consultation.status,
            "duration": consultation.duration,
            "video": consultation.video if consultation.video else None,
            "user": {
                "name": user.get('name'),
                "user_profile": {
                    "profile_image": user.get('user_profile', {}).get('profile_image')
                }
            } if user else None,
            "doctor": {
                "name": doctor.get('name'),
                "psychologist_profile": {
                    "profile_image": doctor.get('psychologist_profile', {}).get('profile_image'),
                    "specialization": doctor.get('psychologist_profile', {}).get('specialization')
                }
            } if doctor else None
                }
        return response_data

    except HTTPException as ex:
        logger.error(ex)
        raise
        
    except AttributeError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Missing expected attribute: {str(e)}"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while fetching consultation"
        )
    
@router.get("/doctor_get_consulations/{doctor_id}", response_model=PaginatedConsultationResponse)
async def doctor_get_consulations_route(
    doctor_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(10, le=100),
    ordering: Optional[str] = Query(None, description="Sort field. Use '-' prefix for descending order"),
    current_user_id: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    try:
        total = await count_consultations_by_doctor_crud(session, doctor_id)
        offset = (page - 1) * limit
        consultations = await consultation_for_doctor(session, doctor_id, skip=offset, limit=limit, ordering=ordering)

        # Parallel fetch user_data
        user_details_tasks = [
            get_user_details(consult.user_id)
            for consult in consultations
        ]
        user_details = await gather(*user_details_tasks)

        # Combine consultation with corresponding user data
        enriched = [
            ConsultationResponseUser(
                id=consult.id,
                analysis=consult.analysis,
                created_at=consult.created_at,
                status=consult.status,
                duration=consult.duration,
                video=consult.video,
                user=user_details[i]
            )
            for i, consult in enumerate(consultations)
        ]

        # Build URLs with ordering parameter
        ordering_param = f"&ordering={ordering}" if ordering else ""
        next_url = f"/doctor_get_consulations/{doctor_id}?page={page + 1}&limit={limit}{ordering_param}" if offset + limit < total else None
        prev_url = f"/doctor_get_consulations/{doctor_id}?page={page - 1}&limit={limit}{ordering_param}" if page > 1 else None

        return {
            "count": total,
            "next": next_url,
            "previous": prev_url,
            "results": enriched
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    
@router.get("/get_notifications/", response_model=PaginatedNotificationResponse)
async def get_notifications_route(
    page: int = Query(1, ge=1),
    limit: int = Query(10, le=100),
    current_user_id: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    try:
        total = await count_notifications(session)
        offset = (page - 1) * limit
        notifications = await get_notifications_crud(session, skip=offset, limit=limit)
        next_url = f"/get_notifications?page={page + 1}&limit={limit}" if offset + limit < total else None
        prev_url = f"/get_notifications?page={page - 1}&limit={limit}" if page > 1 else None

        return {
            "count": total,
            "next": next_url,
            "previous": prev_url,
            "results": notifications
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    
@router.get("/get_compliants", response_model=CompliantPaginatedResponse)
async def get_notifications_route( page: int = Query(1, ge=1),limit: int = Query(10, le=100),current_user_id: str = Depends(get_current_user),session: AsyncSession = Depends(get_session),
):
    try:
        total = await count_compliants(session)
        offset = (page - 1) * limit
        compliants = await get_compliants_crud(session, skip=offset, limit=limit)
        next_url = f"/get_compliants?page={page + 1}&limit={limit}" if offset + limit < total else None
        prev_url = f"/get_compliants?page={page - 1}&limit={limit}" if page > 1 else None

        return {
            "count": total,
            "next": next_url,
            "previous": prev_url,
            "results": compliants
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    
@router.patch("/update_complaints/{complaint_id}")
async def update_complaints_route(complaint_id :int ,data: UpdateComplaintSchema,current_user_id: str = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    try:
        return await update_complaints_curd(session, data,complaint_id)
    except Exception as e:
        logger.info(f"Error creating user: {e}")
        raise HTTPException(status_code=400, detail="Failed to update user")


@router.get('/get_psycholgist_rating/{psychologist_id}')
async def get_psychologist_rating_route(psychologist_id: int, session: AsyncSession = Depends(get_session)):
    try:
        avg_rating = await get_psychologist_rating_crud(session, psychologist_id)
        return  avg_rating if avg_rating is not None else 0.0
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    
@router.get('/doctor_dashboard_details/{psychologist_id}/{selectedYear}')
async def doctor_dashboard_details_route(psychologist_id: int,selectedYear:int,current_user_id: str = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    try:
        data = await doctor_dashboard_details_crud(session, psychologist_id,selectedYear)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get('/admin_dashboard_details/{year}')
async def admin_dashboard_details_route(year:int,current_user_id: str = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    try:
        data = await admin_dashboard_details_crud(session,year)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@router.get('/get_feedbacks/{psychologist_id}', response_model=list[CreateFeedbackSchema])
async def get_feedbacks_route(psychologist_id: int,current_user_id: str = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    try:
        feedbacks = await get_feedbacks_crud(session, psychologist_id)
        
        # Get user details for all feedbacks
        user_details = await gather(*(get_minimal_user_details(feedback.user_id) for feedback in feedbacks))
        
        enriched_feedbacks = []
        for feedback, user_detail in zip(feedbacks, user_details):
            # Ensure user_profile is properly structured
            user_profile = None
            if 'user_profile' in user_detail and user_detail['user_profile']:
                user_profile = UserProfileImage(**user_detail['user_profile'])
            
            enriched_feedback = CreateFeedbackSchema(
                id=feedback.id,
                created_at=feedback.created_at,
                consultation_id=feedback.consultation_id,
                rating=feedback.rating,
                user_id=feedback.user_id,
                message=feedback.message,
                user=UserNameWithProfileImage(
                    name=user_detail['name'],
                    user_profile=user_profile
                )
            )
            enriched_feedbacks.append(enriched_feedback)

        return enriched_feedbacks
    except Exception as e:
        logger.error(f"Error fetching feedbacks: {str(e)}", exc_info=True)  
        raise HTTPException(status_code=500, detail="Failed to fetch feedbacks")


# ***************************************VideocallSignaling***********************************************

active_consultations: Dict[str, Dict] = {}
# Store active connections
active_connections: Dict[str, WebSocket] = {}
connection_lock = asyncio.Lock()

VALIDATION_RULES = {
    "call-initiate": ["offer", "senderId", "targetId","consultation_id"],
    "call-answer": ["answer", "senderId", "targetId"],
    "ice-candidate": ["candidate", "senderId", "targetId"],
    "call-rejected": ["senderId", "targetId"],
     "call-end": ["senderId", "targetId", "sender", "consultationId", "duration", "timestamp"]
}


@router.websocket("/ws/create_signaling/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await websocket.accept()
    
    # Add connection
    async with connection_lock:
        active_connections[user_id] = websocket
        logger.info(f"[CONNECT] User {user_id} connected. Active connections: {list(active_connections.keys())}")

    try:
        while True:
            try:
                data = await websocket.receive_json()
                logger.info(f"[RECEIVED] From {user_id}: {data}")
            except WebSocketDisconnect:
                logger.info(f"[DISCONNECT] User {user_id} disconnected")
                break
            except Exception as e:
                logger.info(f"[ERROR] JSON error from {user_id}: {str(e)}")
                continue

            # Validate message
            msg_type = data.get("type")
            if not msg_type:
                logger.info(f"[ERROR] Missing type in message from {user_id}")
                continue
            
             # Handle call-end message
            if msg_type == 'call-end':
                try:
                    # Forward the call-end message to the other party
                    await target_connection.send_json({
                        "type": "call-end",
                        "senderId": data["senderId"],
                        "sender": data["sender"],
                        'consultationId': data["consultationId"],  
                        'duration': data["duration"],
                        'timestamp': data["timestamp"]
                    })
                    logger.info(f"[CALL-END] Sent call-end to {target_id} from {data['senderId']}")
                except Exception as e:
                    logger.warning(f"[ERROR] Failed to forward call-end to {target_id}: {e}")
                
                # Clean up consultation state
                targetId = data["targetId"]
                sender_id = data["senderId"]
                if data["sender"] == "user":
                    # Logic to remove or close consultation if user ends the call
                    if targetId in active_consultations:
                        del active_consultations[targetId]
                        logger.info(f"[CONSULTATION] Ended consultation for user {targetId}")
                elif data["sender"] == "doctor":
                    
                    logger.info(f"[CONSULTATION] Doctor {sender_id} ended the call.")
                
                continue
            
            # Validate target ID
            target_id = str(data["targetId"])  # Ensure string type
            if not target_id:
                logger.info(f"[ERROR] Missing targetId in message from {user_id}")
                continue

            # Get target connection - IMPORTANT: Do this WITHIN the lock
            async with connection_lock:
                target_connection = active_connections.get(target_id)
                
                if not target_connection:
                    logger.info(f"[ERROR] Target {target_id} not found in active connections")
                    continue
                    
                # Verify connection is still open
                if target_connection.client_state == "disconnected":
                    logger.info(f"[ERROR] Target {target_id} is disconnected")
                    continue

                # Try to forward message
                try:
                    logger.info(f"[FORWARDING] {msg_type} from {user_id} to {target_id}")
                    await target_connection.send_json(data)
                    logger.info(f"[SUCCESS] Forwarded {msg_type} to {target_id}")
                    
                    # Send acknowledgment
                    await websocket.send_json({
                        "type": "message-ack",
                        "originalType": msg_type,
                        "status": "delivered",
                        "to": target_id
                    })
                except Exception as e:
                    logger.info(f"[FAILED] Could not forward to {target_id}: {str(e)}")
                    # Clean up dead connection
                    if "disconnected" in str(e).lower():
                        active_connections.pop(target_id, None)
                        
            

    except Exception as e:
        logger.info(f"[CRASH] User {user_id} error: {str(e)}")
    finally:
        async with connection_lock:
            active_connections.pop(user_id, None)
            logger.info(f"[DISCONNECTED] User {user_id} removed. Remaining: {list(active_connections.keys())}")
            
    

# # ***************************************Chat***********************************************
# # In-memory storage (consider Redis for production)
# chat_endpoints.py - Enhanced WebSocket and File Upload Endpoints
# Configuration




# Constants and configurations
UPLOAD_DIR = Path("uploads/chat_files")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
MAX_MESSAGE_SIZE = 10 * 1024  # 10KB
VALID_SENDER_TYPES = {'patient', 'doctor', 'admin'}

ALLOWED_EXTENSIONS = {
    'image': ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'],
    'video': ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'],
    'audio': ['mp3', 'wav', 'ogg', 'aac', 'm4a'],
    'document': ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'],
    'other': ['zip', 'rar', '7z']
}

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

# Global variables for tracking active rooms and locks
active_chat_rooms: Dict[int, List[Dict]] = {}
room_lock = asyncio.Lock()


# Utility functions
def sanitize_filename(filename: str) -> str:
    """Sanitize filename to prevent path traversal"""
    filename = re.sub(r'[^\w\-. ]', '_', filename)
    filename = filename.strip()
    return Path(filename).name

def get_file_category(file_type: str) -> str:
    """Determine file category based on MIME type"""
    if file_type.startswith('image/'):
        return 'image'
    elif file_type.startswith('video/'):
        return 'video'
    elif file_type.startswith('audio/'):
        return 'audio'
    elif file_type in ['application/pdf', 'text/', 'application/msword', 'application/vnd.openxmlformats']:
        return 'document'
    else:
        return 'other'

async def scan_for_viruses(file_path: Path) -> bool:
    """Mock virus scanning function - integrate with real scanner in production"""
    try:
        # In production: integrate with ClamAV or similar
        return True
    except Exception:
        return False

async def validate_file_type(file: UploadFile) -> bool:
    """Validate file type matches its content"""
    try:
        # Read first 261 bytes for magic number detection
        content = await file.read(261)
        await file.seek(0)  # Rewind for actual saving
        
        # In production: use a proper file type detection library
        return True
    except Exception:
        return False

async def cleanup_failed_upload(file_path: Path):
    """Clean up failed uploads"""
    try:
        if file_path.exists():
            file_path.unlink()
    except Exception as e:
        logger.error(f"Failed to cleanup {file_path}: {e}")

# API endpoints
@router.post("/upload_chat_file")
@limiter.limit("5/minute")
async def upload_chat_file(
    request: Request,
    file: UploadFile = File(...),
    consultation_id: int = Form(...),
    sender_id: int = Form(...),
    sender_type: str = Form(...),
    session: AsyncSession = Depends(get_session)
):
    
    """Upload file for chat message"""
    file_path = None
    try:
        # Validate file size
        if file.size > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large")
        
        # Validate sender type
        if sender_type not in VALID_SENDER_TYPES:
            raise HTTPException(status_code=400, detail="Invalid sender type")
        
        # Sanitize filename
        original_filename = sanitize_filename(file.filename)
        if not original_filename:
            raise HTTPException(status_code=400, detail="Invalid filename")
        
        # Validate file type
        file_extension = original_filename.split('.')[-1].lower() if '.' in original_filename else ''
        file_category = get_file_category(file.content_type)
        
        if file_category != 'other':
            allowed_exts = ALLOWED_EXTENSIONS.get(file_category, [])
            if file_extension not in allowed_exts:
                raise HTTPException(status_code=400, detail="File type not allowed")
        
        # Validate file content matches type
        if not await validate_file_type(file):
            raise HTTPException(status_code=415, detail="File content doesn't match type")
        
        # Generate unique filename
        unique_filename = f"{uuid.uuid4()}_{original_filename}"
        file_path = UPLOAD_DIR / unique_filename
        
        
        try:
            file_url = await run_in_threadpool(upload_to_cloudinary, file, "chat_media")
            
        except Exception as e :
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY ,detail=f"Cloudinary upload failed: {str(e)}")
       
        
        # Virus scan
        if not await scan_for_viruses(file_path):
            raise HTTPException(status_code=422, detail="File failed security scan")
        
       
        return {
            "file_id": str(uuid.uuid4()),
            "filename": unique_filename,
            "original_filename": original_filename,
            "file_path": str(file_path),
            "file_url": file_url,
            "file_type": file.content_type,
            "file_size": file.size,
            "upload_status": "success"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"File upload error: {e}", exc_info=True)
        if file_path:
            await cleanup_failed_upload(file_path)
        raise HTTPException(status_code=500, detail="File upload failed")

@router.get("/files/{filename}")
async def get_chat_file(filename: str):
    """Serve uploaded chat files"""
    try:
        sanitized = sanitize_filename(filename)
        file_path = UPLOAD_DIR / sanitized
        
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="File not found")
        
        return FileResponse(file_path)
    except Exception as e:
        logger.error(f"File serve error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to serve file")

@router.websocket("/ws/chat/{consultation_id}")
async def chat_websocket(
    websocket: WebSocket,
    consultation_id: int,
    session: AsyncSession = Depends(get_session)
):
    # Constants
    VALID_SENDER_TYPES = ["doctor", "user"]
    MAX_MESSAGE_SIZE = 2000
    
    await websocket.accept()
    await websocket.send_json({"type": "handshake", "status": "connected"})

    # Initial user identification
    try:
        init_data = await asyncio.wait_for(
            websocket.receive_json(),
            timeout=10.0
        )
        logger.info(f"Initial connection data: {init_data}")

        # Process user_id with type conversion
        user_id = init_data.get("sender_id")
        if isinstance(user_id, str) and user_id.isdigit():
            user_id = int(user_id)
        elif not isinstance(user_id, int):
            await websocket.close(
                code=4003, 
                reason="sender_id must be integer or numeric string"
            )
            return

        user_type = init_data.get("sender_type", "").lower()
        
        if not all([user_id, user_type]):
            await websocket.close(
                code=4003, 
                reason="Missing user_id or user_type"
            )
            return
            
        if user_type not in VALID_SENDER_TYPES:
            await websocket.close(
                code=4003,
                reason=f"Invalid user_type. Must be one of {VALID_SENDER_TYPES}"
            )
            return

    except (asyncio.TimeoutError, WebSocketDisconnect) as e:
        logger.warning(f"Initial connection failed: {str(e)}")
        await websocket.close(code=4001)
        return
    except Exception as e:
        logger.error(f"Unexpected connection error: {str(e)}")
        await websocket.close(code=4002)
        return

    # Register client
    client = {
        "websocket": websocket,
        "user_id": user_id,
        "user_type": user_type,
    }

    async with room_lock:
        # Initialize room if needed
        active_chat_rooms.setdefault(consultation_id, [])
        
        # Remove any existing connection for this user
        active_chat_rooms[consultation_id] = [
            c for c in active_chat_rooms[consultation_id] 
            if c["user_id"] != user_id
        ]
        
        # Add new connection
        active_chat_rooms[consultation_id].append(client)
        logger.info(
            f"New connection: {user_type} {user_id} in room {consultation_id}"
        )

        # Notify other participants
        online_notification = {
            "type": "status",
            "status": "online",
            "user_id": user_id,
            "user_type": user_type,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        for participant in active_chat_rooms[consultation_id]:
            if participant["user_id"] != user_id:
                try:
                    await participant["websocket"].send_json(online_notification)
                except Exception as e:
                    logger.warning(f"Failed to notify participant: {str(e)}")

        # Send current online status to new user
        for participant in active_chat_rooms[consultation_id]:
            if participant["user_id"] != user_id:
                try:
                    await websocket.send_json({
                        "type": "status",
                        "status": "online",
                        "user_id": participant["user_id"],
                        "user_type": participant["user_type"],
                        "timestamp": datetime.utcnow().isoformat()
                    })
                except Exception as e:
                    logger.warning(f"Failed to send participant status: {str(e)}")

    # Main message loop
    try:
        while True:
            try:
                data = await asyncio.wait_for(
                    websocket.receive_json(),
                    timeout=30.0
                )
                
                # Handle ping/pong
                if data.get("type") == "ping":
                    await websocket.send_json({"type": "pong"})
                    continue

                logger.debug(f"Received message: {data}")

                # Process and validate message
                try:
                    # Convert and validate sender_id
                    sender_id = data.get("sender_id")
                    if isinstance(sender_id, str) and sender_id.isdigit():
                        sender_id = int(sender_id)
                        data["sender_id"] = sender_id
                    elif not isinstance(sender_id, int):
                        raise ValueError("sender_id must be integer or numeric string")

                    # Validate other fields
                    sender_type = data.get("sender_type", "").lower()
                    if not all([sender_id, sender_type]):
                        raise ValueError("Missing sender_id or sender_type")
                    
                    if sender_type not in VALID_SENDER_TYPES:
                        raise ValueError(f"Invalid sender_type: {sender_type}")

                    message = data.get("message", "")
                    if len(message) > MAX_MESSAGE_SIZE:
                        raise ValueError(f"Message exceeds {MAX_MESSAGE_SIZE} character limit")

                    message_type = data.get("message_type", "text")
                    attachments = data.get("attachments", [])
                    
                    if not message and not attachments:
                        raise ValueError("Empty message with no attachments")

                except ValueError as e:
                    logger.warning(f"Invalid message format: {str(e)}")
                    await websocket.send_json({
                        "type": "error",
                        "message": str(e),
                        "received_data": data
                    })
                    continue

                # Save to database
                try:
                    message_id = await save_chat_message_with_attachments(
                        session, 
                        message if message else None, 
                        consultation_id, 
                        sender_type,
                        attachments,
                        message_type
                    )
                except Exception as e:
                    logger.error(f"Failed to save message: {str(e)}")
                    await websocket.send_json({
                        "type": "error",
                        "message": "Failed to save message to database"
                    })
                    continue

                # Broadcast message
                broadcast_data = {
                    "type": "message",
                    "id": message_id,
                    "consultation_id": consultation_id,
                    "sender_id": sender_id,
                    "sender_type": sender_type,
                    "message": message,
                    "message_type": message_type,
                    "attachments": attachments,
                    "created_at": datetime.utcnow().isoformat()
                }
                
                async with room_lock:
                    for participant in active_chat_rooms.get(consultation_id, []):
                        try:
                            await participant["websocket"].send_json(broadcast_data)
                        except Exception as e:
                            logger.warning(f"Failed to broadcast to {participant['user_id']}: {str(e)}")

            except asyncio.TimeoutError:
                # Send keepalive ping
                try:
                    await websocket.send_json({"type": "ping"})
                except:
                    break  # Connection lost

    except WebSocketDisconnect:
        logger.info(f"User {user_id} disconnected from room {consultation_id}")
    except Exception as e:
        logger.error(f"Unexpected error in message loop: {str(e)}")
    finally:
        # Clean up connection
        async with room_lock:
            if consultation_id in active_chat_rooms:
                active_chat_rooms[consultation_id] = [
                    c for c in active_chat_rooms[consultation_id] 
                    if c["user_id"] != user_id
                ]

                # Notify others of disconnection
                offline_notification = {
                    "type": "status",
                    "status": "offline",
                    "user_id": user_id,
                    "timestamp": datetime.utcnow().isoformat()
                }
                
                for participant in active_chat_rooms[consultation_id]:
                    try:
                        await participant["websocket"].send_json(offline_notification)
                    except Exception as e:
                        logger.warning(f"Failed to notify of disconnect: {str(e)}")

        try:
            await websocket.close()
        except:
            pass

# # ***************************************Notifications***********************************************

# Global connection tracking
# notifications/websocket.py

# Global connection tracking
active_notification_connections: Dict[int, WebSocket] = {}
connection_lock = asyncio.Lock()

class ConnectionManager:
    def __init__(self):
        self.active_notification_connections: Dict[int, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        async with connection_lock:
            # Close any existing connection for this user
            if user_id in active_notification_connections:
                try:
                    old_ws = active_notification_connections[user_id]
                    if old_ws.client_state.name != "DISCONNECTED":
                        await old_ws.close(code=1000, reason="New connection")
                except Exception as e:
                    logger.warning(f"Error closing old connection for user {user_id}: {e}")
            
            # Store the new connection
            active_notification_connections[user_id] = websocket
            self.active_notification_connections[user_id] = websocket
        
        logger.info(f"User {user_id} connected")

    async def disconnect(self, user_id: int):
        async with connection_lock:
            # Remove from both global and instance dictionaries
            if user_id in active_notification_connections:
                del active_notification_connections[user_id]
            if user_id in self.active_notification_connections:
                del self.active_notification_connections[user_id]
        
        logger.info(f"User {user_id} disconnected")

    async def send_personal_message(self, message: dict, user_id: int):
        async with connection_lock:
            websocket = active_notification_connections.get(user_id)
            if websocket:
                try:
                    # Check if connection is still open
                    if websocket.client_state.name == "CONNECTED":
                        await websocket.send_json(message)
                    else:
                        # Connection is closed, clean it up
                        await self.disconnect(user_id)
                except Exception as e:
                    logger.error(f"Error sending to {user_id}: {e}")
                    await self.disconnect(user_id)

manager = ConnectionManager()

@router.websocket("/ws/notifications/{user_id}")
async def notification_websocket(websocket: WebSocket, user_id: int):
    await manager.connect(websocket, user_id)
    
    last_active = datetime.utcnow()
    
    try:
        while True:
            try:
                # 45 second timeout for receiving messages
                data = await asyncio.wait_for(
                    websocket.receive_json(),
                    timeout=45.0
                )
                last_active = datetime.utcnow()
                
                # Handle ping/pong
                if data.get("type") == "ping":
                    await websocket.send_json({"type": "pong"})
                    continue
                    
                # Process other message types
                if data.get("type") == "notification":
                    await handle_notification(data, user_id)
                    
            except asyncio.TimeoutError:
                # Check if connection is idle for too long (90 seconds)
                if (datetime.utcnow() - last_active).total_seconds() > 90:
                    logger.info(f"Closing idle connection for user {user_id}")
                    await websocket.close(code=1000, reason="Idle timeout")
                    break
                    
                # Send ping to check connection
                try:
                    await websocket.send_json({"type": "ping"})
                except Exception as e:
                    logger.error(f"Failed to send ping to user {user_id}: {e}")
                    break
                    
            except json.JSONDecodeError:
                logger.warning(f"Invalid JSON from user {user_id}")
                await websocket.send_json({
                    "type": "error", 
                    "message": "Invalid JSON format"
                })
                continue
                
    except WebSocketDisconnect:
        logger.info(f"User {user_id} disconnected normally")
    except Exception as e:
        logger.error(f"Unexpected error for user {user_id}: {str(e)}")
        try:
            await websocket.close(code=1011, reason="Internal server error")
        except:
            pass
    finally:
        # Ensure cleanup happens only once
        await manager.disconnect(user_id)

async def handle_notification(data: dict, sender_id: int):
    logger.info(f"[Notficaiation] Received notification data: {data}")
    """Process and deliver notifications"""
    try:
        required_fields = ["receiver_id", "message", "notification_type"]
        if not all(field in data for field in required_fields):
            logger.warning(f"Missing required fields in notification from {sender_id}")
            return
        
        # Build the base notification
        notification = {
            "type": "notification",
            "sender_id": sender_id,
            "notification_type": data["notification_type"],
            "message": data["message"],
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Add consultation_id only if it exists in the data
        if "consultation_id" in data and data["consultation_id"]:
            notification["consultation_id"] = data["consultation_id"]
        
        await manager.send_personal_message(notification, data["receiver_id"])
        
    except Exception as e:
        logger.error(f"Notification handling error: {str(e)}")