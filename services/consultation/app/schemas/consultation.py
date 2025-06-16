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
    
class ChatResponse(BaseModel):
    id: int
    message: str
    created_at: Optional[datetime]
    sender :str
    model_config = {
        "from_attributes": True
    }
class UserOut(BaseModel):
    id: int
    name: str
    email_address: EmailStr
    mobile_number: str
    role: str
    
class UserProfileImage(BaseModel):
    profile_image: Optional[str]
    
class UserNameWithProfileImage(BaseModel):
    name: str
    user_profile: Optional[UserProfileImage] = None
    
class MappingResponse(BaseModel):
    id: int
    user_id: int
    psychologist_id: int
    user: Optional[UserNameWithProfileImage]

    model_config = {
        "from_attributes": True
    }
    
class ConsultationRequest(BaseModel):
    user_id: str
    doctor_id: str
    
class DoctorProfileDetails(BaseModel):
    profile_image: Optional[str]
    specialization: Optional[str]
        
class DoctorNameWithProfileImage(BaseModel):
    name: str
    psychologist_profile: Optional[DoctorProfileDetails] = None

    model_config = {
        "from_attributes": True
    }
    
class MappingResponseUser(BaseModel):
    id: int
    user_id: int
    psychologist_id: int
    user: Optional[DoctorNameWithProfileImage]

    model_config = {
        "from_attributes": True
    }