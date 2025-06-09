from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy import Column, Integer, String, Text, Date, Boolean, ForeignKey, TIMESTAMP
from sqlalchemy.sql import func
Base = declarative_base()

class Consultation(Base):
    __tablename__ = "consultation"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    psychologist_id = Column(Integer, index=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), onupdate=func.now())
    status = Column(String(20))
    
    payments = relationship("Payments", back_populates="consultation", uselist=False)



class Payments(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    consultation_id = Column(Integer, ForeignKey("consultation.id"), nullable=False)
    psychologist_fee = Column(Integer)
    payment_status=Column(String(20))
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), onupdate=func.now())

    consultation = relationship("Consultation", back_populates="payments")
