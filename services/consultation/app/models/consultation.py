from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy import Column, Integer, String, Text, BigInteger, Boolean, ForeignKey, TIMESTAMP
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
    video = Column(Text, nullable=True)
    
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
    
    id = Column(Integer, primary_key=True, index=True , autoincrement=True)
    user_id = Column(Integer, index=True)
    psychologist_id = Column(Integer, index=True)
    
    # One-to-many relationship
    chat_messages = relationship("Chat", back_populates="consultation_mapping", cascade="all, delete-orphan")


class Chat(Base):
    __tablename__ = 'chat'

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    message = Column(Text, nullable=True)  # Now nullable since message can be empty with files
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    sender = Column(Text, nullable=False)
    consultation_map_id = Column(Integer, ForeignKey('consultation_mapping.id', ondelete="CASCADE"))
    
    # New fields for file support
    message_type = Column(Text, default='text')  # 'text', 'media', 'file'
    has_attachments = Column(Boolean, default=False)
    
    consultation_mapping = relationship("ConsultationMapping", back_populates="chat_messages")
    attachments = relationship("ChatAttachment", back_populates="chat_message", cascade="all, delete-orphan")


class ChatAttachment(Base):
    __tablename__ = 'chat_attachments'

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    chat_id = Column(Integer, ForeignKey('chat.id', ondelete="CASCADE"))
    
    # File information
    filename = Column(Text, nullable=False)
    original_filename = Column(Text, nullable=False)
    file_path = Column(Text, nullable=False)
    file_url = Column(Text, nullable=False)
    file_type = Column(Text, nullable=False)  # MIME type
    file_size = Column(BigInteger, nullable=False)  # Size in bytes
    
    # Upload information
    uploaded_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    upload_status = Column(Text, default='success')  # 'success', 'failed', 'processing'
    
    chat_message = relationship("Chat", back_populates="attachments")
    
    
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