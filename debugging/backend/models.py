from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base # .ext.declarative was depreciated 
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

Base = declarative_base()

class Category(Base):
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    keywords = Column(String)  # comma-separated keywords for auto-categorization
    
    transactions = relationship("Transaction", back_populates="category_obj")

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, index=True)
    description = Column(String, index=True)
    amount = Column(Float)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    
    category_obj = relationship("Category", back_populates="transactions")

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./finance.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_tables():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 
