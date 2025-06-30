from fastapi import APIRouter, Depends, HTTPException, status,Form, File,UploadFile,BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.concurrency import run_in_threadpool
from typing import List
from sqlalchemy import select,update
from dependencies.database import get_session
import crud.crud as crud
from schemas.payment import RazorpayOrder,WalletWithTransactionsOut,WalletBalanceOut,UserConsultationMoney
from fastapi.responses import JSONResponse
from fastapi.logger import logger
from datetime import date 
from fastapi import HTTPException
from dependencies.razorpay import create_razorpay_order
from crud.crud import money_to_wallet,get_wallet_balance_by_id,money_from_wallet
import os
from dotenv import load_dotenv
from dependencies.get_current_user import get_current_user
load_dotenv()


router = APIRouter(tags=["payments"])


from fastapi import HTTPException
from razorpay.errors import BadRequestError, ServerError

@router.post("/create_razorpay_order")
async def create_razorpay_orders(
    rzrpay_schema: RazorpayOrder,session: AsyncSession = Depends(get_session)
):
    try:
        razorpay_order = await create_razorpay_order(rzrpay_schema.totalAmount)
        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content={
                "razorpay_order_id": razorpay_order["id"],
                "currency": razorpay_order["currency"],
                "amount": rzrpay_schema.totalAmount,
            }
        )
    except (BadRequestError, ServerError) as e:
        raise HTTPException(status_code=400, detail=f"Razorpay error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/add_money_to_wallet")
async def add_money_to_wallet(
    rzrpay_schema: RazorpayOrder,
    current_user_id: str = Depends(get_current_user),session: AsyncSession = Depends(get_session)
):
    try:
        await money_to_wallet(session, rzrpay_schema.user_id, rzrpay_schema.totalAmount)
        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content={"status": "success"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {str(e)}"
        )
        
@router.post("/fetch_money_from_wallet")
async def fetch_money_from_wallet(
    fetch_money_schema: UserConsultationMoney,session: AsyncSession = Depends(get_session)):
    try:
        await money_from_wallet(session, fetch_money_schema.user_id, fetch_money_schema.psychologist_fee)
        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content={"status": "success"},
        )
    except Exception as e:
        raise HTTPException(    
            status_code=500, detail=f"Internal server error: {str(e)}"
        )


@router.get('/get_wallet_details_with_transactions/{user_id}', response_model=WalletWithTransactionsOut)
async def get_wallet_details_with_transactions(user_id : int ,current_user_id: str = Depends(get_current_user),session: AsyncSession = Depends(get_session)):
    try:
        data = await crud.get_wallet_details_with_transactions_by_id(session,user_id)
        return data
    except HTTPException as http_exc:
        logger.error('dddfdddd',http_exc)
        raise http_exc
    
    except Exception as e:
        logger.error('dddfdddd',e)
        
        raise HTTPException(status_code=500, detail="Internal server error while fetching wallet.")  
    
    
@router.get("/get_wallet_balance/{user_id}", response_model=WalletBalanceOut)
async def get_wallet_balance(user_id: int, session: AsyncSession = Depends(get_session)):
    try:
        wallet = await get_wallet_balance_by_id(session, user_id)
        if not wallet:
            raise HTTPException(status_code=404, detail="Wallet not found.")
        return wallet
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error while fetching wallet balance.")
    

    
    
