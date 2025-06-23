from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from dependencies.database import get_session
import crud.crud as crud
from schemas.consultation import PaginatedConsultationResponse,CompliantSchema,ConsultationResponseUser,NotificationResponse
from schemas.consultation import CreateConsultationSchema,ConsultationResponse,ChatResponse,MappingResponse,MappingResponseUser 
from schemas.consultation import UpdateConsultationSchema,CreateFeedbackSchema,CreateNotificationSchema,PaginatedNotificationResponse
from schemas.consultation import CompliantPaginatedResponse,UpdateComplaintSchema,UserNameWithProfileImage,UserProfileImage
from fastapi.logger import logger
from datetime import datetime 
# from starlette.websockets import WebSocketState  # ✅ correct
from crud.crud import count_consultations,get_complaints_crud,register_complaint_crud,consultation_for_user,get_all_notifications
from crud.crud import get_psychologist_rating_crud,get_feedbacks_crud,count_consultations_by_doctor_crud,consultation_for_doctor
from crud.crud import create_notification,create_consultation,get_all_consultation,get_doctor_consultations,get_all_mapping_for_chat
from crud.crud import adding_chat_messages,get_chat_messages_using_cons_id,get_all_mapping_for_chat_user,update_analysis_consultation
from crud.crud import create_feedback,count_notifications,get_notifications_crud,count_compliants,get_compliants_crud,update_complaints_curd
from infra.external.user_service import get_user_details,get_doctor_details,get_minimal_user_details
from infra.external.payment_service import fetch_money_from_wallet
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict
import asyncio
import logging
import requests
from requests.auth import HTTPBasicAuth
import os
from dotenv import load_dotenv
load_dotenv()
from fastapi import Query
from asyncio import gather

TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID', default=None)
TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN', default=None)

router = APIRouter(tags=["consultations"])


logger = logging.getLogger("uvicorn.error")



@router.post("/create_consultation")
async def create_consultation_route(data: CreateConsultationSchema, session: AsyncSession = Depends(get_session)):
    try:
        await fetch_money_from_wallet(data.dict())
        
        return await create_consultation(session, data)
    except Exception as e:
        logger.info(f"Error creating user: {e}")
        raise HTTPException(status_code=400, detail="Failed to update user")
    
@router.post("/register_complaint")
async def register_complaint_route(data: CompliantSchema, session: AsyncSession = Depends(get_session)):
    try:
        complaint = await register_complaint_crud(session, data)
        return complaint
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
    url = await f"https://api.twilio.com/2025-06-20/Accounts/{TWILIO_ACCOUNT_SID}/Tokens.json"
    response = requests.post(url, auth=HTTPBasicAuth(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN))
    return {"iceServers": response.json()["ice_servers"]}



