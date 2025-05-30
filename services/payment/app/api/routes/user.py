# API endpoints

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from infra.db import get_db
from domain.models import user
from sqlalchemy import select


router = APIRouter()

@router.get("/users")
async def get_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(user))
    return result.scalars().all()
