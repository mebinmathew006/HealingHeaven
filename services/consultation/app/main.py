from fastapi import FastAPI
from api import consultation
app = FastAPI()

app.include_router(consultation.router)
