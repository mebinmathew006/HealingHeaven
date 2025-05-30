# Pydantic schemas

from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    name: str
    email_address: EmailStr
    mobile_number: str
    password: str
    role: str

class UserOut(BaseModel):
    id: int
    name: str
    email_address: EmailStr
    mobile_number: str
    role: str

    class Config:
        orm_mode = True
