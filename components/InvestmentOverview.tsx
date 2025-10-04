import React from 'react';
import { InvestmentSummary } from '../types';
import { DashboardCard } from './DashboardCard';

interface InvestmentOverviewProps {
    summary: InvestmentSummary;
}

export const InvestmentOverview: React.FC<InvestmentOverviewProps> = ({ summary }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard title="Total Invested" value={summary.totalInvested} formatAsCurrency />
            <DashboardCard title="Current Value" value={summary.totalCurrentValue} formatAsCurrency />
            <DashboardCard 
                title="Overall P&L" 
                value={summary.overallGainLoss} 
                formatAsCurrency 
                isPositive={summary.overallGainLoss >= 0} 
                isNegative={summary.overallGainLoss < 0} 
            />
            <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
                <p className="text-sm font-medium text-gray-400 mb-1">Portfolio XIRR</p>
                <p className={`text-3xl font-bold ${summary.xirr >= 0 ? 'text-green-400' : 'text-red-400'}`}>{summary.xirr.toFixed(2)}%</p>
            </div>
        </div>
    );
};
