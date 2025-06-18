import React, { useState, useEffect } from 'react';
import { Transaction, Category } from '../types';
import { apiService } from '../services/api';

interface TransactionTableProps {
  transactions: Transaction[];
  onTransactionUpdate: () => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, onTransactionUpdate }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<number | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const categoriesData = await apiService.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleCategoryChange = async (transactionId: number, categoryId: number) => {
    try {
      await apiService.updateTransaction(transactionId, { category_id: categoryId });
      setEditingTransaction(null);
      onTransactionUpdate();
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatAmount = (amount: number) => {
    return `$${Math.abs(amount).toFixed(2)}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Recent Transactions
      </h2>

      {transactions.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">
          No transactions found. Upload a CSV file to get started.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">Date</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">Description</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-700 dark:text-gray-200">Amount</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {transactions.slice(0, 50).map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                    {transaction.description}
                  </td>
                  <td className="px-4 py-2 text-sm text-right font-medium">
                    <span className={transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}>
                      {transaction.amount < 0 ? '-' : '+'}
                      {formatAmount(transaction.amount)}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {editingTransaction === transaction.id ? (
                      <select
                        value={transaction.category_id || ''}
                        onChange={(e) => handleCategoryChange(transaction.id, parseInt(e.target.value))}
                        onBlur={() => setEditingTransaction(null)}
                        className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                        autoFocus
                      >
                        <option value="">Uncategorized</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <button
                        onClick={() => setEditingTransaction(transaction.id)}
                        className="text-sm px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 border dark:border-gray-500 text-gray-700 dark:text-gray-200"
                      >
                        {transaction.category_obj?.name || 'Uncategorized'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TransactionTable;
