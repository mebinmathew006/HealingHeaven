from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

# class Wallet(Base):
#     __tablename__ = "wallet"

#     id = Column(Integer, primary_key=True, index=True)
#     user_id = Column(Integer, unique=True, index=True)
#     balance = Column(Integer, default=0)

#     # One-to-many relationship: one Wallet -> many WalletTransactions
#     wallet_transactions = relationship("WalletTransaction", back_populates="wallet", cascade="all, delete-orphan")

# class WalletTransaction(Base):
#     __tablename__ = "wallet_transaction"

#     id = Column(Integer, primary_key=True, index=True)
#     wallet_id = Column(Integer, ForeignKey("wallet.id"), nullable=False)
#     transaction_amount = Column(Integer)

#     wallet = relationship("Wallet", back_populates="wallet_transactions")
