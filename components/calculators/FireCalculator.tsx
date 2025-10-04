import React, { useState, useMemo } from 'react';
import { CalculatorWrapper } from './CalculatorWrapper';
import { CalculatorResultDisplay } from './CalculatorResultDisplay';

const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

export const FireCalculator: React.FC = () => {
    const [monthlyExpenses, setMonthlyExpenses] = useState(50000);
    const [currentSavings, setCurrentSavings] = useState(2500000);
    const [withdrawalRate, setWithdrawalRate] = useState(4); // 4% rule is common

    const result = useMemo(() => {
        const annualExpenses = monthlyExpenses * 12;
        const fireCorpus = annualExpenses / (withdrawalRate / 100);
        const shortfall = Math.max(0, fireCorpus - currentSavings);
        return { fireCorpus, shortfall };
    }, [monthlyExpenses, currentSavings, withdrawalRate]);

    return (
        <CalculatorWrapper title="FIRE Calculator" description="Estimate the corpus you need to achieve Financial Independence, Retire Early.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div>
                        <label className="flex justify-between text-gray-300">
                            <span>Current Monthly Expenses</span>
                            <span className="font-bold text-white">{formatCurrency(monthlyExpenses)}</span>
                        </label>
                        <input type="range" min="10000" max="500000" step="1000" value={monthlyExpenses} onChange={(e) => setMonthlyExpenses(Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg" />
                    </div>
                    <div>
                        <label className="flex justify-between text-gray-300">
                            <span>Current Savings / Corpus</span>
                            <span className="font-bold text-white">{formatCurrency(currentSavings)}</span>
                        </label>
                        <input type="range" min="0" max="100000000" step="100000" value={currentSavings} onChange={(e) => setCurrentSavings(Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg" />
                    </div>
                     <div>
                        <label className="flex justify-between text-gray-300">
                            <span>Safe Withdrawal Rate</span>
                            <span className="font-bold text-white">{withdrawalRate}%</span>
                        </label>
                        <input type="range" min="2" max="6" step="0.5" value={withdrawalRate} onChange={(e) => setWithdrawalRate(Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg" />
                    </div>
                </div>
                <CalculatorResultDisplay
                    mainLabel="Your FIRE Target Corpus"
                    mainResult={formatCurrency(result.fireCorpus)}
                    breakdown={[
                        { label: 'Current Corpus', value: formatCurrency(currentSavings), colorClass: 'text-yellow-400' },
                        { label: 'Shortfall', value: formatCurrency(result.shortfall), colorClass: 'text-red-400' },
                    ]}
                />
            </div>
        </CalculatorWrapper>
    );
};
