from sqlalchemy import Column, Integer, String, Text,  ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class WalletTransaction(Base):
    __tablename__ = "wallet_transaction"

    id = Column(Integer, primary_key=True, index=True)
    wallet_id = Column(Integer, ForeignKey("wallet.id"), nullable=False)
    transaction_amount = Column(Integer)
    transaction_detail = Column(Text)
    transaction_type = Column(String(10))  #