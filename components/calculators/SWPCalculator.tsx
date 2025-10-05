import React, { useState, useMemo } from 'react';
import { CalculatorWrapper } from './CalculatorWrapper';
import { CalculatorResultDisplay } from './CalculatorResultDisplay';

const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

export const SWPCalculator: React.FC = () => {
    const [totalInvestment, setTotalInvestment] = useState(10000000);
    const [monthlyWithdrawal, setMonthlyWithdrawal] = useState(50000);
    const [returnRate, setReturnRate] = useState(8);

    const result = useMemo(() => {
        let balance = totalInvestment;
        const monthlyReturn = returnRate / 100 / 12;
        let months = 0;
        
        // Cap at 50 years (600 months) to prevent infinite loops if returns exceed withdrawals
        while (balance > 0 && months < 600) {
            balance += balance * monthlyReturn;
            balance -= monthlyWithdrawal;
            months++;
        }

        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;

        const totalWithdrawn = monthlyWithdrawal * months;

        if (months >= 600) {
            return { duration: '50+ years', totalWithdrawn: 'Effectively forever' };
        }

        return {
            duration: `${years} years and ${remainingMonths} months`,
            totalWithdrawn: formatCurrency(totalWithdrawn)
        };
    }, [totalInvestment, monthlyWithdrawal, returnRate]);

    return (
        <CalculatorWrapper title="SWP Calculator" description="Plan your retirement income with a Systematic Withdrawal Plan.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div>
                        <label className="flex justify-between text-gray-300">
                            <span>Total Investment</span>
                            <span className="font-bold text-white">{formatCurrency(totalInvestment)}</span>
                        </label>
                        <input type="range" min="100000" max="100000000" step="100000" value={totalInvestment} onChange={(e) => setTotalInvestment(Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg" />
                    </div>
                     <div>
                        <label className="flex justify-between text-gray-300">
                            <span>Monthly Withdrawal</span>
                            <span className="font-bold text-white">{formatCurrency(monthlyWithdrawal)}</span>
                        </label>
                        <input type="range" min="5000" max="500000" step="1000" value={monthlyWithdrawal} onChange={(e) => setMonthlyWithdrawal(Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg" />
                    </div>
                     <div>
                        <label className="flex justify-between text-gray-300">
                            <span>Expected Annual Return</span>
                            <span className="font-bold text-white">{returnRate}%</span>
                        </label>
                        <input type="range" min="1" max="20" step="0.5" value={returnRate} onChange={(e) => setReturnRate(Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg" />
                    </div>
                </div>
                <CalculatorResultDisplay
                    mainLabel="Your money will last for"
                    mainResult={result.duration}
                    breakdown={[
                        { label: 'Invested Amount', value: formatCurrency(totalInvestment), colorClass: 'text-yellow-400' },
                        { label: 'Total Withdrawn', value: result.totalWithdrawn, colorClass: 'text-green-400' },
                    ]}
                />
            </div>
        </CalculatorWrapper>
    );
};