import React from 'react';
import { Investment } from '../types';
import { DashboardCard } from './DashboardCard';
import { InvestmentPerformanceChart } from './InvestmentPerformanceChart';
import { 
    calculateTotalCurrentValue, 
    calculateOverallGainLoss, 
    calculateOverallReturnPercentage,
    calculatePortfolioHistory
} from '../utils/investmentCalculators';

interface InvestmentOverviewProps {
    investments: Investment[];
}

export const InvestmentOverview: React.FC<InvestmentOverviewProps> = ({ investments }) => {
    const totalValue = calculateTotalCurrentValue(investments);
    const totalGainLoss = calculateOverallGainLoss(investments);
    const overallReturn = calculateOverallReturnPercentage(investments);
    const portfolioHistory = calculatePortfolioHistory(investments);

    return (
        <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <DashboardCard 
                    title="Total Investment Value" 
                    value={totalValue} 
                    formatAsCurrency 
                />
                <DashboardCard 
                    title="Overall Gain/Loss" 
                    value={totalGainLoss} 
                    formatAsCurrency 
                    isPositive={totalGainLoss >= 0}
                    isNegative={totalGainLoss < 0}
                />
                 <div className="bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-green-500/10 transition-shadow duration-300">
                    <p className="text-sm font-medium text-gray-400 mb-1">Overall Return</p>
                    <p className={`text-3xl font-bold ${overallReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {overallReturn.toFixed(2)}%
                    </p>
                </div>
            </div>

            <div className="mt-8 bg-gray-700/50 p-4 rounded-lg">
                 <h3 className="text-xl font-bold text-white mb-2">Overall Portfolio Performance</h3>
                 <InvestmentPerformanceChart data={portfolioHistory} dataKey="value" />
            </div>
        </div>
    );
};