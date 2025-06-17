from fastapi import APIRouter, Depends, HTTPException, status,Form, File,UploadFile,BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.concurrency import run_in_threadpool
from typing import List
from sqlalchemy import select,update
from dependencies.database import get_session
import crud.crud as crud
from schemas.consultation import NotificationResponse,CreateConsultationSchema,ConsultationResponse,ChatResponse,MappingResponse,MappingResponseUser,UpdateConsultationSchema,CreateFeedbackSchema,CreateNotificationSchema
from fastapi.responses import JSONResponse
from fastapi.logger import logger
from datetime import datetime 

from crud.crud import get_all_notifications,create_notification,create_consultation,get_all_consultation,get_doctor_consultations,get_all_mapping_for_chat,adding_chat_messages,get_chat_messages_using_cons_id,get_all_mapping_for_chat_user,update_analysis_consultation,create_feedback
from infra.external.user_service import get_user_details,get_doctor_details
from infra.external.payment_service import fetch_money_from_wallet
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, Optional
import uuid
import asyncio
import logging
import requests
from requests.auth import HTTPBasicAuth
import os
from dotenv import load_dotenv
load_dotenv()

TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID', default=None)
TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN', default=None)

router = APIRouter(tags=["consultations"])


logger = logging.getLogger("uvicorn.error")



@router.post("/create_consultation")
async def create_consultation_route(data: CreateConsultationSchema, session: AsyncSession = Depends(get_session)):
    try:
        payment = await fetch_money_from_wallet(data.dict())
        logger.info(payment,'ddddddddddddddddddddddddd')
        
        return await create_consultation(session, data)
    except Exception as e:
        logger.info(f"Error creating user: {e}")
        raise HTTPException(status_code=400, detail="Failed to update user")
    
@router.post("/add_feedback")
async def add_feedback(data: CreateFeedbackSchema, session: AsyncSession = Depends(get_session)):
    try:
        return await create_feedback(session, data)
    except Exception as e:
        logger.info(f"Error creating feedback: {e}")
        raise HTTPException(status_code=400, detail="Failed to create feedback")
    
    
@router.post("/create_new_notification")
async def create_new_notification(data: CreateNotificationSchema, session: AsyncSession = Depends(get_session)):
    try:
        return await create_notification(session, data)
    except Exception as e:
        logger.info(f"Error creating notification: {e}")
        raise HTTPException(status_code=400, detail="Failed to create notification")
    
@router.put("/set_analysis_from_doctor")
async def set_analysis_from_doctor(data: UpdateConsultationSchema, session: AsyncSession = Depends(get_session)):
    try:
        return await update_analysis_consultation(session, data)
    except Exception as e:
        logger.info(f"Error creating user: {e}")
        raise HTTPException(status_code=400, detail="Failed to update user")
    
    

@router.get("/get_all_notifications", response_model=List[NotificationResponse])
async def get_all_notifications_route(
    session: AsyncSession = Depends(get_session),
):
    Notification = await get_all_notifications(session)
    if not Notification:
        raise HTTPException(status_code=404, detail="Notifications not found")
    return Notification

@router.get("/get_consultation", response_model=List[ConsultationResponse])
async def get_consultation(
    session: AsyncSession = Depends(get_session),
):
    consultation = await get_all_consultation(session)
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")
    return consultation

@router.get("/get_consultation_mapping_for_chat/{doctorId}", response_model=List[MappingResponse])
async def get_consultation(doctorId:int,
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
async def get_consultation_mapping_for_user_chat(userId:int,
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
async def get_consultation(doctorId:int,
    session: AsyncSession = Depends(get_session),
):
    consultation = await get_doctor_consultations(session,doctorId)
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")
    return consultation



@router.get("/turn-credentials")
async def get_turn_credentials():
    url = await f"https://api.twilio.com/2010-04-01/Accounts/{TWILIO_ACCOUNT_SID}/Tokens.json"
    response = requests.post(url, auth=HTTPBasicAuth(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN))
    return {"iceServers": response.json()["ice_servers"]}



@router.get('/get_chat_messages/{consultation_id}',response_model=List[ChatResponse])
async def get_chat_messages(consultation_id:int,session : AsyncSession = Depends(get_session)):
    try:
        messages = await get_chat_messages_using_cons_id(session,consultation_id)
        return messages
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))









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
    "end-call": ["senderId", "targetId",'sender']
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
                        "sender": data["sender"]
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



# ***************************************Chat***********************************************
# In-memory storage (consider Redis for production)


active_chat_rooms: Dict[int, List[WebSocket]] = {}  # consultation_id -> list of WebSockets
room_lock = asyncio.Lock()

@router.websocket("/ws/chat/{consultation_id}")
async def chat_websocket(websocket: WebSocket, consultation_id: int, session: AsyncSession = Depends(get_session)):
    await websocket.accept()

    async with room_lock:
        active_chat_rooms.setdefault(consultation_id, []).append(websocket)
        logger.info(f"[JOINED] WebSocket joined room {consultation_id}")

    try:
        while True:
            data = await websocket.receive_json()
            logger.info(f"[RECEIVED] Room {consultation_id}: {data}")

            message = data.get("message")
            sender_id = data.get("sender_id")
            sender_type = data.get("sender_type")

            if not all([message, sender_id, sender_type]):
                logger.warning("[VALIDATION ERROR] Missing message fields")
                continue

            # Save to DB
            await adding_chat_messages(session, message, consultation_id, sender_type)

            # Broadcast to all participants in the room
            async with room_lock:
                for client in active_chat_rooms[consultation_id]:
                    try:
                        await client.send_json({
                            "type": "message",
                            "consultation_id": consultation_id,
                            "sender_id": sender_id,
                            "sender_type": sender_type,
                            "message": message,
                            "created_at": datetime.utcnow().isoformat()
                        })
                    except Exception as e:
                        logger.warning(f"[SEND ERROR] {e}")
    except WebSocketDisconnect:
        async with room_lock:
            active_chat_rooms[consultation_id].remove(websocket)
            logger.info(f"[DISCONNECTED] from room {consultation_id}")
    except Exception as e:
        logger.error(f"[ERROR] {e}")
