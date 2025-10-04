import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartData {
    date: string;
    [key: string]: any;
}

interface InvestmentPerformanceChartProps {
    data: ChartData[];
    dataKey?: string;
}

const formatXAxis = (tickItem: string) => {
    return new Date(tickItem).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
};

const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);


export const InvestmentPerformanceChart: React.FC<InvestmentPerformanceChartProps> = ({ data, dataKey = "value" }) => {
    if (!data || data.length === 0) {
        return <div className="text-center text-gray-500 py-8">No historical data available for this chart.</div>;
    }
    
    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
        <div style={{ width: '100%', height: 300 }} className="mt-4">
            <ResponsiveContainer>
                <LineChart
                    data={sortedData}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3a" />
                    <XAxis 
                        dataKey="date" 
                        stroke="#9ca3af" 
                        tickFormatter={formatXAxis} 
                    />
                    <YAxis 
                        stroke="#9ca3af" 
                        tickFormatter={(value) => `₹${Number(value) / 1000}k`}
                        domain={['auto', 'auto']}
                        width={80}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#2a2a2a', border: 'none', borderRadius: '8px' }}
                        itemStyle={{ color: '#e5e7eb' }}
                        formatter={(value: number) => formatCurrency(value)}
                        labelFormatter={(label: string) => new Date(label).toLocaleDateString('en-IN')}
                    />
                    <Legend wrapperStyle={{ color: '#9ca3af' }} />
                    <Line type="monotone" dataKey={dataKey} name="Value" stroke="#34d399" activeDot={{ r: 8 }} strokeWidth={2} dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};