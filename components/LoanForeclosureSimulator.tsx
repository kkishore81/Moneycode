import React, { useState, useMemo } from 'react';
import { calculateEMI, calculateAmortization } from '../utils/loanCalculators';

const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

const SimulatorInput: React.FC<{ label: string; name: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ label, name, value, onChange }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <input
            type="number"
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
            placeholder="0"
        />
    </div>
);

export const LoanForeclosureSimulator: React.FC = () => {
    const [inputs, setInputs] = useState({
        outstandingPrincipal: 1000000,
        interestRate: 8.5,
        remainingTenure: 15, // in years
        prepaymentAmount: 200000,
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setInputs(prev => ({ ...prev, [name]: Number(value) || 0 }));
    };

    const result = useMemo(() => {
        const { outstandingPrincipal, interestRate, remainingTenure, prepaymentAmount } = inputs;

        if (outstandingPrincipal <= 0 || interestRate <= 0 || remainingTenure <= 0) {
            return { interestSaved: 0, tenureReduced: "0 months", oldEMI: 0, newEMI: 0 };
        }

        const originalEMI = calculateEMI(outstandingPrincipal, interestRate, remainingTenure);
        const originalAmortization = calculateAmortization(outstandingPrincipal, interestRate, remainingTenure);
        const originalTotalInterest = originalAmortization.reduce((sum, item) => sum + item.interest, 0);

        const newPrincipal = outstandingPrincipal - prepaymentAmount;
        if (newPrincipal <= 0) {
            return { interestSaved: originalTotalInterest, tenureReduced: "Loan Closed", oldEMI: originalEMI, newEMI: 0 };
        }

        // Option 1: Reduce EMI, keep tenure same
        const newEMI = calculateEMI(newPrincipal, interestRate, remainingTenure);
        
        // Option 2: Reduce Tenure, keep EMI same (more complex, but common)
        // For simplicity, this calculator focuses on the interest saved by prepaying now.
        const newAmortization = calculateAmortization(newPrincipal, interestRate, remainingTenure);
        const newTotalInterest = newAmortization.reduce((sum, item) => sum + item.interest, 0);
        
        const interestSaved = originalTotalInterest - newTotalInterest;
        
        // Simplified tenure reduction calculation
        let tempBalance = newPrincipal;
        let monthsReduced = 0;
        const monthlyRate = interestRate / 12 / 100;
        while(tempBalance > 0){
             const interest = tempBalance * monthlyRate;
             const principalPaid = originalEMI - interest;
             if (principalPaid <= 0) { // If EMI doesn't cover interest
                monthsReduced = -1; // Indicates an issue
                break;
            }
             tempBalance -= principalPaid;
             monthsReduced++;
        }
        
        const originalMonths = remainingTenure * 12;
        const tenureReductionInMonths = monthsReduced >= 0 ? originalMonths - monthsReduced : 0;
        const yearsReduced = Math.floor(tenureReductionInMonths / 12);
        const monthsPart = tenureReductionInMonths % 12;
        const tenureReduced = `${yearsReduced} years, ${monthsPart} months`;


        return { interestSaved, tenureReduced, oldEMI: originalEMI, newEMI };
    }, [inputs]);

    return (
        <div className="bg-gray-800 rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Loan Prepayment Simulator</h3>
            <div className="grid grid-cols-2 gap-4">
                <SimulatorInput label="Outstanding Principal (₹)" name="outstandingPrincipal" value={inputs.outstandingPrincipal} onChange={handleInputChange} />
                <SimulatorInput label="Annual Interest Rate (%)" name="interestRate" value={inputs.interestRate} onChange={handleInputChange} />
                <SimulatorInput label="Remaining Tenure (Years)" name="remainingTenure" value={inputs.remainingTenure} onChange={handleInputChange} />
                <SimulatorInput label="Prepayment Amount (₹)" name="prepaymentAmount" value={inputs.prepaymentAmount} onChange={handleInputChange} />
            </div>
            <div className="mt-6 p-4 bg-gray-900/50 rounded-lg text-center">
                <p className="text-sm text-gray-400">Estimated Interest Saved</p>
                <p className="text-3xl font-bold text-green-400">{formatCurrency(result.interestSaved)}</p>
                <p className="text-sm text-gray-400 mt-4">Estimated Tenure Reduction</p>
                <p className="text-xl font-bold text-yellow-400">{result.tenureReduced}</p>
            </div>
        </div>
    );
};
