# Personal Finance Copilot 💰🤖

A full-stack web application that helps users analyze their personal expenses through CSV uploads, automatic categorization, interactive dashboards, and natural language queries powered by an AI copilot.

## 🚀 Features

### ✅ Core Features Implemented
- **CSV Upload & Parsing**: Upload bank transaction CSVs with automatic data validation
- **Auto-Categorization**: Rule-based expense categorization using keyword matching
- **Interactive Dashboard**: Beautiful charts and visualizations using Recharts
- **Transaction Management**: View and edit transaction categories in real-time
- **AI Copilot**: Natural language query interface for expense insights
- **Responsive Design**: Modern UI built with Tailwind CSS

### 🔧 Architecture

**Backend (Python + FastAPI)**
- FastAPI with SQLAlchemy ORM
- SQLite database for local storage
- Pandas for CSV processing
- Rule-based categorization engine
- Natural language query processing
- RESTful API design

**Frontend (React + TypeScript)**
- React 18 with TypeScript
- Tailwind CSS for styling
- Recharts for data visualization
- Axios for API communication
- Component-based architecture

## 📋 Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

# WRONG COMMAND
1. Navigate to the backend directory:
```bash
cd python/interview_test/backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Start the FastAPI server:
```bash
python main.py
```

The backend will be available at `http://localhost:8000`
- API docs: `http://localhost:8000/docs`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd python/interview_test/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## 🎯 Usage

### 1. Upload Transactions
- Click the "📁 Upload" tab
- Select a CSV file with the format: `date,description,amount`
- Upload and watch transactions get automatically categorized

### 2. View Dashboard
- Navigate to "📊 Dashboard" to see:
  - Total expenses and transaction counts
  - Pie chart of expenses by category
  - Monthly spending trends
  - Category breakdown table

### 3. Manage Transactions
- Go to "💳 Transactions" to:
  - View all uploaded transactions
  - Click on categories to edit them
  - See real-time categorization

### 4. Query Your Data
- Use the "🤖 Copilot" to ask questions like:
  - "How much did I spend on groceries last month?"
  - "What was my biggest purchase in November?"
  - "How many restaurant transactions did I have?"

## 📁 Project Structure

```
python/interview_test/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── models.py            # Database models
│   ├── schemas.py           # Pydantic schemas
│   ├── services.py          # Business logic
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API services
│   │   ├── types/          # TypeScript types
│   │   ├── App.tsx         # Main app component
│   │   └── index.tsx       # Entry point
│   ├── package.json        # Node.js dependencies
│   └── tailwind.config.js  # Tailwind configuration
├── sample_transactions.csv  # Sample data for testing
└── README.md               # This file
```

## 🧪 Sample Data

Use the included `sample_transactions.csv` file to test the application. It contains realistic transaction data with various categories like groceries, restaurants, gas, utilities, etc.

## 🤖 Copilot Capabilities

The AI copilot can understand and respond to various types of queries:

- **Amount queries**: "How much did I spend on..."
- **Time-based queries**: "last month", "this month", "May", etc.
- **Category queries**: Recognizes category names and keywords
- **Comparison queries**: "biggest purchase", "highest expense"
- **Count queries**: "How many transactions..."

## 🔮 Sample Questions

Try asking the copilot:
- "How much did I spend on groceries last month?"
- "What was my biggest purchase in December?"
- "How much did I spend on restaurants this month?"
- "How many transactions did I have in November?"
- "What's my total spending on entertainment?"

## 🛠 Technical Highlights

### Backend Features
- **Automatic categorization** using keyword matching
- **Natural language processing** for query understanding
- **Time period extraction** from user queries
- **Database relationships** with proper foreign keys
- **Error handling** and validation
- **CORS configuration** for frontend integration

### Frontend Features
- **TypeScript** for type safety
- **Modern React patterns** with hooks
- **Responsive design** with Tailwind CSS
- **Interactive charts** with Recharts
- **Real-time updates** after data changes
- **Loading states** and error handling

## 🚢 Production Considerations

For production deployment:

1. **Database**: Replace SQLite with PostgreSQL
2. **Authentication**: Add user authentication and authorization
3. **File Storage**: Use cloud storage for CSV files
4. **API Keys**: Integrate with real LLM APIs (OpenAI, etc.)
5. **Caching**: Add Redis for better performance
6. **Monitoring**: Add logging and error tracking
7. **Testing**: Add comprehensive unit and integration tests

## 🎨 Design Decisions

- **Rule-based categorization**: Simple but effective keyword matching
- **SQLite**: Easy setup for local development
- **Tailwind CSS**: Rapid UI development with consistent design
- **Component separation**: Clean architecture with reusable components
- **Type safety**: Full TypeScript coverage for better DX

This implementation demonstrates a complete full-stack application with modern web development practices, clean code architecture, and a user-friendly interface. 
