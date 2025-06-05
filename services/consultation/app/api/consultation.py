from fastapi import APIRouter, Depends, HTTPException, status,Form, File,UploadFile,BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.concurrency import run_in_threadpool
from typing import List
from sqlalchemy import select,update
from dependencies.database import get_session
import crud.crud as crud
from schemas.consultation import CreateConsultationSchema,ConsultationResponse
from fastapi.responses import JSONResponse
from fastapi.logger import logger
from datetime import date 
from crud.crud import create_consultation,get_all_consultation

router = APIRouter(tags=["payments"])



@router.post("/create_consultation")
async def create_consultation_route(data: CreateConsultationSchema, session: AsyncSession = Depends(get_session)):
    try:
        return await create_consultation(session, data)
    except Exception as e:
        logger.error(f"Error creating user: {e}")
        raise HTTPException(status_code=400, detail="Failed to update user")
        

@router.get("/get_consultation", response_model=List[ConsultationResponse])
async def get_consultation(
    session: AsyncSession = Depends(get_session),
):
    consultation = await get_all_consultation(session)
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")
    return consultation


