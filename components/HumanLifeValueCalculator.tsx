import React, { useState, useMemo } from 'react';

const InfoIcon: React.FC<{ className?: string }> = ({ className }) => (
     <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const CalculatorInput: React.FC<{ label: string; name: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ label, name, value, onChange }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <input
            type="number"
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
            placeholder="₹"
        />
    </div>
);


export const HumanLifeValueCalculator: React.FC = () => {
    const [inputs, setInputs] = useState({
        annualIncome: 500000,
        currentAge: 30,
        retirementAge: 60,
        outstandingLoans: 1000000,
        existingSavings: 500000,
        existingCover: 2500000,
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setInputs(prev => ({ ...prev, [name]: Number(value) || 0 }));
    };

    const hlvResult = useMemo(() => {
        const yearsToRetirement = Math.max(0, inputs.retirementAge - inputs.currentAge);
        const futureEarnings = inputs.annualIncome * yearsToRetirement;
        
        const totalNeeds = futureEarnings + inputs.outstandingLoans;
        const assetsAvailable = inputs.existingSavings + inputs.existingCover;
        
        const insuranceGap = totalNeeds - assetsAvailable;
        return { insuranceGap, totalNeeds, assetsAvailable };
    }, [inputs]);

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);

    return (
        <div className="bg-gray-800 rounded-2xl shadow-lg p-6 h-full">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">Human Life Value Calculator</h3>
            <div className="grid grid-cols-2 gap-4">
                <CalculatorInput label="Current Annual Income" name="annualIncome" value={inputs.annualIncome} onChange={handleInputChange} />
                <CalculatorInput label="Existing Life Cover" name="existingCover" value={inputs.existingCover} onChange={handleInputChange} />
                <CalculatorInput label="Current Age" name="currentAge" value={inputs.currentAge} onChange={handleInputChange} />
                 <CalculatorInput label="Retirement Age" name="retirementAge" value={inputs.retirementAge} onChange={handleInputChange} />
                <CalculatorInput label="Outstanding Loans" name="outstandingLoans" value={inputs.outstandingLoans} onChange={handleInputChange} />
                <CalculatorInput label="Existing Savings" name="existingSavings" value={inputs.existingSavings} onChange={handleInputChange} />
            </div>

            <div className="mt-6 p-4 bg-gray-900/50 rounded-lg text-center">
                <p className="text-sm text-gray-400">Your Estimated Insurance Gap (HLV)</p>
                <p className={`text-3xl font-bold ${hlvResult.insuranceGap > 0 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {formatCurrency(hlvResult.insuranceGap)}
                </p>
                <p className="text-xs text-gray-500 mt-1">This is the additional cover you may need.</p>
            </div>
        </div>
    );
};