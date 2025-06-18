import pandas as pd
import re
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from models import Transaction, Category
from schemas import ExpenseSummary

class CategorizationService:
    def __init__(self, db: Session):
        self.db = db
        
    def auto_categorize_transaction(self, description: str) -> Optional[int]:
        """Automatically categorize a transaction based on description keywords."""
        categories = self.db.query(Category).all()
        
        description_lower = description.lower()
        
        for category in categories:
            if category.keywords:
                keywords = [kw.strip().lower() for kw in category.keywords.split(',')]
                for keyword in keywords:
                    if keyword in description_lower:
                        return category.id
        
        return None
    
    def create_default_categories(self):
        """Create default categories with common keywords."""
        default_categories = [
            {"name": "Groceries", "keywords": "grocery,supermarket,whole foods,trader joe,safeway,kroger,walmart,target"},
            {"name": "Restaurants", "keywords": "restaurant,cafe,coffee,starbucks,mcdonald,pizza,chipotle,subway"},
            {"name": "Gas", "keywords": "gas,fuel,shell,chevron,exxon,bp,mobil"},
            {"name": "Shopping", "keywords": "amazon,mall,store,shop,retail,clothing,electronics"},
            {"name": "Utilities", "keywords": "electric,gas bill,water,internet,phone,cable,utility"},
            {"name": "Transportation", "keywords": "uber,lyft,taxi,metro,bus,train,parking"},
            {"name": "Entertainment", "keywords": "movie,theater,netflix,spotify,game,gym,sport"},
            {"name": "Healthcare", "keywords": "doctor,hospital,pharmacy,medical,health,dental"},
            {"name": "Other", "keywords": ""}
        ]
        
        for cat_data in default_categories:
            existing = self.db.query(Category).filter(Category.name == cat_data["name"]).first()
            if not existing:
                category = Category(**cat_data)
                self.db.add(category)
        
        self.db.commit()

