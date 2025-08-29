from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from fastapi import HTTPException, status
from jose import jwt, JWTError
from config.config import Settings 

settings = Settings()

SECRET_KEY = settings.secret_key
ALGORITHM = "HS256"
ACCESS_EXPIRE_MINUTES = int(settings.access_expire_minutes)
REFRESH_EXPIRE_DAYS = int(settings.refresh_expire_days)


def create_access_token(user_id: str, role: Optional[str] = None, extra_claims: Optional[Dict[str, Any]] = None) -> str:
    to_encode = {"sub": user_id}
    if role:
        to_encode["role"] = role
    if extra_claims:
        to_encode.update(extra_claims)

    expire = datetime.now(tz=timezone.utc) + timedelta(minutes=ACCESS_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    to_encode = {"sub": user_id, "refresh": True}
    expire = datetime.now(tz=timezone.utc) + timedelta(days=REFRESH_EXPIRE_DAYS)
    to_encode.update({"exp": expire})

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str) -> Dict[str, Any]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
