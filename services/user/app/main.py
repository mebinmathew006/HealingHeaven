from fastapi import FastAPI
from api import user
from core import cloudinary_config
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.include_router(user.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://www.healinghaven.live"],  # or ["*"] for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)