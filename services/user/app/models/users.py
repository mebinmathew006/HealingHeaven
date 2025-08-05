# SQLAlchemy models
from sqlalchemy import Column, Integer, String, Text, Date, Boolean, ForeignKey, TIMESTAMP
from sqlalchemy.orm import declarative_base
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    email_address = Column(String(255), unique=True, index=True)
    mobile_number = Column(String(15))
    password = Column(Text)
    role = Column(String(50))
    is_active = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=True,  onupdate=func.now())
    
    user_profile = relationship("UserProfile", back_populates="user", uselist=False)
    psychologist_profile = relationship("PsychologistProfile", back_populates="user", uselist=False)
    

class UserProfile(Base):
    __tablename__ = "user_profile"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    profile_image = Column(Text, nullable=True)
    date_of_birth = Column(Date, nullable=True)
    gender = Column(String(10), nullable=True)
    user = relationship("User", back_populates="user_profile")


class PsychologistProfile(Base):
    __tablename__ = "psychologist_profile"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    profile_image = Column(Text, nullable=True)
    date_of_birth = Column(Date, nullable=True)
    gender = Column(String(10), nullable=True)
    about_me = Column(Text, nullable=True)
    qualification = Column(String(255), nullable=True)
    experience = Column(String, nullable=True)
    specialization = Column(String(255), nullable=True)
    fees = Column(Integer, nullable=True)
    identification_doc = Column(Text, nullable=True)
    education_certificate = Column(Text, nullable=True)
    reason_block = Column(Text, nullable=True)
    experience_certificate = Column(Text, nullable=True)
    is_verified = Column(String(10), default='pending')
    is_available = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, nullable=True)
    updated_at = Column(TIMESTAMP, nullable=True)
    user = relationship("User", back_populates="psychologist_profile")
