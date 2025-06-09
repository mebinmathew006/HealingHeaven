from fastapi import APIRouter, Depends, HTTPException, status,Form, File,UploadFile,BackgroundTasks
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect


router = APIRouter(tags=["websocket_consultations"])


connected_users = {}

@router.websocket("/create_socket/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await websocket.accept()
    connected_users[user_id] = websocket
    print(f"[CONNECTED] {user_id}")

    try:
        while True:
            data = await websocket.receive_text()
            print(f"[RECEIVED from {user_id}] Raw: {data}")  # 👈 Log raw incoming message

            message = json.loads(data)
            print(f"[PARSED] type={message.get('type')} from={user_id} to={message.get('to')}")  # 👈 Log parsed details

            to_user = message.get("to")
            if to_user and to_user in connected_users:
                await connected_users[to_user].send_text(json.dumps(message))
                print(f"[FORWARDED] type={message.get('type')} to={to_user}")
            else:
                print(f"[FAILED] User {to_user} not connected")
    except WebSocketDisconnect:
        print(f"[DISCONNECTED] {user_id}")
        connected_users.pop(user_id, None)




