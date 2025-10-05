
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { InvestmentWithPerformance } from '../types';

interface InvestmentPerformanceChartProps {
    data: InvestmentWithPerformance[];
}

const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);


export const InvestmentPerformanceChart: React.FC<InvestmentPerformanceChartProps> = ({ data }) => {
    if (!data || data.length === 0) {
        return <div className="text-center text-gray-500 py-8">Add investments to see their performance.</div>;
    }

    return (
        <div style={{ width: '100%', height: 300 }} className="mt-4">
            <ResponsiveContainer>
                <BarChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3a" />
                    <XAxis 
                        dataKey="name" 
                        stroke="#9ca3af" 
                        tick={{ fontSize: 12 }}
                        interval={0}
                        angle={-20}
                        textAnchor="end"
                    />
                    <YAxis 
                        stroke="#9ca3af" 
                        tickFormatter={(value) => `₹${Number(value) / 1000}k`}
                        width={80}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#2a2a2a', border: 'none', borderRadius: '8px' }}
                        itemStyle={{ color: '#e5e7eb' }}
                        formatter={(value: number) => formatCurrency(value)}
                        labelFormatter={(label: string) => label}
                    />
                    <Legend wrapperStyle={{ color: '#9ca3af' }} />
                    <Bar dataKey="totalInvested" name="Total Invested" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="currentValue" name="Current Value" fill="#34d399" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};