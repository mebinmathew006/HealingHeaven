from sqlalchemy.future import select
from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from schemas.payment import *
from sqlalchemy.orm import joinedload,selectinload
from sqlalchemy.exc import SQLAlchemyError
from models.payment import Wallet,WalletTransaction
from fastapi import HTTPException, status

async def get_wallet_details_with_transactions_by_id(session: AsyncSession, user_id: int,skip, limit):
    result = await session.execute(
    select(Wallet)
    .options(selectinload(Wallet.wallet_transactions))  # non-joined eager load
    .where(Wallet.user_id == user_id).offset(skip).limit(limit)
    )
    return result.scalar_one_or_none()

async def get_wallet_transactions_paginated(
    session: AsyncSession, 
    wallet_id: int,
    skip: int = 0,
    limit: int = 100
):
    result = await session.execute(
        select(WalletTransaction)
        .where(WalletTransaction.wallet_id == wallet_id)
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


async def count_wallet_transactions(session: AsyncSession, wallet_id: int):
    result = await session.execute(
        select(func.count(WalletTransaction.id))
        .join(WalletTransaction.wallet)
        .where(Wallet.id == wallet_id)
    )
    return result.scalar()

async def money_to_wallet(session: AsyncSession, user_id: int, amount: float):
    # Fetch the wallet for the user
    result = await session.execute(select(Wallet).where(Wallet.user_id == user_id))
    wallet = result.scalar_one_or_none()

    # If wallet doesn't exist, create it
    if not wallet:
        wallet = Wallet(user_id=user_id, balance=0)
        session.add(wallet)
        await session.flush()  # To get wallet.id before using it

    # Update balance
    wallet.balance += amount

    # Create wallet transaction
    wallet_trans = WalletTransaction(
        wallet_id=wallet.id,
        transaction_amount=amount,
    )
    session.add(wallet_trans)

    # Commit both changes
    await session.commit()
    
async def money_from_wallet(session: AsyncSession, user_id: int, amount: float):
    # Fetch the wallet for the user
    result = await session.execute(select(Wallet).where(Wallet.user_id == user_id))
    wallet = result.scalar_one_or_none()
    # Check for sufficient balance
    if wallet.balance < amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient wallet balance."
        )

    # Update balance
    wallet.balance -= amount

    # Create wallet transaction
    wallet_trans = WalletTransaction(
        wallet_id=wallet.id,
        transaction_amount=-amount,
    )
    session.add(wallet_trans)

    # Commit both changes
    await session.commit()
    
async def get_wallet_balance_by_id(session: AsyncSession, user_id: int):
    result = await session.execute(
        select(Wallet).where(Wallet.user_id == user_id)
    )
    wallet = result.scalar_one_or_none()
    return wallet

