from sqlalchemy.future import select
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.exc import SQLAlchemyError
from schemas.consultation import CreateConsultationSchema
from models.consultation import Consultation,Payments,ConsultationMapping,Chat


async def create_consultation(session: AsyncSession, data: CreateConsultationSchema):
    try:
        async with session.begin():
            # Create consultation
            consultation = Consultation(
                user_id=data.user_id,
                psychologist_id=data.psychologist_id,
                status="pending"
            )
            session.add(consultation)
            await session.flush()  # gets the consultation.id without committing

            # Create payment linked to consultation
            payment = Payments(
                consultation_id=consultation.id,
                psychologist_fee=data.psychologist_fee,
                payment_status="pending"
            )
            session.add(payment)
            await session.flush()

            # Check if mapping already exists
            result = await session.execute(
                select(ConsultationMapping).where(
                    ConsultationMapping.user_id == data.user_id,
                    ConsultationMapping.psychologist_id == data.psychologist_id
                )
            )
            existing_mapping = result.scalars().first()

            if not existing_mapping:
                mapping = ConsultationMapping(
                    user_id=data.user_id,
                    psychologist_id=data.psychologist_id
                )
                session.add(mapping)
                await session.flush()

        # Outside transaction, safe to refresh
        await session.refresh(consultation)
        await session.refresh(payment)

        return {
            "consultation_id": consultation.id,
            "payment_id": payment.id
        }

    except SQLAlchemyError as e:
        await session.rollback()
        # Log error or raise appropriate exception
        raise e

async def get_all_consultation(session: AsyncSession):
    result = await session.execute(
        select(Consultation)
        .options(selectinload(Consultation.payments))
    )
    return result.scalars().all()

async def get_all_mapping_for_chat(session: AsyncSession,doctorId:int):
    result = await session.execute(
        select(ConsultationMapping).where(ConsultationMapping.psychologist_id==doctorId)
        
    )
    return result.scalars().all()

async def get_chat_messages_using_cons_id(session: AsyncSession,consultation_id:int):
    result = await session.execute(
        select(Chat).where(Chat.consultation_map_id==consultation_id)
        
    )
    return result.scalars().all()

async def get_doctor_consultations(session: AsyncSession,doctorId):
    result = await session.execute(
        select(Consultation)
        .options(selectinload(Consultation.payments)).where(Consultation.psychologist_id==doctorId)
    )
    return result.scalars().all()

async def adding_chat_messages(session: AsyncSession,message:str,consultation_id:int,sender_type:str):  
    result =   Chat(
                    message=message,
                    consultation_map_id=consultation_id,
                    sender=sender_type,
                )
    session.add(result)
    await session.commit()
    
    return 
