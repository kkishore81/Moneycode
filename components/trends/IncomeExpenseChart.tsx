import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Transaction, TransactionType } from '../../types.ts';

interface IncomeExpenseChartProps {
    transactions: Transaction[];
}

const processDataForChart = (transactions: Transaction[]) => {
    const data: { [key: string]: { name: string, income: number, expense: number } } = {};
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Initialize last 6 months
    for (let i = 0; i <= 6; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
        if (!data[monthKey]) {
            data[monthKey] = { name: monthName, income: 0, expense: 0 };
        }
    }

    transactions.forEach(t => {
        const transactionDate = new Date(t.date);
        if (transactionDate >= sixMonthsAgo) {
            const monthKey = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
            
            if (data[monthKey]) {
                 if (t.type === TransactionType.INCOME) {
                    data[monthKey].income += t.amount;
                } else {
                    data[monthKey].expense += t.amount;
                }
            }
        }
    });

    return Object.values(data).sort((a, b) => {
        const dateA = new Date(`01 ${a.name.replace(' ', ' 20')}`);
        const dateB = new Date(`01 ${b.name.replace(' ', ' 20')}`);
        return dateA.getTime() - dateB.getTime();
    });
};

const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    notation: 'compact',
    compactDisplay: 'short'
}).format(value);

export const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = ({ transactions }) => {
    const chartData = useMemo(() => processDataForChart(transactions), [transactions]);

    if (transactions.length === 0) {
        return <div className="flex items-center justify-center h-[300px] text-gray-500">Add transactions to see your trends.</div>;
    }

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3a" />
                    <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#9ca3af" tickFormatter={formatCurrency} tick={{ fontSize: 12 }} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#2a2a2a', border: 'none', borderRadius: '8px' }}
                        itemStyle={{ color: '#e5e7eb' }}
                        formatter={(value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value)}
                    />
                    <Legend wrapperStyle={{ color: '#9ca3af' }}/>
                    <Bar dataKey="income" name="Income" fill="#34d399" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" name="Expense" fill="#f87171" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};