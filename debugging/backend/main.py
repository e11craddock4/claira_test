from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List, Dict, Any
import pandas as pd
import io
from datetime import datetime, timedelta
import logging

from models import get_db, create_tables, Transaction, Category
from schemas import (
    Transaction as TransactionSchema,
    TransactionCreate,
    TransactionUpdate,
    Category as CategorySchema,
    CategoryCreate,
    ExpenseSummary,
    CopilotQuery,
    CopilotResponse
)
from services import CategorizationService, CopilotService

app = FastAPI(title="Personal Finance Copilot", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables on startup
@app.on_event("startup")
async def startup_event():
    create_tables()
    
    # Create default categories if they don't exist
    db_gen = get_db()
    db = next(db_gen)
    try:
        categorization_service = CategorizationService(db)
        categorization_service.create_default_categories()
    finally:
        db_gen.close()

@app.get("/")
async def root():
    return {"message": "Personal Finance Copilot API"}

# Transaction endpoints
@app.post("/api/transactions/upload")
async def upload_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload and parse CSV file with transactions."""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")
    
    contents = await file.read()
    df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
    
    # Validate required columns
    required_columns = ['date', 'description', 'amount']
    missing_columns = [col for col in required_columns if col not in df.columns]
    if missing_columns:
        raise HTTPException(
            status_code=400, 
            detail=f"Missing required columns: {missing_columns}"
        )
    
    categorization_service = CategorizationService(db)
    transactions_created = []
    
    for _, row in df.iterrows():
        try:
            # Parse date
            date = pd.to_datetime(row['date']).to_pydatetime()
            
            # Auto-categorize
            category_id = categorization_service.auto_categorize_transaction(row['description'])
            
            # Create transaction
            transaction = Transaction(
                date=date,
                description=str(row['description']),
                amount=float(row['amount']),
                category_id=category_id
            )
            
            db.add(transaction)
            transactions_created.append(transaction)
            
        # except Exception as e:
        #     continue  # Skip invalid rows
        except Exception as e:
            logging.warning(f"Skipping row due to error: {e}")
            continue
    
    db.commit()
    
    return {
        "message": f"Successfully uploaded {len(transactions_created)} transactions",
        "count": len(transactions_created)
    }

@app.get("/api/transactions", response_model=List[TransactionSchema])
async def get_transactions(
    skip: int = 0, 
    limit: int = 100,
    category_id: int = None,
    db: Session = Depends(get_db)
):
    """Get all transactions with optional filtering."""
    query = db.query(Transaction)
    
    if category_id is not None:
        query = query.filter(Transaction.category_id == category_id)
    
    transactions = query.offset(skip).limit(limit).all()
    return transactions

@app.put("/api/transactions/{transaction_id}", response_model=TransactionSchema)
async def update_transaction(
    transaction_id: int,
    transaction_update: TransactionUpdate,
    db: Session = Depends(get_db)
):
    """Update a transaction (mainly for changing category)."""
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    if transaction_update.category_id is not None:
        transaction.category_id = transaction_update.category_id
    
    db.commit()
    db.refresh(transaction)
    return transaction

# Category endpoints
@app.get("/api/categories", response_model=List[CategorySchema])
async def get_categories(db: Session = Depends(get_db)):
    """Get all categories."""
    return db.query(Category).all()

@app.post("/api/categories", response_model=CategorySchema)
async def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    """Create a new category."""
    db_category = Category(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

# Dashboard endpoints
@app.get("/api/dashboard/summary")
async def get_dashboard_summary(db: Session = Depends(get_db)):
    """Get dashboard summary data."""
    # Total expenses
    total_expenses = db.query(func.sum(func.abs(Transaction.amount))).scalar() or 0
    
    # Total transactions
    total_transactions = db.query(Transaction).count()
    
    # Expenses by category
    expenses_by_category = db.query(
        Category.name,
        func.sum(func.abs(Transaction.amount)).label('total'),
        func.count(Transaction.id).label('count')
    ).join(Transaction, Category.id == Transaction.category_id, isouter=True)\
     .group_by(Category.name).all()
    
    category_data = [
        {
            "category": row.name or "Uncategorized",
            "total_amount": float(row.total or 0),
            "transaction_count": int(row.count or 0)
        }
        for row in expenses_by_category
    ]
    
    # Monthly expenses (last 12 months)
    twelve_months_ago = datetime.now() - timedelta(days=365)
    monthly_expenses = db.query(
        extract('year', Transaction.date).label('year'),
        extract('month', Transaction.date).label('month'),
        func.sum(func.abs(Transaction.amount)).label('total')
    ).filter(Transaction.date >= twelve_months_ago)\
     .group_by(extract('year', Transaction.date), extract('month', Transaction.date))\
     .order_by(extract('year', Transaction.date), extract('month', Transaction.date)).all()
    
    monthly_data = [
        {
            "year": int(row.year),
            "month": int(row.month),
            "total_amount": float(row.total)
        }
        for row in monthly_expenses
    ]
    
    return {
        "total_expenses": float(total_expenses),
        "total_transactions": total_transactions,
        "expenses_by_category": category_data,
        "monthly_expenses": monthly_data
    }

# Copilot endpoint
@app.post("/api/copilot/query", response_model=CopilotResponse)
async def query_copilot(query: CopilotQuery, db: Session = Depends(get_db)):
    """Process natural language queries about expenses."""
    copilot_service = CopilotService(db)
    result = copilot_service.process_query(query.question)
    
    return CopilotResponse(**result)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 
