import React, { useState, useMemo } from 'react';
import { CalculatorWrapper } from './CalculatorWrapper.tsx';
import { CalculatorResultDisplay } from './CalculatorResultDisplay.tsx';

const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

export const EMICalculator: React.FC = () => {
    const [loanAmount, setLoanAmount] = useState(1000000);
    const [interestRate, setInterestRate] = useState(8.5);
    const [loanTenure, setLoanTenure] = useState(20);

    const result = useMemo(() => {
        const P = loanAmount;
        const r = interestRate / 100 / 12; // Monthly interest rate
        const n = loanTenure * 12; // Number of months

        if (r === 0) {
            return { monthlyEMI: P / n, totalInterest: 0, totalPayment: P };
        }
        
        const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        const totalPayment = emi * n;
        const totalInterest = totalPayment - P;

        return { monthlyEMI: emi, totalInterest, totalPayment };
    }, [loanAmount, interestRate, loanTenure]);

    return (
         <CalculatorWrapper title="EMI Calculator" description="Calculate your Equated Monthly Instalment (EMI) for loans.">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div>
                        <label className="flex justify-between text-gray-300">
                            <span>Loan Amount</span>
                            <span className="font-bold text-white">{formatCurrency(loanAmount)}</span>
                        </label>
                        <input type="range" min="100000" max="20000000" step="100000" value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg" />
                    </div>
                     <div>
                        <label className="flex justify-between text-gray-300">
                            <span>Interest Rate (p.a.)</span>
                            <span className="font-bold text-white">{interestRate}%</span>
                        </label>
                        <input type="range" min="1" max="20" step="0.1" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg" />
                    </div>
                     <div>
                        <label className="flex justify-between text-gray-300">
                            <span>Loan Tenure (Years)</span>
                            <span className="font-bold text-white">{loanTenure}</span>
                        </label>
                        <input type="range" min="1" max="30" step="1" value={loanTenure} onChange={(e) => setLoanTenure(Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg" />
                    </div>
                </div>
                <CalculatorResultDisplay
                    mainLabel="Monthly EMI"
                    mainResult={formatCurrency(result.monthlyEMI)}
                    breakdown={[
                        { label: 'Total Interest', value: formatCurrency(result.totalInterest), colorClass: 'text-red-400' },
                        { label: 'Total Payment', value: formatCurrency(result.totalPayment), colorClass: 'text-white' },
                    ]}
                />
            </div>
        </CalculatorWrapper>
    );
};