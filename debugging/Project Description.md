Project Title: “Personal Finance Copilot – Expense Insight Tool”
Project Overview
Build a web application that allows users to:

Upload a CSV of their expenses (e.g., exports from a bank)

Automatically categorize their expenses using a simple rule-based or ML-backed system

View categorized expenses in a dashboard (charts/tables)

Ask natural language questions like “How much did I spend on groceries last month?” and get answers using a simple NLP copilot

Tech Stack Requirements
Backend: Python (FastAPI or Flask preferred), SQLite/Postgres (local), Pandas

Frontend: React + TypeScript

Bonus: Add basic streaming chat UX for Q&A (OpenAI API optional — they can mock it)

Core Features
1. CSV Upload + Parsing (Backend + Frontend)
Upload transaction CSV (columns: date, description, amount, category [optional])

Parse and store in a database

Show the raw transactions in a table

2. Auto-Categorization (Backend Logic)
Assign categories based on keywords in description (e.g., "Starbucks" → Coffee)

Allow editing categories in the UI

3. Dashboard View (Frontend)
Bar/line chart: Expenses per category over time

Pie chart: Total expenses by category

Filters by date range and category

4. “Copilot” Interface
Input: User types questions like:

"How much did I spend on food last month?"

"What was my biggest purchase in May?"

Output: Plain-text answers (they can hard-code/mimic LLM behavior or use a real model)

Backend should parse the query and compute the answer from the DB

Evaluation Criteria
Technical
Code structure and cleanliness

API design and separation of concerns

React component modularity and use of TypeScript

Frontend state management

Tests (unit/integration, if time allows)

Product & UX
Intuitive UI for uploading and reviewing data

Clear and helpful categorization

Copilot query UX: how well do they interpret the “intent” of the task?

Nice-to-Haves
Authentication (mocked)

Deployment (e.g., Vercel + Render/Heroku)

Usage of an OpenAI API or LangChain

Dark mode/theme toggle

Submission Expectations
GitHub repo with a README:

Architecture overview

How to run backend/frontend

Sample CSV file

Sample questions for the copilot

Clear instructions for local setup (Docker optional)
