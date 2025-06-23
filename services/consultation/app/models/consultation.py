from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy import Column, Integer, String, Text, Date, Boolean, ForeignKey, TIMESTAMP
from sqlalchemy.sql import func
Base = declarative_base()

class Consultation(Base):
    __tablename__ = "consultation"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, index=True)
    psychologist_id = Column(Integer, index=True)
    analysis=Column(Text)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), onupdate=func.now())
    status = Column(String(20))
    duration= Column(String)
    
    payments = relationship("Payments", back_populates="consultation", uselist=False)
    feedback = relationship('Feedback',back_populates='consultation',uselist=False)
    complaints = relationship("Complaint", back_populates="consultation", cascade="all, delete-orphan")


class Feedback(Base):
    __tablename__='feedback'
    
    id = Column(Integer, primary_key=True, index = True, autoincrement=True)
    user_id = Column(Integer, index=True,nullable=False)
    consultation_id = Column(Integer,ForeignKey('consultation.id', ondelete='CASCADE'),nullable=False)
    message = Column(Text,nullable=False)
    rating = Column(Integer,nullable=False) 
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    
    consultation = relationship('Consultation',back_populates='feedback',uselist=False)

class Payments(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    consultation_id = Column(Integer, ForeignKey("consultation.id", ondelete='CASCADE'), nullable=False)
    psychologist_fee = Column(Integer)
    payment_status=Column(String(20))
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), onupdate=func.now())

    consultation = relationship("Consultation", back_populates="payments")
    
class ConsultationMapping(Base):
    __tablename__='consultation_mapping'
    
    id = Column(Integer, primary_key=True,index=True , autoincrement=True)
    user_id = Column(Integer, index=True)
    psychologist_id = Column(Integer, index=True)
    
    # One-to-many relationship
    chat_messages = relationship("Chat", back_populates="consultation_mapping", cascade="all, delete-orphan")


class Chat(Base):
    __tablename__ = 'chat'

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    message = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    sender = Column(Text,nullable=False)
    consultation_map_id = Column(Integer, ForeignKey('consultation_mapping.id', ondelete="CASCADE"))
    
    consultation_mapping = relationship("ConsultationMapping", back_populates="chat_messages")
    
    
class Notification(Base):
    __tablename__ = 'notifications'

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(Text, nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    
class Complaint(Base):  # corrected spelling if it's meant to be "complaint"
    __tablename__ = 'complaint'

    id = Column(Integer, primary_key=True, autoincrement=True)
    consultation_id = Column(Integer, ForeignKey("consultation.id", ondelete='CASCADE'), nullable=False)
    type = Column(String(50))  
    subject = Column(String(255))
    description = Column(Text)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    status = Column(String(20))
    
    consultation = relationship("Consultation", back_populates="complaints")