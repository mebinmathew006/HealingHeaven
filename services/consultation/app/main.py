import asyncio
from fastapi import FastAPI
from infra.db.session import engine
from infra.db.base import Base

app = FastAPI()

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
