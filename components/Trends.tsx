import React from 'react';
import { Transaction, InvestmentWithPerformance, Loan, OtherAsset } from '../types';
import { NetWorthTrendChart } from './trends/NetWorthTrendChart';
import { IncomeExpenseChart } from './trends/IncomeExpenseChart';
import { SpendingTrendsChart } from './trends/SpendingTrendsChart';

interface TrendsProps {
    transactions: Transaction[];
    investments: InvestmentWithPerformance[];
    loans: Loan[];
    otherAssets: OtherAsset[];
}

export const Trends: React.FC<TrendsProps> = ({ transactions, investments, loans, otherAssets }) => {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white">Financial Trends</h1>

            <div className="bg-gray-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4 text-white">Net Worth Growth (Last 12 Months)</h2>
                <NetWorthTrendChart 
                    investments={investments}
                    loans={loans}
                    otherAssets={otherAssets}
                />
            </div>
            
            <div className="bg-gray-800 rounded-2xl shadow-lg p-6">
                 <h2 className="text-xl font-bold mb-4 text-white">Income vs. Expense (Last 6 Months)</h2>
                <IncomeExpenseChart transactions={transactions} />
            </div>

            <div className="bg-gray-800 rounded-2xl shadow-lg p-6">
                 <h2 className="text-xl font-bold mb-4 text-white">Spending Trends by Category (Last 6 Months)</h2>
                <SpendingTrendsChart transactions={transactions} />
            </div>

        </div>
    );
};