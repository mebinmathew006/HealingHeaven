from fastapi import APIRouter, Depends, HTTPException, status,Query
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.concurrency import run_in_threadpool
from typing import List
from sqlalchemy import select,update
from dependencies.database import get_session
import crud.crud as crud
from schemas.payment import RazorpayOrder,WalletWithTransactionsOut,WalletBalanceOut,UserConsultationMoney,WalletWithTransactionsPagination
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
    rzrpay_schema: RazorpayOrder,current_user: str = Depends(get_current_user),session: AsyncSession = Depends(get_session)
):
    try:
        user_id = current_user["user_id"]
        if int(user_id) != rzrpay_schema.user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="User is not authorized")

        razorpay_order = await create_razorpay_order(rzrpay_schema.totalAmount)
        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content={
                "razorpay_order_id": razorpay_order["id"],
                "currency": razorpay_order["currency"],
                "amount": rzrpay_schema.totalAmount,
            }
        )
    except HTTPException:
        raise
    except (BadRequestError, ServerError) as e:
        raise HTTPException(status_code=400, detail=f"Razorpay error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get('/get_wallet_details_with_transactions/{user_id}', response_model=WalletWithTransactionsPagination)
async def get_wallet_details_with_transactions(
    user_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(10, le=100),
    current_user: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    try:
        userId = current_user["user_id"]
        if int(userId) != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="User is not authorized")
        wallet = await crud.get_wallet_balance_by_id(session, user_id)
        if not wallet:
            raise HTTPException(status_code=404, detail="Wallet not found")
        # Count transactions for this wallet
        total = await crud.count_wallet_transactions(session, wallet.id)
        offset = (page - 1) * limit
        # Get paginated transactions for this wallet
        transactions = await crud.get_wallet_transactions_paginated(
            session, wallet.id, skip=offset, limit=limit
        )
        # Build response
        wallet_with_transactions = WalletWithTransactionsOut(
            id=wallet.id,
            user_id=wallet.user_id,
            balance=wallet.balance,
            wallet_transactions=transactions
        )
        # Build pagination URLs (convert None to empty string for validation)
        base_url = f"/get_wallet_details_with_transactions/{user_id}"
        next_url = f"{base_url}?page={page + 1}&limit={limit}" if offset + limit < total else ""
        prev_url = f"{base_url}?page={page - 1}&limit={limit}" if page > 1 else ""
        response= {
            "count": total,
            "next": next_url,
            "previous": prev_url,
            "results": [wallet_with_transactions]  
        }
        return response
    except HTTPException as http_exc:
        logger.error(f'HTTP Exception in wallet details: {str(http_exc)}')
        raise http_exc
    except Exception as e:
        logger.error(f'Unexpected error fetching wallet details: {str(e)}')
        raise HTTPException(
            status_code=500, 
            detail="Internal server error while fetching wallet details"
        )
    
@router.get("/get_wallet_balance/{user_id}", response_model=WalletBalanceOut)
async def get_wallet_balance(
    user_id: int,
    current_user: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
    ):
    try:
        userId = current_user["user_id"]
        if int(userId) != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="User is not authorized")
        wallet = await get_wallet_balance_by_id(session, user_id)
        if not wallet:
            raise HTTPException(status_code=404, detail="Wallet not found.")
        return wallet
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error while fetching wallet balance.")
    
@router.post("/add_money_to_wallet_from_razorpay")
async def add_money_to_wallet_from_razorpay(
    rzrpay_schema: RazorpayOrder,
    session: AsyncSession = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    try:
        if rzrpay_schema.user_id != int(current_user["user_id"]):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to add money to another user's wallet"
            )
        await money_to_wallet(session, rzrpay_schema.user_id, rzrpay_schema.totalAmount)
        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content={"status": "success"},
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {str(e)}"
        )
# inter service calls--------------

@router.post("/add_money_to_wallet")
async def add_money_to_wallet(
    rzrpay_schema: RazorpayOrder,
    session: AsyncSession = Depends(get_session)
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
    
