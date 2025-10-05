import React, { useState, useMemo } from 'react';
import { CalculatorWrapper } from './CalculatorWrapper';
import { CalculatorResultDisplay } from './CalculatorResultDisplay';

const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

export const LumpSumCalculator: React.FC = () => {
    const [totalInvestment, setTotalInvestment] = useState(100000);
    const [returnRate, setReturnRate] = useState(12);
    const [timePeriod, setTimePeriod] = useState(10);

    const result = useMemo(() => {
        const P = totalInvestment;
        const r = returnRate / 100;
        const n = 1; // Compounded annually
        const t = timePeriod;
        
        const totalValue = P * Math.pow(1 + r / n, n * t);
        const investedAmount = P;
        const totalGains = totalValue - investedAmount;

        return { totalValue, investedAmount, totalGains };
    }, [totalInvestment, returnRate, timePeriod]);

    return (
        <CalculatorWrapper title="Lump Sum Calculator" description="Calculate the future value of a one-time investment.">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div>
                        <label className="flex justify-between text-gray-300">
                            <span>Total Investment</span>
                            <span className="font-bold text-white">{formatCurrency(totalInvestment)}</span>
                        </label>
                        <input type="range" min="10000" max="10000000" step="10000" value={totalInvestment} onChange={(e) => setTotalInvestment(Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg" />
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
                        { label: 'Total Gains', value: formatCurrency(result.totalGains), colorClass: 'text-green-400' },
                    ]}
                />
            </div>
        </CalculatorWrapper>
    );
};