from fastapi import FastAPI
from api import user
from core import cloudinary_config
app = FastAPI()

app.include_router(user.router)
