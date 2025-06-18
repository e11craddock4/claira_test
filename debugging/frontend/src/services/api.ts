import axios from 'axios';
import { Transaction, Category, DashboardSummary, CopilotResponse } from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
});

export const apiService = {
  // Transaction endpoints
    uploadCSV: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/transactions/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        });
    },

    getTransactions: async (params?: { skip?: number; limit?: number; category_id?: number }): Promise<Transaction[]> => {
        const response = await api.get('/transactions', { params });
        return response.data;
    },

    updateTransaction: async (id: number, updates: { category_id?: number }): Promise<Transaction> => {
        const response = await api.put(`/transactions/${id}`, updates);
        return response.data;
    },

    // Category endpoints
    getCategories: async (): Promise<Category[]> => {
        const response = await api.get('/categories');
        return response.data;
    },

    createCategory: async (category: { name: string; keywords?: string }): Promise<Category> => {
        const response = await api.post('/categories', category);
        return response.data;
    },

    // Dashboard endpoints
    getDashboardSummary: async (): Promise<DashboardSummary> => {
        const response = await api.get('/dashboard/summary');
        return response.data;
    },

    // Copilot endpoint
    queryCopilot: async (question: string): Promise<CopilotResponse> => {
        const response = await api.post('/copilot/query', { question });
        return response.data;
    },
    }; 
