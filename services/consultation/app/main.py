from fastapi import FastAPI
from api import consultation,ws_consultation
app = FastAPI()

app.include_router(consultation.router)
app.include_router(ws_consultation.router,prefix='/ws')
