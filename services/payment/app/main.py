from fastapi import FastAPI
from api import payment
app = FastAPI()

app.include_router(payment.router)