@router.get('/get_chat_messages/{consultation_id}',response_model=List[ChatResponse])
async def get_chat_messages(consultation_id:int,session : AsyncSession = Depends(get_session)):
    try:
        messages = await get_chat_messages_using_cons_id(session,consultation_id)
        return messages
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get('/get_complaints/{user_id}',response_model=List[CompliantSchema])
async def get_complaints_route(user_id:int,session : AsyncSession = Depends(get_session)):
    try:
        complaints = await get_complaints_crud(session,user_id)
        return complaints
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/get_consultation_for_user/{user_id}", response_model=PaginatedConsultationResponse)
async def get_consultation_for_user(
    user_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(10, le=100),
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
    
@router.get("/doctor_get_consulations/{doctor_id}", response_model=PaginatedConsultationResponse)
async def doctor_get_consulations_route(
    doctor_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(10, le=100),
    session: AsyncSession = Depends(get_session),
):
    try:
        total = await count_consultations_by_doctor_crud(session, doctor_id)
        offset = (page - 1) * limit
        consultations = await consultation_for_doctor(session, doctor_id, skip=offset, limit=limit)

        #  Parallel fetch user_data
        user_details_tasks = [
            get_user_details(consult.user_id)
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
                user=user_details[i]
            )
            for i, consult in enumerate(consultations)
        ]

        next_url = f"/doctor_get_consulations/{doctor_id}?page={page + 1}&limit={limit}" if offset + limit < total else None
        prev_url = f"/doctor_get_consulations/{doctor_id}?page={page - 1}&limit={limit}" if page > 1 else None

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
async def get_notifications_route( page: int = Query(1, ge=1),limit: int = Query(10, le=100),session: AsyncSession = Depends(get_session),
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
async def update_complaints_route(complaint_id :int ,data: UpdateComplaintSchema, session: AsyncSession = Depends(get_session)):
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


@router.get('/get_feedbacks/{psychologist_id}', response_model=list[CreateFeedbackSchema])
async def get_feedbacks_route(psychologist_id: int, session: AsyncSession = Depends(get_session)):
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
            
    

# # ***************************************Chat***********************************************
# # In-memory storage (consider Redis for production)


# # Global variables for tracking active rooms and locks
active_chat_rooms: Dict[int, List[Dict]] = {}  # consultation_id -> list of clients
room_lock = asyncio.Lock()



@router.websocket("/ws/chat/{consultation_id}")
async def chat_websocket(
    websocket: WebSocket,
    consultation_id: int,
    session: AsyncSession = Depends(get_session)
):
    await websocket.accept()

    # Initial user identification
    try:
        init_data = await websocket.receive_json()
    except Exception as e:
        logger.warning(f"[INIT ERROR_CHAT] Failed to receive init message: {e}")
        await websocket.close(code=4001)
        return

    user_id = init_data.get("sender_id")
    user_type = init_data.get("sender_type")

    if not all([user_id, user_type]):
        await websocket.close(code=4000)
        return

    # ping_task = asyncio.create_task(send_ping_periodically(websocket, user_id, consultation_id))

    client = {
        "websocket": websocket,
        "user_id": user_id,
        "user_type": user_type,
    }

    # Register user in room
    async with room_lock:
        active_chat_rooms.setdefault(consultation_id, [])

        # Remove old duplicates
        active_chat_rooms[consultation_id] = [
            c for c in active_chat_rooms[consultation_id] if c["user_id"] != user_id
        ]

        # Add new client
        active_chat_rooms[consultation_id].append(client)
        logger.info(f"[JOINED_CHAT] user_id {user_id} joined consultation {consultation_id}")

        # Notify others that this user is online
        for c in active_chat_rooms[consultation_id]:
            if c["user_id"] != user_id:
                try:
                    await c["websocket"].send_json({
                        "type": "status",
                        "status": "online",
                        "user_id": user_id,
                        "user_type": user_type,
                        "timestamp": datetime.utcnow().isoformat()
                    })
                except Exception as e:
                    logger.warning(f"[STATUS SEND ERROR_CHAT] {e}")

        # Notify this user about others who are already online
        for c in active_chat_rooms[consultation_id]:
            if c["user_id"] != user_id:
                try:
                    await websocket.send_json({
                        "type": "status",
                        "status": "online",
                        "user_id": c["user_id"],
                        "user_type": c["user_type"],
                        "timestamp": datetime.utcnow().isoformat()
                    })
                except Exception as e:
                    logger.warning(f"[SEND CURRENT USERS ERROR_CHAT] {e}")

    # Message loop
    try:
        while True:
            data = await websocket.receive_json()

            if data.get("type") == "pong":
                continue  # pong received, ignore for now

            logger.info(f"[RECEIVED] Room {consultation_id}: {data}")

            message = data.get("message")
            sender_id = data.get("sender_id")
            sender_type = data.get("sender_type")

            if not all([message, sender_id, sender_type]):
                logger.warning("[VALIDATION ERROR_CHAT] Missing message fields")
                continue

            # Save to DB
            await adding_chat_messages(session, message, consultation_id, sender_type)

            # Broadcast to everyone
            async with room_lock:
                for client in active_chat_rooms[consultation_id]:
                    try:
                        await client["websocket"].send_json({
                            "type": "message",
                            "consultation_id": consultation_id,
                            "sender_id": sender_id,
                            "sender_type": sender_type,
                            "message": message,
                            "created_at": datetime.utcnow().isoformat()
                        })
                    except Exception as e:
                        logger.warning(f"[SEND ERROR_CHAT] {e}")

    except WebSocketDisconnect:
        # ping_task.cancel()
        async with room_lock:
            # Remove disconnected client
            active_chat_rooms[consultation_id] = [
                c for c in active_chat_rooms[consultation_id] if c["user_id"] != user_id
            ]
            logger.info(f"[DISCONNECTED_CHAT] user_id {user_id} from consultation {consultation_id}")

            # Notify others that this user went offline
            for c in active_chat_rooms[consultation_id]:
                try:
                    await c["websocket"].send_json({
                        "type": "status",
                        "status": "offline",
                        "user_id": user_id, 
                        "timestamp": datetime.utcnow().isoformat()
                    })
                except Exception as e:
                    logger.warning(f"[STATUS SEND ERROR_CHAT] {e}")
    except Exception as e:
        logger.error(f"[UNEXPECTED ERROR_CHAT] {e}")
        # ping_task.cancel()
        await websocket.close(code=1011)


# # ***************************************Notifications***********************************************

# Global connection tracking
active_connections: Dict[int, WebSocket] = {}  # user_id -> websocket
connection_lock = asyncio.Lock()

@router.websocket("/ws/notifications/{user_id}")
async def unified_communication_websocket(
    websocket: WebSocket,
    user_id: int,
    
):
    await websocket.accept()
    logger.info(f"[CONNECTED] User {user_id}")

    # Register connection
    async with connection_lock:
        active_connections[user_id] = websocket

    try:
        while True:
            data = await websocket.receive_json()
            message_type = data.get("type")
            sender_type = data.get("sender_type")

            if message_type == "notification":
                await handle_notification(data, user_id)
            elif message_type == "pong":
                continue  # Keepalive response
            else:
                logger.warning(f"Unknown message type: {message_type}")

    except WebSocketDisconnect:
        logger.info(f"[DISCONNECTED] User {user_id}")
    except Exception as e:
        logger.error(f"[ERROR] {e}")
    finally:
        async with connection_lock:
            if user_id in active_connections:
                del active_connections[user_id]



async def handle_notification(data: Dict, sender_id: int):
    """Handle notifications"""
    required_fields = ["receiver_id", "message", "notification_type"]
    if not all(field in data for field in required_fields):
        return

    receiver_id = data["receiver_id"]
    message = data["message"]
    notification_type = data["notification_type"]

    # Deliver to recipient if online
    async with connection_lock:
        if receiver_id in active_connections:
            try:
                await active_connections[receiver_id].send_json({
                    "type": "notification",
                    "sender_id": sender_id,
                    "notification_type": notification_type,
                    "message": message,
                    "timestamp": datetime.utcnow().isoformat()
                })
            except Exception as e:
                logger.error(f"Failed to deliver notification to {receiver_id}: {e}")
