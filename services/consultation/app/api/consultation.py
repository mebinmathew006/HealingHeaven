from fastapi import APIRouter, Depends, HTTPException, status,Form, File,UploadFile,BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.concurrency import run_in_threadpool
from typing import List
from sqlalchemy import select,update
from dependencies.database import get_session
import crud.crud as crud
from schemas.consultation import CreateConsultationSchema,ConsultationResponse,ChatResponse,MappingResponse
from fastapi.responses import JSONResponse
from fastapi.logger import logger
from datetime import date 
from crud.crud import create_consultation,get_all_consultation,get_doctor_consultations,get_all_mapping_for_chat,adding_chat_messages,get_chat_messages_using_cons_id
from infra.external.user_service import get_user_details
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
        return await create_consultation(session, data)
    except Exception as e:
        logger.info.error(f"Error creating user: {e}")
        raise HTTPException(status_code=400, detail="Failed to update user")

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
    "call-initiate": ["offer", "senderId", "targetId"],
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


active_chat_connections: Dict[str, WebSocket] = {}
chat_lock = asyncio.Lock()

@router.websocket("/ws/chat/{user_id}")
async def chat_websocket(websocket: WebSocket, user_id: str, session: AsyncSession = Depends(get_session)):
    await websocket.accept()

    async with chat_lock:
        active_chat_connections[user_id] = websocket
        logger.info(f"[CHAT CONNECTED] {user_id}")

    try:
        while True:
            data = await websocket.receive_json()
            logger.info(f"[MESSAGE RECEIVED] {user_id}: {data}")

            message = data.get("message")
            sender_id = data.get("sender_id")
            target_id = data.get("target_id")
            consultation_id = data.get("consultation_id")
            sender_type = data.get("sender_type")

            if not all([message, sender_id, target_id, consultation_id,sender_type]):
                logger.warning(f"[VALIDATION ERROR] Missing fields in message from {user_id}")
                continue

            # Save message to DB
            try:
                await adding_chat_messages(session,message,consultation_id,sender_type)
               
                logger.info(f"[MESSAGE SAVED] Consultation {consultation_id}")
            except Exception as e:
                logger.error(f"[DB ERROR] Failed to save message: {e}")

            # Forward message to target if connected
            async with chat_lock:
                target_ws = active_chat_connections.get(str(target_id))
                if target_ws:
                    try:
                        await target_ws.send_json({
                            "type": "chat",
                            "senderId": sender_id,
                            "message": message,
                            "consultationId": consultation_id
                        })
                        logger.info(f"[MESSAGE FORWARDED] From {sender_id} to {target_id}")
                    except Exception as e:
                        logger.warning(f"[SEND ERROR] {e}")
                        active_chat_connections.pop(str(target_id), None)

    except WebSocketDisconnect:
        logger.info(f"[DISCONNECTED] {user_id}")
    except Exception as e:
        logger.error(f"[WEBSOCKET ERROR] {user_id}: {e}")
    finally:
        async with chat_lock:
            active_chat_connections.pop(user_id, None)
            logger.info(f"[CLEANUP] {user_id} disconnected")