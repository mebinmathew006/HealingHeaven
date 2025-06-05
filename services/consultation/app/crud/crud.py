from sqlalchemy.future import select
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.exc import SQLAlchemyError
from schemas.consultation import CreateConsultationSchema
from models.consultation import Consultation,Payments


async def create_consultation(session: AsyncSession, data: CreateConsultationSchema):
    
    # Create consultation
    consultation = Consultation(
        user_id=data.user_id,
        psychologist_id=data.psychologist_id,
        status="pending"  # default status
    )
    session.add(consultation)
    await session.commit()
    await session.refresh(consultation)

    # Create payment linked to consultation
    payment = Payments(
        consultation_id=consultation.id,
        psychologist_fee=data.psychologist_fee,
        payment_status="pending"
    )
    session.add(payment)
    await  session.commit()
    await session.refresh(payment)

    return {"consultation_id": consultation.id, "payment_id": payment.id}

async def get_all_consultation(session: AsyncSession):
    result = await session.execute(
        select(Consultation)
        .options(selectinload(Consultation.payments))
    )
    return result.scalars().all()