class CopilotService:
    def __init__(self, db: Session):
        self.db = db
    
    def process_query(self, question: str) -> Dict:
        """Process natural language queries about expenses."""
        question_lower = question.lower()
        
        # Extract time period
        time_filter = self._extract_time_period(question_lower)
        
        # Extract category
        category_filter = self._extract_category(question_lower)
        print(category_filter,time_filter)
        # Determine query type
        if any(word in question_lower for word in ["how much", "total", "spent", "spend"]):
            return self._handle_amount_query(category_filter, time_filter)
        elif any(word in question_lower for word in ["biggest", "largest", "highest", "maximum"]):
            return self._handle_biggest_purchase_query(category_filter, time_filter)
        elif any(word in question_lower for word in ["how many", "count", "number"]):
            return self._handle_count_query(category_filter, time_filter)
        else:
            return self._handle_general_query(category_filter, time_filter)
    
    def _extract_time_period(self, question: str) -> Optional[Dict]:
        """Extract time period from question."""
        now = datetime.now()
        
        if "last month" in question:
            end_date = (now.replace(day=1) - timedelta(days=1))
            start_date = end_date.replace(day=1)
            return {"start": end_date, "end": start_date, "period": "last month"}
        
        if "this month" in question:
            start_date = now.replace(day=1)
            return {"start": start_date, "end": now, "period": "this month"}
        
        # Look for specific months
        months = {
            "january": 1, "february": 2, "march": 3, "april": 4,
            "may": 5, "june": 6, "july": 7, "august": 8,
            "september": 9, "october": 10, "november": 11, "december": 12
        }
        
        for month_name, month_num in months.items():
            if month_name in question:
                year = now.year if month_num <= now.month else now.year - 1
                start_date = datetime(year, month_num, 1)
                if month_num == 12:
                    end_date = datetime(year + 1, 1, 1) - timedelta(days=1)
                else:
                    end_date = datetime(year, month_num + 1, 1) - timedelta(days=1)
                return {"start": start_date, "end": end_date, "period": month_name}
        
        return None
    
    def _extract_category(self, question: str) -> Optional[str]:
        """Extract category from question."""
        categories = self.db.query(Category).all()
        
        for category in categories:
            if category.name.lower() in question:
                return category.name
            
            # Check keywords too
            if category.keywords:
                keywords = [kw.strip().lower() for kw in category.keywords.split(',')]
                for keyword in keywords:
                    if keyword in question:
                        return category.name
        
        # Common aliases
        aliases = {
            "food": "Restaurants",
            "dining": "Groceries",
            "transport": "Transportation",
            "medical": "Healthcare"
        }
        
        for alias, category in aliases.items():
            if alias in question:
                return category
        
        return None
    
    def _handle_amount_query(self, category_filter: Optional[str], time_filter: Optional[Dict]) -> Dict:
        """Handle 'how much did I spend' type queries."""
        query = self.db.query(Transaction)
        
        if category_filter:
            category = self.db.query(Category).filter(Category.name == category_filter).first()
            if category:
                query = query.filter(Transaction.category_id == category.id)
        
        if time_filter:
            query = query.filter(
                Transaction.date >= time_filter["start"],
                Transaction.date <= time_filter["end"]
            )
        
        transactions = query.all()
        total = sum(t.amount for t in transactions)
        
        # Build response
        period_text = f" in {time_filter['period']}" if time_filter else ""
        category_text = f" on {category_filter}" if category_filter else ""
        
        return {
            "answer": f"You spent ${total:.2f}{category_text}{period_text}.",
            "data": {
                "total_amount": total,
                "transaction_count": len(transactions),
                "category": category_filter,
                "period": time_filter["period"] if time_filter else None
            }
        }
    
    def _handle_biggest_purchase_query(self, category_filter: Optional[str], time_filter: Optional[Dict]) -> Dict:
        """Handle 'biggest purchase' type queries."""
        query = self.db.query(Transaction)
        
        if category_filter:
            category = self.db.query(Category).filter(Category.name == category_filter).first()
            if category:
                query = query.filter(Transaction.category_id == category.id)
        
        if time_filter:
            query = query.filter(
                Transaction.date >= time_filter["start"],
                Transaction.date <= time_filter["end"]
            )
        biggest_transaction = query.order_by(Transaction.amount.asc()).first()
        
        if biggest_transaction:
            period_text = f" in {time_filter['period']}" if time_filter else ""
            category_text = f" in {category_filter}" if category_filter else ""
            
            return {
                "answer": f"Your biggest purchase{category_text}{period_text} was ${abs(biggest_transaction.amount):.2f} for '{biggest_transaction.description}' on {biggest_transaction.date.strftime('%Y-%m-%d')}.",
                "data": {
                    "amount": abs(biggest_transaction.amount),
                    "description": biggest_transaction.description,
                    "date": biggest_transaction.date.isoformat(),
                    "category": category_filter,
                    "period": time_filter["period"] if time_filter else None
                }
            }
        else:
            return {
                "answer": "No transactions found for your query.",
                "data": {
                    "amount": 0,
                    "description": "",
                    "date": None,
                    "category": category_filter,
                    "period": time_filter["period"] if time_filter else None
                }
            }
    
    def _handle_count_query(self, category_filter: Optional[str], time_filter: Optional[Dict]) -> Dict:
        """Handle count-based queries."""
        query = self.db.query(Transaction)
        
        if category_filter:
            category = self.db.query(Category).filter(Category.name == category_filter).first()
            if category:
                query = query.filter(Transaction.category_id == category.id)
        
        if time_filter:
            query = query.filter(
                Transaction.date >= time_filter["start"],
                Transaction.date <= time_filter["end"]
            )
        
        count = query.count()
        
        period_text = f" in {time_filter['period']}" if time_filter else ""
        category_text = f" {category_filter}" if category_filter else ""
        
        if count == 0:
            return {
                "answer": "No transactions found for your query.",
                "data": {
                    "count": 0,
                    "category": category_filter,
                    "period": time_filter["period"] if time_filter else None
                }
            }
        else:
            return {
                "answer": f"You had {count}{category_text} transactions{period_text}.",
                "data": {
                    "count": count,
                    "category": category_filter,
                    "period": time_filter["period"] if time_filter else None
                }
            }
    
    def _handle_general_query(self, category_filter: Optional[str], time_filter: Optional[Dict]) -> Dict:
        """Handle general queries with summary information."""
        query = self.db.query(Transaction)
        
        if time_filter:
            query = query.filter(
                Transaction.date >= time_filter["start"],
                Transaction.date <= time_filter["end"]
            )
        
        transactions = query.all()
        total = sum(t.amount for t in transactions)
        
        period_text = f" in {time_filter['period']}" if time_filter else ""
        
        if len(transactions) == 0:
            return {
                "answer": "You have no transactions.",
                "data": {
                    "total_amount": 0,
                    "transaction_count": 0,
                    "category": category_filter,
                    "period": time_filter["period"] if time_filter else None
                }
            }
        else:
            return {
                "answer": f"You had {len(transactions)} transactions totaling ${total:.2f}{period_text}.",
                "data": {
                    "total_amount": total,
                    "transaction_count": len(transactions),
                    "period": time_filter["period"] if time_filter else None
                }
            } 
