export interface Transaction {
    id: number;
    date: string;
    description: string;
    amount: number;
    category_id?: number;
    category_obj?: Category;
}

export interface Category {
id: number;
name: string;
keywords?: string;
}

export interface DashboardSummary {
total_expenses: number;
total_transactions: number;
expenses_by_category: ExpenseByCategory[];
monthly_expenses: MonthlyExpense[];
}

export interface ExpenseByCategory {
category: string;
total_amount: number;
transaction_count: number;
}

export interface MonthlyExpense {
year: number;
month: number;
total_amount: number;
}

export interface CopilotResponse {
answer: string;
data?: any;
} 
