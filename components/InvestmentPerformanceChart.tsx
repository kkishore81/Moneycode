import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { InvestmentWithPerformance } from '../types';

const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

// Custom Tooltip component to display extra info like P&L and XIRR
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        // The full data object for the bar is in the payload of the first item
        const data = payload[0].payload; 
        return (
            <div className="bg-gray-700 p-3 rounded-lg shadow-lg border border-gray-600 text-sm">
                <p className="font-bold text-white mb-2">{label}</p>
                {payload.map((pld: any) => (
                     <p key={pld.dataKey} style={{ color: pld.color }}>
                        {`${pld.name}: ${formatCurrency(pld.value)}`}
                    </p>
                ))}
                {/* Adding XIRR to the tooltip */}
                <p className={`font-semibold mt-1 ${data.xirr >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {`XIRR: ${data.xirr.toFixed(2)}%`}
                </p>
            </div>
        );
    }
    return null;
};

// Fix: Define props interface for InvestmentPerformanceChart.
interface InvestmentPerformanceChartProps {
    data: InvestmentWithPerformance[];
}

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
                        content={<CustomTooltip />} 
                        cursor={{fill: 'rgba(107, 114, 128, 0.1)'}}
                    />
                    <Legend wrapperStyle={{ color: '#9ca3af' }} />
                     {/* A reference line at y=0 makes it easier to distinguish profit from loss for the P&L bar */}
                    <ReferenceLine y={0} stroke="#6b7280" />
                    <Bar dataKey="totalInvested" name="Total Invested" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="currentValue" name="Current Value" fill="#34d399" radius={[4, 4, 0, 0]} />
                    {/* Add a new bar for Profit & Loss. Negative values will render below the axis. */}
                    <Bar dataKey="pnl" name="P&L" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
