import React from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { DashboardSummary } from '../types';

interface DashboardProps {
  summary: DashboardSummary | null;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

const Dashboard: React.FC<DashboardProps> = ({ summary }) => {
  if (!summary) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Dashboard</h2>
        <p className="text-gray-500 dark:text-gray-400">No data available. Upload transactions to see your dashboard.</p>
      </div>
    );
  }

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const monthlyData = summary.monthly_expenses.map(expense => ({
    month: `${monthNames[expense.month - 1]} ${expense.year}`,
    amount: expense.total_amount
  }));

  const categoryData = summary.expenses_by_category
    .filter(cat => cat.total_amount > 0)
    .map(cat => ({
      name: cat.category,
      value: cat.total_amount,
      count: cat.transaction_count
    }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Total Expenses</h3>
          <p className="text-3xl font-bold text-red-600">${summary.total_expenses.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Total Transactions</h3>
          <p className="text-3xl font-bold text-blue-600">{summary.total_transactions}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Expenses by Category</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', color: 'white' }} // dark:gray-800
                  formatter={(value: number) => `$${value.toFixed(2)}`}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-20">No category data available</p>
          )}
        </div>

        {/* Bar Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Monthly Expenses</h3>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" stroke="#cbd5e1" />
                <YAxis stroke="#cbd5e1" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', color: 'white' }}
                  formatter={(value: any) => `$${Number(value).toFixed(2)}`}
                />
                <Legend />
                <Bar dataKey="amount" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-20">No monthly data available</p>
          )}
        </div>
      </div>

      {/* Category Table */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Category Breakdown</h3>
        {categoryData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Category</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-700 dark:text-gray-300">Amount</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-700 dark:text-gray-300">Transactions</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-700 dark:text-gray-300">Avg per Transaction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {categoryData.map((category, index) => (
                  <tr key={category.name} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-3"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        {category.name}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-sm text-right font-medium text-red-600 dark:text-red-400">
                      ${category.value.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-sm text-right text-gray-700 dark:text-gray-300">
                      {category.count}
                    </td>
                    <td className="px-4 py-2 text-sm text-right text-gray-700 dark:text-gray-300">
                      ${(category.value / category.count).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No category data available</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
