# Pydantic schemas

from pydantic import BaseModel, EmailStr, Field,validator
from typing import Optional,List
from datetime import date
import re

class GoogleLoginSchema(BaseModel):
    credential: str
    

class UserCreate(BaseModel):
    name: str
    email_address: EmailStr
    mobile_number: str
    password: str
    confirmPassword: str
    role: str

    @validator("name")
    def validate_name(cls, v):
        if not re.fullmatch(r"[A-Za-z ]+", v):
            raise ValueError("Name must contain only alphabets and spaces")
        return v

    @validator("mobile_number")
    def validate_mobile_number(cls, v):
        if not v.isdigit():
            raise ValueError("Mobile number must contain only digits")
        if len(v) != 10:
            raise ValueError("Mobile number must be exactly 10 digits")
        if v[0] not in {"9", "8", "7", "6"}:
            raise ValueError("Mobile number must start with 9, 8, 7, or 6")
        return v

    @validator("password")
    def validate_password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain at least one special character")
        return v

    @validator("confirmPassword")
    def validate_confirm_password(cls, v, values):
        password = values.get("password")
        if password and v != password:
            raise ValueError("Passwords do not match")
        return v

    @validator("role")
    def validate_role(cls, v):
        allowed_roles = {"patient", "doctor"}
        if v.lower() not in allowed_roles:
            raise ValueError("Invalid Role provided")
        return v.lower()


class UserOut(BaseModel):
    id: int
    name: str
    email_address: EmailStr
    mobile_number: str
    role: str

    model_config = {
        "from_attributes": True
    }
    
class UserOutForPublic(BaseModel):
    id: int
    name: str
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
    
    @validator("password")
    def validate_password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain at least one special character")
        return v
    
class AvailabilityUpdate(BaseModel):
    is_available: bool
        
class PsychologistProfileOut(BaseModel):
    id: int
    fees: int
    user: UserOutForPublic
    specialization: Optional[str]
    profile_image: Optional[str]
    experience: Optional[str]
    about_me: Optional[str]
    qualification: Optional[str]
    is_verified: Optional[str]
    is_available: Optional[bool]
    rating: Optional[float]

    model_config = {
        "from_attributes": True
    }
    
class PaginatedPsychologistResponse(BaseModel):
    count: int
    next: Optional[str]
    previous: Optional[str]
    results: List[PsychologistProfileOut]
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
    
    @validator("name")
    def validate_name(cls, v):
        if not re.fullmatch(r"[A-Za-z ]+", v):
            raise ValueError("Name must contain only alphabets and spaces")
        return v

    @validator("mobile_number")
    def validate_mobile_number(cls, v):
        if not v.isdigit():
            raise ValueError("Mobile number must contain only digits")
        if len(v) != 10:
            raise ValueError("Mobile number must be exactly 10 digits")
        if v[0] not in {"9", "8", "7", "6"}:
            raise ValueError("Mobile number must start with 9, 8, 7, or 6")
        return v
    
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
