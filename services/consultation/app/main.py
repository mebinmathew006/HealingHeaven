from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import consultation
app = FastAPI()

app.include_router(consultation.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins = [
    "https://www.healinghaven.live",
    "https://healinghaven.live",
    "http://localhost:5173"
],

    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)