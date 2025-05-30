from sqlalchemy import Column, Integer, String, Boolean, Text, TIMESTAMP, Date, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class PsychologistProfile(Base):
    __tablename__ = "psychologist_profile"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    profile_image = Column(Text)
    date_of_birth = Column(Date)
    gender = Column(String(10))
    about_me = Column(Text)
    qualification = Column(String(255))
    experience = Column(Integer)
    specialization = Column(String(255))
    fees = Column(Integer)
    identification_doc = Column(Text)
    education_certificate = Column(Text)
    experience_certificate = Column(Text)
    is_verified = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), onupdate=func.now())