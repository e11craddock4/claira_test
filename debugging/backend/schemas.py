from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class CategoryBase(BaseModel):
    name: str
    keywords: Optional[str] = ""

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    id: int
    
    class Config:
        from_attributes = True

class TransactionBase(BaseModel):
    date: datetime
    description: str
    amount: float
    category_id: Optional[int] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    category_id: Optional[int] = None

class Transaction(TransactionBase):
    id: int
    category_obj: Optional[Category] = None
    
    class Config:
        from_attributes = True

class ExpenseSummary(BaseModel):
    category: str
    total_amount: float
    transaction_count: int

class CopilotQuery(BaseModel):
    question: str

class CopilotResponse(BaseModel):
    answer: str
    data: Optional[dict] = None 
