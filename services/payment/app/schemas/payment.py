# Pydantic schemas

from pydantic import BaseModel, EmailStr, Field,validator
from typing import Optional
from datetime import date, datetime


class RazorpayOrder(BaseModel):
    user_id: int
    totalAmount: int

# class UserOut(BaseModel):
#     id: int
#     name: str
#     email_address: EmailStr
#     mobile_number: str
#     role: str

#     model_config = {
#         "from_attributes": True
#     }
    
# class OtpVerification(BaseModel):
#     otp:str
#     email : EmailStr
    
# class LoginSchema(BaseModel):
#     email:EmailStr
#     password :str
    
# class ForgetPasswordSchema(BaseModel):
#     email:EmailStr
   

# class ForgetPasswordOTPSchema(BaseModel):
#     email:EmailStr
#     otp:int
#     password :str
    
    
# class PsychologistProfileOut(BaseModel):
#     id: int
#     user: UserOut
#     specialization: Optional[str]
#     profile_image: Optional[str]
#     is_verified: bool
#     is_available: Optional[bool]

#     model_config = {
#         "from_attributes": True
#     }
    
# class UserProfileOut(BaseModel):
#     id: int
#     user: UserOut
#     date_of_birth: Optional[date]
#     profile_image: Optional[str]
#     gender: str

#     model_config = {
#         "from_attributes": True
#     }
    
# class UserProfileUpdate(BaseModel):
#     date_of_birth: Optional[date]
#     gender: Optional[str]
#     profile_image: Optional[str]

# class UserUpdate(BaseModel):
#     name: Optional[str]
#     mobile_number: Optional[str]

# class FullUserUpdate(UserUpdate, UserProfileUpdate):
#     pass


# class DoctorVerificationCreate(BaseModel):
#     dateOfBirth: date
#     experience: str
#     gender: str
#     fees: str
#     qualification: str
#     specialization: str
#     aboutMe: str

# class DoctorVerificationOut(BaseModel):
#     user_id: int
#     date_of_birth: date = Field(...)
#     created_at:  Optional[date]
#     experience: str
#     gender: str
#     fees: int
#     user:UserOut
#     qualification: str
#     specialization: str
#     profile_image: Optional[str]
#     about_me: str = Field(...)
#     identification_doc: str = Field(...)
#     education_certificate: str = Field(...)
#     experience_certificate: str = Field(...)
#     is_verified: Optional[bool] = Field(None)
#     is_available: Optional[bool] = Field(None)
    
#     model_config = {
#         "from_attributes": True
#     }
    
# class UserProfileFields(BaseModel):
#     date_of_birth: Optional[date]
#     profile_image: Optional[str]
#     gender: Optional[str]

#     model_config = {
#         "from_attributes": True
#     }

# class UserWithOptionalProfileOut(BaseModel):
#     id: int
#     name: str
#     email_address: EmailStr
#     mobile_number: str
#     role: str
#     user_profile: Optional[UserProfileFields] = None

#     model_config = {
#         "from_attributes": True
#     }
