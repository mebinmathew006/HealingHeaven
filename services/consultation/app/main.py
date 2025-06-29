from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import consultation
app = FastAPI()

app.include_router(consultation.router)


app.add_middleware(
    CORSMiddleware,
    allow_origins= ["*"],  # ["https://www.healinghaven.live"] or  for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)