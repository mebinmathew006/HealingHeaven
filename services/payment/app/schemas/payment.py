# Pydantic schemas

from pydantic import BaseModel, EmailStr, Field,validator
from typing import Optional
from datetime import date, datetime
from typing import List

class RazorpayOrder(BaseModel):
    user_id: int
    totalAmount: float
    
class UserConsultationMoney(BaseModel):
    user_id:int
    psychologist_id:int
    psychologist_fee:int
    
class WalletTransactionOut(BaseModel):
    id: int
    wallet_id: int
    transaction_amount: int
    created_at :Optional[datetime]

    model_config = {
        "from_attributes": True
    }
class WalletWithTransactionsOut(BaseModel):
    id: int
    user_id: int
    balance: int
    wallet_transactions: List[WalletTransactionOut] = []

    model_config = {
        "from_attributes": True
    }
    
class WalletWithTransactionsPagination(BaseModel):
    count: int
    next: str
    previous: str
    results: List[WalletWithTransactionsOut] = []

   
    
class WalletBalanceOut(BaseModel):
    balance: int

    model_config = {
        "from_attributes": True
    }
    
    

    
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
