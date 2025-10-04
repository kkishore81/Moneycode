import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Transaction, TransactionType } from '../types';

interface CashFlowChartProps {
    transactions: Transaction[];
}

const processDataForChart = (transactions: Transaction[]) => {
    const monthlyData: { [key: string]: { name: string, income: number, expense: number } } = {};

    transactions.forEach(t => {
        const date = new Date(t.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });

        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { name: monthName, income: 0, expense: 0 };
        }

        if (t.type === TransactionType.INCOME) {
            monthlyData[monthKey].income += t.amount;
        } else {
            monthlyData[monthKey].expense += t.amount;
        }
    });

    return Object.values(monthlyData).sort((a, b) => {
        const [aMon, aYear] = a.name.split(' ');
        const [bMon, bYear] = b.name.split(' ');
        if (aYear !== bYear) return `20${aYear}`.localeCompare(`20${bYear}`);
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return months.indexOf(aMon) - months.indexOf(bMon);
    });
};

export const CashFlowChart: React.FC<CashFlowChartProps> = ({ transactions }) => {
    const chartData = useMemo(() => processDataForChart(transactions), [transactions]);

    if (chartData.length === 0) {
        return <div className="flex items-center justify-center h-[300px] text-gray-500">Add transactions to see your cash flow.</div>;
    }

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3a" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" tickFormatter={(value) => `₹${Number(value) / 1000}k`} />
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