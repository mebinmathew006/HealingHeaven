from sqlalchemy import Column, Integer, String,  Text,  Date, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class PatientProfile(Base):
    __tablename__ = "patient_profile"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    profile_image = Column(Text)
    date_of_birth = Column(Date)
    gender = Column(String(10))