from sqlalchemy.future import select
from sqlalchemy import func,extract,desc, asc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.exc import SQLAlchemyError
from schemas.consultation import CompliantSchemaa,CreateConsultationSchema,UpdateConsultationSchema,CreateFeedbackSchema,CreateNotificationSchema,UpdateComplaintSchema
from models.consultation import Consultation,Payments,ConsultationMapping,Chat,Feedback,Notification,Complaint,ChatAttachment
from datetime import datetime,time
import calendar
from typing import Optional,List,Dict
from fastapi import HTTPException
from sqlalchemy import or_
import logging
import traceback
from utils.time import utc_to_ist

logger = logging.getLogger("uvicorn.error")


async def create_consultation(session: AsyncSession, data: CreateConsultationSchema):
    try:
        async with session.begin():
            # Create consultation
            consultation = Consultation(
                user_id=data.user_id,
                psychologist_id=data.psychologist_id,
                status="Pending",
                duration="0",
            )
            session.add(consultation)
            await session.flush()  # gets the consultation.id without committing

            # Create payment linked to consultation
            payment = Payments(
                consultation_id=consultation.id,
                psychologist_fee=data.psychologist_fee,
                payment_status="paid"
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

        return consultation.id
           
    except SQLAlchemyError as e:
        await session.rollback()
        # Log error or raise appropriate exception
        raise e
    
    
async def create_feedback(session: AsyncSession, data: CreateFeedbackSchema):
    try:
        # Create consultation
        feedback = Feedback(
            user_id=data.user_id,
            consultation_id=data.consultation_id,
            message=data.message,
            rating=data.rating,
        )
        session.add(feedback)
        await session.commit()        

    except SQLAlchemyError as e:
        await session.rollback()
        # Log error or raise appropriate exception
        raise e
        
async def register_complaint_crud(session: AsyncSession, data: CompliantSchemaa):
    complaint = Complaint(
        consultation_id=data.consultation_id,
        type=data.type,
        subject=data.subject,
        description=data.description,
        status="pending"
       
    )
    session.add(complaint)
    await session.commit()
    await session.refresh(complaint)
    return complaint

async def create_notification(session: AsyncSession, data: CreateNotificationSchema):
    try:
        # Create consultation
        notification = Notification(
            
            message=data.message,
            title=data.title,
        )
        session.add(notification)
        await session.commit()        

    except SQLAlchemyError as e:
        await session.rollback()
        
        raise e
    
    
async def update_analysis_consultation(session: AsyncSession, data: UpdateConsultationSchema):
    result = await session.execute(select(Consultation).where(Consultation.id == data.consultation_id))
    consultation = result.scalar_one_or_none()
    consultation.analysis = data.message
    consultation.duration = "0 min"
    consultation.status='completed'
    await session.commit()
    
async def update_consultation_status(session: AsyncSession, status:str,consultation_id:int):
    result = await session.execute(select(Consultation).where(Consultation.id == consultation_id))
    consultation = result.scalar_one_or_none()
    consultation.status=status
    await session.commit()
    
async def save_recording_database(session: AsyncSession, video_url:str,consultation_id:int):
    result = await session.execute(select(Consultation).where(Consultation.id == consultation_id))
    consultation = result.scalar_one_or_none()
    consultation.video=video_url
    await session.commit()
    
async def get_all_consultation(session: AsyncSession, start_date=None, end_date=None, skip: int = 0, limit: int = 10):
    query = select(Consultation).options(selectinload(Consultation.payments))

    

    if start_date and end_date:
        start_datetime = datetime.combine(start_date, time.min)
        end_datetime = datetime.combine(end_date, time.max)
        query = query.where(
            Consultation.created_at >= start_datetime,
            Consultation.created_at <= end_datetime
        )

    query = query.order_by(Consultation.created_at.desc()).limit(limit).offset(skip)

    result = await session.execute(query)
    return result.scalars().all()

async def count_all_consultation(session: AsyncSession,start_date=None,end_date=None):
    query =select(func.count()).select_from(Consultation)
    if start_date and end_date:
        start_datetime = datetime.combine(start_date, time.min)
        end_datetime = datetime.combine(end_date, time.max)
        query = query.where(
            Consultation.created_at >= start_datetime,
            Consultation.created_at <= end_datetime
        )
    result = await session.execute(query)
    return result.scalar_one()

async def get_all_notifications(session: AsyncSession):
    result = await session.execute(
        select(Notification)
    )
    return result.scalars().all()

async def get_all_mapping_for_chat(session: AsyncSession,doctorId:int):
    result = await session.execute(select(ConsultationMapping).where(ConsultationMapping.psychologist_id==doctorId))
    return result.scalars().all()

async def get_all_mapping_for_chat_user(session: AsyncSession,user_id:int):
    result = await session.execute(
        select(ConsultationMapping).where(ConsultationMapping.user_id==user_id)
        
    )
    return result.scalars().all()

async def consultation_for_user(session: AsyncSession, user_id: int, skip: int, limit: int):
    result = await session.execute(
        select(Consultation)
        .where(Consultation.user_id == user_id)
        .order_by(desc(Consultation.created_at))  
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

async def consultation_details_with_id(session: AsyncSession,  consultation_id: int):
    result = await session.execute(
        select(Consultation)
        .where(Consultation.id == consultation_id)
        
    )
    return result.scalar()

async def consultation_for_doctor(session: AsyncSession, psychologist_id: int, skip: int, limit: int, ordering: Optional[str] = None):
    query = select(Consultation).where(Consultation.psychologist_id == psychologist_id)
    
    # Apply ordering if provided
    if ordering:
        field_name = ordering.lstrip('-')
        is_descending = ordering.startswith('-')
        
        # Map field names to model attributes
        field_mapping = {
            'id': Consultation.id,
            'created_at': Consultation.created_at,
            'status': Consultation.status,
            'duration': Consultation.duration,
            'analysis': Consultation.analysis,
        }
        
        if field_name in field_mapping:
            field = field_mapping[field_name]
            order_clause = desc(field) if is_descending else asc(field)
            query = query.order_by(order_clause)
        else:
            # Default ordering if invalid field
            query = query.order_by(desc(Consultation.created_at))
    else:
        # Default ordering by created_at descending
        query = query.order_by(desc(Consultation.created_at))
    
    # Apply pagination
    query = query.offset(skip).limit(limit)
    
    result = await session.execute(query)
    return result.scalars().all()

async def get_notifications_crud(session: AsyncSession,  skip: int, limit: int):
    result = await session.execute(
        select(Notification)
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

async def get_compliants_crud(session: AsyncSession,  skip: int, limit: int):
    result = await session.execute(
        select(Complaint)
        .order_by(desc(Complaint.created_at))
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

async def count_consultations(session: AsyncSession, user_id: int):
    result = await session.execute(
        select(func.count()).select_from(Consultation).where(Consultation.user_id == user_id)
    )
    return result.scalar()

async def count_consultations_by_doctor_crud(session: AsyncSession, psychologist_id: int):
    result = await session.execute(
        select(func.count()).select_from(Consultation).where(Consultation.psychologist_id == psychologist_id)
    )
    return result.scalar()

async def get_psychologist_rating_crud(session: AsyncSession, psychologist_id: int):
    result = await session.execute(
        select(func.avg(Feedback.rating))
        .join(Consultation, Feedback.consultation_id == Consultation.id)
        .where(Consultation.psychologist_id == psychologist_id)
    )
    return result.scalar()  # Returns None if no ratings found

async def get_feedbacks_crud(session: AsyncSession, psychologist_id: int):
    result = await session.execute(
        select(Feedback)
        .join(Consultation, Feedback.consultation_id == Consultation.id)
        .where(Consultation.psychologist_id == psychologist_id)
    )
    return result.scalars().all()


async def doctor_dashboard_details_crud(session: AsyncSession, psychologist_id: int, selectedYear: int):
    # Total earnings from completed payments for the selected year
    earnings_query = await session.execute(
        select(func.coalesce(func.sum(Payments.psychologist_fee*0.80), 0))
        .join(Consultation, Payments.consultation_id == Consultation.id)
        .where(
            Consultation.psychologist_id == psychologist_id,
            Consultation.status == "completed",
            extract('year', Payments.created_at) == selectedYear
        )
    )
    total_earnings = earnings_query.scalar()

    # Total sessions for the psychologist in the selected year
    sessions_query = await session.execute(
        select(func.count(Consultation.id))
        .where(
            Consultation.status == "completed",
            Consultation.psychologist_id == psychologist_id,
            extract('year', Consultation.created_at) == selectedYear
        )
    )
    total_sessions = sessions_query.scalar()

    # Total unique patients in the selected year
    patients_query = await session.execute(
        select(func.count(func.distinct(Consultation.user_id)))
        .where(
            Consultation.status == "completed",
            Consultation.psychologist_id == psychologist_id,
            extract('year', Consultation.created_at) == selectedYear
        )
    )
    total_patients = patients_query.scalar()

    # Monthly earnings chart data in the selected year
    chart_query = await session.execute(
        select(
            extract('month', Payments.created_at).label('month'),
            func.sum(Payments.psychologist_fee).label('earnings')
        )
        .join(Consultation, Payments.consultation_id == Consultation.id)
        .where(
            Consultation.psychologist_id == psychologist_id,
            Consultation.status == "completed",
            extract('year', Payments.created_at) == selectedYear
        )
        .group_by('month')
        .order_by('month')
    )
    chart_data_raw = chart_query.all()

    # Format chart data as month names
    month_map = {i: calendar.month_abbr[i] for i in range(1, 13)}
    chart_data = [
        {
            "month": month_map.get(int(month), "Unknown"),
            "earnings": int(earning)
        }
        for month, earning in chart_data_raw
    ]

    return {
        "totalEarnings": total_earnings,
        "totalSessions": total_sessions,
        "totalPatients": total_patients,
        "chart_data": chart_data
    }
    
async def admin_dashboard_details_crud(session: AsyncSession, year: int):
    # Total earnings from completed payments in the given year
    earnings_query = await session.execute(
        select(func.coalesce(func.sum(Payments.psychologist_fee*0.20), 0))
        .where(
            Payments.payment_status == "paid",
            extract('year', Payments.created_at) == year
        )
    )
    total_earnings = earnings_query.scalar()

    # Total sessions for the psychologist in the given year
    sessions_query = await session.execute(
        select(func.count(Consultation.id))
        .where(
            extract('year', Consultation.created_at) == year
        )
    )
    total_sessions = sessions_query.scalar()

    # Total unique patients in the given year
    patients_query = await session.execute(
        select(func.count(func.distinct(Consultation.user_id)))
        .where(
            extract('year', Consultation.created_at) == year
        )
    )
    total_patients = patients_query.scalar()

    # Monthly earnings chart data in the given year
    chart_query = await session.execute(
        select(
            extract('month', Payments.created_at).label('month'),
            func.sum(Payments.psychologist_fee).label('earnings')
        )
        .join(Consultation, Payments.consultation_id == Consultation.id)
        .where(
            Payments.payment_status == "paid",
            extract('year', Payments.created_at) == year
        )
        .group_by('month')
        .order_by('month')
    )
    chart_data_raw = chart_query.all()

    # Format chart data with month names
    month_map = {i: calendar.month_abbr[i] for i in range(1, 13)}
    chart_data = [
        {
            "month": month_map.get(int(month), "Unknown"),
            "earnings": int(earning)
        }
        for month, earning in chart_data_raw
    ]

    return {
        "totalEarnings": total_earnings,
        "totalSessions": total_sessions,
        "totalPatients": total_patients,
        "chart_data": chart_data
    }


async def count_notifications(session: AsyncSession):
    result = await session.execute(
        select(func.count()).select_from(Notification)
    )
    return result.scalar()

async def count_compliants(session: AsyncSession):
    result = await session.execute(
        select(func.count()).select_from(Complaint)
    )
    return result.scalar()

async def validate_user_for_consultaion_mapping(session: AsyncSession, user_id: int) -> bool:
    try:
        result = await session.execute(
            select(ConsultationMapping).where(
                or_(
                    ConsultationMapping.user_id == user_id,
                    ConsultationMapping.psychologist_id == user_id
                )
            )
        )
        
        return bool(result.scalar())
    except Exception as e:
        logger.error(f"Error validating consultation mapping for user {user_id}: {e}")
        return False
        
async def validate_user_owns_consultation(session: AsyncSession,consultation_id: int,  user_id: int) -> bool:
    try:
        result = await session.execute(
            select(Consultation).where(
                (Consultation.id == consultation_id) &
                (
                    Consultation.user_id == user_id
                )
            )
        )
        
        return bool(result.scalar())
    except Exception as e:
        logger.error(f"Error validating consultation for user {user_id}: {e}")
        return False
    
async def validate_doctor_owns_consultation(session: AsyncSession,consultation_id :int, user_id: int) -> bool:
    try:
        result = await session.execute(
            select(Consultation).where(
                (Consultation.id == consultation_id) &
                (
                    Consultation.psychologist_id == user_id
                )
            )
        )
        
        return bool(result.scalar())
    except Exception as e:
        logger.error(f"Error validating consultation for user {user_id}: {e}")
        return False
    
async def validate_both_owns_consultation(
    session: AsyncSession,
    consultation_id: int,
    user_id: int
) -> bool:
    try:
        result = await session.execute(
            select(Consultation).where(
                (Consultation.id == consultation_id) &
                (
                    (Consultation.user_id == user_id) |
                    (Consultation.psychologist_id == user_id)
                )
            )
        )
        return bool(result.scalar())
    except Exception as e:
        logger.error(f"Error validating consultation mapping for user {user_id}: {e}")
        return False
    
async def validate_doctor(
    session: AsyncSession,
    psychologist_id: int,
    user_id: int
) -> bool:
    try:
        result = await session.execute(
            select(Psy).where(
                (Consultation.id == consultation_id) &
                (
                    (Consultation.user_id == user_id) |
                    (Consultation.psychologist_id == user_id)
                )
            )
        )
        return bool(result.scalar())
    except Exception as e:
        logger.error(f"Error validating consultation mapping for user {user_id}: {e}")
        return False

        
async def get_chat_messages_using_cons_id(session: AsyncSession, consultation_id: int):
    try:
        consultation_exists = await session.execute(
            select(ConsultationMapping).where(ConsultationMapping.id == consultation_id))
        if not consultation_exists.scalar():
            return []  
       
        result = await session.execute(
            select(Chat)
            .options(selectinload(Chat.attachments))
            .where(Chat.consultation_map_id == consultation_id)
            .order_by(Chat.created_at.asc())
        )
        
        messages = result.scalars().all()
        
       
        formatted_messages = []
        for msg in messages:
           
            attachments = []
            for att in msg.attachments:
                if not att.file_url:  
                    continue
                    
                attachments.append({
                    "id": att.id,
                    "filename": att.filename,  
                    "original_filename": att.original_filename,
                    "file_url": att.file_url,
                    "file_type": att.file_type,
                    "file_size": att.file_size,
                    "upload_status": att.upload_status
                })
            formatted_messages.append({
                "id": msg.id,
                "message": msg.message,
                "sender": msg.sender,  
                "created_at": utc_to_ist(msg.created_at).isoformat(),
                "message_type": msg.message_type,
                "has_attachments": msg.has_attachments,
                "attachments": attachments,
                "consultation_id": consultation_id  
            })

        return formatted_messages

    except SQLAlchemyError as e:
        print(f"Database error in get_chat_messages: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Database error occurred"
        )
    except Exception as e:
        print(f"Unexpected error in get_chat_messages: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred"
        )


async def get_complaints_crud(session: AsyncSession,user_id:int):
    result = await session.execute(
        select(Complaint)
        .join(Consultation)
        .where(Consultation.user_id == user_id)
    )
    return result.scalars().all()


async def get_doctor_consultations(session: AsyncSession,doctorId):
    result = await session.execute(
        select(Consultation)
        .options(selectinload(Consultation.payments)).where(Consultation.psychologist_id==doctorId)
    )
    return result.scalars().all()


async def verify_user_consultation(session: AsyncSession, consultation_id, current_user_id):
    result = await session.execute(
        select(ConsultationMapping).where(
            ConsultationMapping.id == consultation_id,
            or_(
                ConsultationMapping.psychologist_id == current_user_id,
                ConsultationMapping.user_id == current_user_id
            )
        )
    )
    return result.scalars().first()

async def get_doctor_fee_after_platform_fee(session: AsyncSession,consultation_id :int):
    result = await session.execute(
        select(func.coalesce(func.sum(Payments.psychologist_fee*0.80), 0))
        .where(Payments.consultation_id==consultation_id)
    )
    return result.scalar()

async def save_chat_message_with_attachments(
    session: AsyncSession,
    message: Optional[str],
    consultation_id: int,
    sender_type: str,
    attachments: List[Dict] = None,
    message_type: str = 'text'
) -> Dict:
    try:
        if session.in_transaction():
            await session.rollback()

        logger.debug(f"Inserting chat: consultation_id={consultation_id}, sender={sender_type}, message={message}")
        logger.debug(f"Attachments: {attachments}")

        chat = Chat(
            message=message,
            sender=sender_type,
            consultation_map_id=consultation_id,
            message_type=message_type,
            has_attachments=bool(attachments and len(attachments) > 0)
        )
        session.add(chat)
        await session.flush()
        attachment_ids = []
        if attachments:
            for attachment_data in attachments:
                if attachment_data.get('upload_status') == 'success':
                    logger.debug(f"Processing attachment: {attachment_data}")
                    original_filename = attachment_data.get('original_filename', attachment_data.get('filename', 'unknown'))
                    file_path = attachment_data.get('file_path', '')
                    attachment = ChatAttachment(
                        chat_id=chat.id,
                        filename=attachment_data['filename'],
                        original_filename=original_filename,
                        file_path=file_path,
                        file_url=attachment_data['file_url'],
                        file_type=attachment_data['file_type'],
                        file_size=attachment_data['file_size'],
                        upload_status=attachment_data['upload_status']
                    )
                    session.add(attachment)
                    await session.flush()
                    attachment_ids.append(attachment.id)

        await session.commit()

        return {
            "chat_id": chat.id,
            "attachment_ids": attachment_ids,
            "created_at": chat.created_at.isoformat() if hasattr(chat, 'created_at') else datetime.utcnow().isoformat()
        }

    except Exception as e:
        await session.rollback()
        logger.error("Error saving chat message:", traceback.format_exc())
        raise RuntimeError("Failed to save chat message")

       
async def update_complaints_curd(session: AsyncSession, data :UpdateComplaintSchema,complaint_id:int):
    result = await session.execute(select(Complaint).where(Complaint.id == complaint_id))
    complaint = result.scalar_one_or_none()
    complaint.status=data.editingStatus
    await session.commit()
    
async def delete_partial_consultation(session: AsyncSession,consultation_id:int):
    result = await session.execute(
        select(Complaint)
        .join(Consultation)
        .where(Consultation.user_id == consultation_id)
    )
    return result.scalars().all()