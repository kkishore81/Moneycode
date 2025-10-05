import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { InvestmentWithPerformance, Loan, OtherAsset } from '../types';

interface NetWorthProps {
    investments: InvestmentWithPerformance[];
    loans: Loan[];
    otherAssets: OtherAsset[];
}

const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
}).format(value);

const mockNetWorthHistory = [
    { name: 'Jan', value: 3500000 },
    { name: 'Feb', value: 3550000 },
    { name: 'Mar', value: 3620000 },
    { name: 'Apr', value: 3700000 },
    { name: 'May', value: 3780000 },
    { name: 'Jun', value: 3850000 },
];

export const NetWorth: React.FC<NetWorthProps> = ({ investments, loans, otherAssets }) => {
    const summary = useMemo(() => {
        const totalInvestmentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
        const totalOtherAssetValue = otherAssets.reduce((sum, asset) => sum + asset.value, 0);
        
        // Corrected Calculation: Total assets are investments + manually tracked other assets.
        // This prevents double-counting assets linked to loans.
        const totalAssets = totalInvestmentValue + totalOtherAssetValue;
        
        const totalLiabilities = loans.reduce((sum, loan) => sum + loan.outstandingAmount, 0);

        const netWorth = totalAssets - totalLiabilities;

        return { totalAssets, totalLiabilities, netWorth };
    }, [investments, loans, otherAssets]);

    // Add current net worth to history for the chart
    const chartData = [...mockNetWorthHistory, { name: 'Now', value: summary.netWorth }];

    return (
        <div className="bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="md:col-span-1 text-center md:text-left">
                    <p className="text-sm font-medium text-gray-400 mb-1">Your Net Worth</p>
                    <p className="text-4xl md:text-5xl font-bold text-white mb-4">{formatCurrency(summary.netWorth)}</p>
                    <div className="flex justify-center md:justify-start gap-6">
                        <div>
                            <p className="text-xs text-gray-400">Assets</p>
                            <p className="font-semibold text-green-400">{formatCurrency(summary.totalAssets)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Liabilities</p>
                            <p className="font-semibold text-red-400">{formatCurrency(summary.totalLiabilities)}</p>
                        </div>
                    </div>
                </div>
                <div className="md:col-span-2 h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                            <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                            <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} hide={true} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#2a2a2a', border: 'none', borderRadius: '8px' }}
                                itemStyle={{ color: '#e5e7eb' }}
                                formatter={(value: number) => [formatCurrency(value), 'Net Worth']}
                            />
                            <Line type="monotone" dataKey="value" stroke="#34d399" strokeWidth={2} dot={{ r: 4, fill: '#34d399' }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};