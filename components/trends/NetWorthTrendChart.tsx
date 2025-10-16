import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { InvestmentWithPerformance, Loan, OtherAsset } from '../../types.ts';

interface NetWorthTrendChartProps {
    investments: InvestmentWithPerformance[];
    loans: Loan[];
    otherAssets: OtherAsset[];
}

const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    notation: 'compact',
    compactDisplay: 'short'
}).format(value);

const generateMockHistory = (currentNetWorth: number, months = 12) => {
    const history = [];
    let lastValue = currentNetWorth * (0.8 + Math.random() * 0.1); // Start ~80-90% of current
    const growthFactor = Math.pow(currentNetWorth / lastValue, 1 / months);

    for (let i = months - 1; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        
        // Add some random volatility
        const volatility = (Math.random() - 0.5) * 0.05; // +/- 2.5%
        const monthValue = lastValue * (growthFactor + volatility);
        
        history.push({
            name: date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
            'Net Worth': Math.round(monthValue),
        });
        lastValue = monthValue;
    }
    // Ensure the last data point is the actual current net worth
    history[history.length - 1]['Net Worth'] = Math.round(currentNetWorth);

    return history;
};


export const NetWorthTrendChart: React.FC<NetWorthTrendChartProps> = ({ investments, loans, otherAssets }) => {
    const currentNetWorth = useMemo(() => {
        const totalAssets = investments.reduce((sum, inv) => sum + inv.currentValue, 0) + otherAssets.reduce((sum, asset) => sum + asset.value, 0);
        const totalLiabilities = loans.reduce((sum, loan) => sum + loan.outstandingAmount, 0);
        return totalAssets - totalLiabilities;
    }, [investments, loans, otherAssets]);

    const chartData = useMemo(() => generateMockHistory(currentNetWorth), [currentNetWorth]);

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#9ca3af" tickFormatter={formatCurrency} tick={{ fontSize: 12 }} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#2a2a2a', border: 'none', borderRadius: '8px' }}
                        itemStyle={{ color: '#e5e7eb' }}
                        formatter={(value: number) => [new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value), 'Net Worth']}
                    />
                    <Area type="monotone" dataKey="Net Worth" stroke="#34d399" strokeWidth={2} fillOpacity={0.2} fill="#34d399" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};