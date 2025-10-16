import React, { useState, useMemo } from 'react';
import { CalculatorWrapper } from './CalculatorWrapper.tsx';
import { CalculatorResultDisplay } from './CalculatorResultDisplay.tsx';

const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

export const SIPCalculator: React.FC = () => {
    const [monthlyInvestment, setMonthlyInvestment] = useState(10000);
    const [returnRate, setReturnRate] = useState(12);
    const [timePeriod, setTimePeriod] = useState(10);

    const result = useMemo(() => {
        const i = returnRate / 100 / 12; // Monthly interest rate
        const n = timePeriod * 12; // Number of months
        const M = monthlyInvestment;

        if (i === 0) {
            return { totalValue: M * n, investedAmount: M * n, estimatedGains: 0 };
        }

        const totalValue = M * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
        const investedAmount = M * n;
        const estimatedGains = totalValue - investedAmount;
        
        return { totalValue, investedAmount, estimatedGains };
    }, [monthlyInvestment, returnRate, timePeriod]);
    
    return (
        <CalculatorWrapper title="SIP Calculator" description="Estimate the future value of your monthly investments with the power of compounding.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div>
                        <label className="flex justify-between text-gray-300">
                            <span>Monthly Investment</span>
                            <span className="font-bold text-white">{formatCurrency(monthlyInvestment)}</span>
                        </label>
                        <input type="range" min="500" max="100000" step="500" value={monthlyInvestment} onChange={(e) => setMonthlyInvestment(Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg" />
                    </div>
                     <div>
                        <label className="flex justify-between text-gray-300">
                            <span>Expected Return Rate (p.a.)</span>
                            <span className="font-bold text-white">{returnRate}%</span>
                        </label>
                        <input type="range" min="1" max="30" step="0.5" value={returnRate} onChange={(e) => setReturnRate(Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg" />
                    </div>
                     <div>
                        <label className="flex justify-between text-gray-300">
                            <span>Time Period (Years)</span>
                            <span className="font-bold text-white">{timePeriod}</span>
                        </label>
                        <input type="range" min="1" max="40" step="1" value={timePeriod} onChange={(e) => setTimePeriod(Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg" />
                    </div>
                </div>
                <CalculatorResultDisplay
                    mainLabel="Estimated Future Value"
                    mainResult={formatCurrency(result.totalValue)}
                    breakdown={[
                        { label: 'Invested Amount', value: formatCurrency(result.investedAmount), colorClass: 'text-yellow-400' },
                        { label: 'Estimated Gains', value: formatCurrency(result.estimatedGains), colorClass: 'text-green-400' },
                    ]}
                />
            </div>
        </CalculatorWrapper>
    );
};