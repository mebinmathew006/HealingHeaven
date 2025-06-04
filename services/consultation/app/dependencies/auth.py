from datetime import datetime, timedelta
from jose import JWTError, jwt
from typing import Optional
import os
from dotenv import load_dotenv
load_dotenv()
SECRET_KEY = REFRESH_SECRET_KEY = os.getenv('SECRET_KEY', default=None)

ALGORITHM = "HS256"

def verify_refresh_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, REFRESH_SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
