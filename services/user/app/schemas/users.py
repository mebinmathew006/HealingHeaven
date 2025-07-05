# Pydantic schemas

from pydantic import BaseModel, EmailStr, Field,validator
from typing import Optional
from datetime import date, datetime

class GoogleLoginSchema(BaseModel):
    credential: str
    
class UserCreate(BaseModel):
    name: str
    email_address: EmailStr
    mobile_number: str
    password: str
    role: str
    @validator("mobile_number")
    def validate_mobile_number(cls, v):
        if not v.isdigit():
            raise ValueError("Mobile number must contain only digits")
        if len(v) != 10:
            raise ValueError("Mobile number must be exactly 10 digits")
        return v

class UserOut(BaseModel):
    id: int
    name: str
    email_address: EmailStr
    mobile_number: str
    role: str

    model_config = {
        "from_attributes": True
    }
    
class OtpVerification(BaseModel):
    otp:str
    email : EmailStr
    
class RevokeDetails(BaseModel):
    reason:str
    status: str
    
class LoginSchema(BaseModel):
    email:EmailStr
    password :str
    
class ForgetPasswordSchema(BaseModel):
    email:EmailStr
   

class ForgetPasswordOTPSchema(BaseModel):
    email:EmailStr
    otp:int
    password :str
    
    
class PsychologistProfileOut(BaseModel):
    id: int
    user: UserOut
    specialization: Optional[str]
    profile_image: Optional[str]
    is_verified: Optional[str]
    is_available: Optional[bool]
    rating: Optional[float]

    model_config = {
        "from_attributes": True
    }
    
class UserProfileOut(BaseModel):
    id: int
    user: UserOut
    date_of_birth: Optional[date]
    profile_image: Optional[str]
    gender: str

    model_config = {
        "from_attributes": True
    }
    
class UserProfileUpdate(BaseModel):
    date_of_birth: Optional[date]
    gender: Optional[str]
    profile_image: Optional[str]

class UserUpdate(BaseModel):
    name: Optional[str]
    mobile_number: Optional[str]

class FullUserUpdate(UserUpdate, UserProfileUpdate):
    pass


class DoctorVerificationCreate(BaseModel):
    dateOfBirth: date
    experience: str
    gender: str
    fees: str
    qualification: str
    specialization: str
    aboutMe: str

class DoctorVerificationOut(BaseModel):
    user_id: int
    date_of_birth: date = Field(...)
    created_at:  Optional[date]
    experience: str
    gender: str
    fees: int
    user:UserOut
    qualification: str
    specialization: str
    profile_image: Optional[str]
    reason_block: Optional[str]
    about_me: str = Field(...)  
    identification_doc: str = Field(...)
    education_certificate: str = Field(...)
    experience_certificate: str = Field(...)
    is_verified: Optional[str] = Field(None)
    is_available: Optional[bool] = Field(None)
    
    model_config = {
        "from_attributes": True
    }
    
class UserProfileFields(BaseModel):
    date_of_birth: Optional[date]
    profile_image: Optional[str]
    gender: Optional[str]

    model_config = {
        "from_attributes": True
    }
    
class UserWithOptionalProfileOut(BaseModel):
    id: int
    name: str
    email_address: EmailStr
    mobile_number:  Optional[str]
    role: str
    user_profile: Optional[UserProfileFields] = None

    model_config = {
        "from_attributes": True
    }
    
class UserProfileImage(BaseModel):
    profile_image: Optional[str]
    
class DoctorProfileDetails(BaseModel):
    profile_image: Optional[str]
    specialization: Optional[str]
    fees: Optional[int]
    
class UserNameWithProfileImage(BaseModel):
    
    name: str
    user_profile: Optional[UserProfileImage] = None

    model_config = {
        "from_attributes": True
    }
    
class DoctorNameWithProfileImage(BaseModel):
    id : int
    name: str
    psychologist_profile: Optional[DoctorProfileDetails] = None

    model_config = {
        "from_attributes": True
    }
