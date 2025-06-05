# Pydantic schemas

from pydantic import BaseModel, EmailStr, Field,validator
from typing import Optional
from datetime import date, datetime


class CreateConsultationSchema(BaseModel):
    user_id: int
    psychologist_id: int
    psychologist_fee: int
    
class PaymentBase(BaseModel):
    consultation_id: int
    psychologist_fee: Optional[int]
    payment_status: Optional[str]
    
class PaymentResponse(PaymentBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = {
        "from_attributes": True
    }
        
class ConsultationBase(BaseModel):
    user_id: int
    psychologist_id: int
    status: Optional[str] = "pending" 
       
class ConsultationCreate(ConsultationBase):
    psychologist_fee: Optional[int]
    
class ConsultationResponse(ConsultationBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]
    payments: Optional[PaymentResponse]

    model_config = {
        "from_attributes": True
    }