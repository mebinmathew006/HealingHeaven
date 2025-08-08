from utils.jwt_handler import verify_token
from fastapi import WebSocket
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import logging

security = HTTPBearer()
logger = logging.getLogger("uvicorn.error")

async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    if credentials.scheme != "Bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = credentials.credentials
    payload = verify_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if payload.get("type") == "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh tokens cannot be used for authorization",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id = payload.get("sub")
    role = payload.get("role")  

    if not user_id or not role:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return {"user_id": user_id, "role": role}


async def get_current_user_ws(websocket: WebSocket):
    token = None
    try:
        
        # Try to extract token from query params or headers
        token = websocket.query_params.get("token")
        if not token:
            auth_header = websocket.headers.get("authorization")
            if auth_header and auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]

        if not token:
            await websocket.close(code=1008)
            raise Exception("Missing or invalid token")

        payload = verify_token(token)
        if not payload or payload.get("type") == "refresh":
            await websocket.close(code=1008)
            raise Exception("Invalid or expired token")

        user_id = payload.get("sub")
        if not user_id:
            await websocket.close(code=1008)
            raise Exception("Invalid token payload")

        return user_id
    except Exception as e :
        print(e)