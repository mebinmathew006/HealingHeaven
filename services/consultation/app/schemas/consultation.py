# Pydantic schemas

from pydantic import BaseModel, EmailStr , ConfigDict
from typing import Optional,List
from datetime import date, datetime


class UpdateConsultationSchema(BaseModel):
    consultation_id: int
    message: str
    duration:str
    
class CreateConsultationSchema(BaseModel):
    user_id: int
    psychologist_id: int
    psychologist_fee: int
    
class UserOut(BaseModel):
    id: int
    name: str
    email_address: EmailStr
    mobile_number: str
    role: str   
    
class UserProfileImage(BaseModel):
    profile_image: Optional[str]
    
    model_config = ConfigDict(extra="ignore")
class UserNameWithProfileImage(BaseModel):
    name: str
    user_profile: Optional[UserProfileImage] = None
    model_config = ConfigDict(extra="ignore")
    
class CreateFeedbackSchema(BaseModel):
    id :Optional[int]
    created_at :Optional[datetime]
    consultation_id: int
    rating: int
    user_id: int
    message: str
    user:Optional[UserNameWithProfileImage]
    
class CreateNotificationSchema(BaseModel):
    title: str
    message: str
    
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
class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    created_at: datetime

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
    
class ConsultationResponseUser(BaseModel):
    
    id :int
    analysis:Optional[str]
    created_at :Optional[datetime]
    status :Optional[str]
    duration :Optional[str]
    user: Optional[DoctorNameWithProfileImage]

    model_config = {
        "from_attributes": True
    }
class CompliantSchema(BaseModel):
    id :int
    consultation_id:int
    type: str
    subject: str
    description: str
    status: Optional[str]
    
    model_config = {
        "from_attributes": True
    }
    
class PaginatedConsultationResponse(BaseModel):
    count: int
    next: Optional[str]
    previous: Optional[str]
    results: List[ConsultationResponseUser]
    
class PaginatedNotificationResponse(BaseModel):
    count: int
    next: Optional[str]
    previous: Optional[str]
    results: List[NotificationResponse] 
    
class CompliantPaginatedResponse(BaseModel):
    count: int
    next: Optional[str]
    previous: Optional[str]
    results: List[CompliantSchema] 
    
class UpdateComplaintSchema(BaseModel):
    editingStatus:str