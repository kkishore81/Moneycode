import React, { useMemo, useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
// Fix: Corrected import path for types.
import { Transaction, TransactionCategory } from '../types';

interface ExpenseChartProps {
  data: Transaction[];
}

const COLORS = ['#34d399', '#fbbf24', '#60a5fa', '#f87171', '#a78bfa', '#a3e635', '#22d3ee'];

const ChartPlaceholder: React.FC = () => (
    <div className="w-full h-[300px] flex items-center justify-center text-gray-500">
        <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse [animation-delay:0.2s]"></div>
            <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse [animation-delay:0.4s]"></div>
        </div>
    </div>
);


export const ExpenseChart: React.FC<ExpenseChartProps> = ({ data }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const chartData = useMemo(() => {
    const categoryTotals = data.reduce((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
      return acc;
    }, {} as Record<TransactionCategory, number>);

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name: name as TransactionCategory, value }))
      // Fix: Explicitly cast values to numbers to satisfy TypeScript's strict arithmetic operation checks.
      .sort((a, b) => Number(b.value) - Number(a.value));
  }, [data]);

  if (!isClient) {
    return <ChartPlaceholder />;
  }

  if (chartData.length === 0) {
    return <div className="flex items-center justify-center h-full text-gray-500">No expense data to display.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Tooltip
            contentStyle={{ backgroundColor: '#2a2a2a', border: 'none', borderRadius: '8px' }}
            itemStyle={{ color: '#e5e7eb' }}
            // Fix: Made the formatter more robust by handling potential string values from the library.
            formatter={(value: number | string) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(value))}
        />
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={100}
          innerRadius={60}
          paddingAngle={5}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          stroke="none"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};