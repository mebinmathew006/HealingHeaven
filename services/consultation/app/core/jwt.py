from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from ..dependencies.auth import decode_access_token
from sqlalchemy.ext.asyncio import AsyncSession
from dependencies.database import get_session  # your DB dependency
from sqlalchemy.future import select

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

async def verify_user(
    token: str = Depends(oauth2_scheme),
    session: AsyncSession = Depends(get_session),
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception

    

    return 
