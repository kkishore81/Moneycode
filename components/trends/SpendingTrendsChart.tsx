import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Transaction, TransactionType, TransactionCategory } from '../../types.ts';

interface SpendingTrendsChartProps {
    transactions: Transaction[];
}

const COLORS = ['#34d399', '#fbbf24', '#60a5fa', '#f87171', '#a78bfa', '#a3e635', '#22d3ee'];

const processDataForChart = (transactions: Transaction[]) => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const expenseTransactions = transactions.filter(
        t => t.type === TransactionType.EXPENSE && new Date(t.date) >= sixMonthsAgo
    );

    // Find top 5 categories by total spending
    const categoryTotals = expenseTransactions.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
    }, {} as Record<string, number>);

    const topCategories = Object.entries(categoryTotals)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([category]) => category);

    // Group data by month
    const monthlyData: { [key: string]: { name: string, [key: string]: number | string } } = {};
    for (let i = 0; i <= 6; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
        monthlyData[monthKey] = { name: monthName, Other: 0 };
        topCategories.forEach(cat => { monthlyData[monthKey][cat] = 0 });
    }

    expenseTransactions.forEach(t => {
        const date = new Date(t.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (monthlyData[monthKey]) {
            if (topCategories.includes(t.category)) {
                monthlyData[monthKey][t.category] = (monthlyData[monthKey][t.category] as number) + t.amount;
            } else {
                monthlyData[monthKey]['Other'] = (monthlyData[monthKey]['Other'] as number) + t.amount;
            }
        }
    });

    return Object.values(monthlyData).sort((a, b) => {
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


export const SpendingTrendsChart: React.FC<SpendingTrendsChartProps> = ({ transactions }) => {
    const { chartData, categories } = useMemo(() => {
        const data = processDataForChart(transactions);
        const cats = data.length > 0 ? Object.keys(data[0]).filter(k => k !== 'name') : [];
        return { chartData: data, categories: cats };
    }, [transactions]);
    
     if (transactions.filter(t=> t.type === TransactionType.EXPENSE).length === 0) {
        return <div className="flex items-center justify-center h-[300px] text-gray-500">No expense data to display trends.</div>;
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
                    {categories.map((cat, index) => (
                        <Bar key={cat} dataKey={cat} stackId="a" fill={COLORS[index % COLORS.length]} radius={[4, 4, 0, 0]} />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};