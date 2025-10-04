import React, { useState } from 'react';
import { SIPCalculator } from './calculators/SIPCalculator';
import { LumpSumCalculator } from './calculators/LumpSumCalculator';
import { EMICalculator } from './calculators/EMICalculator';
import { InflationCalculator } from './calculators/InflationCalculator';
import { FireCalculator } from './calculators/FireCalculator';
import { SWPCalculator } from './calculators/SWPCalculator';
import { CalculatorIcon, EMIIcon, FireIcon, InflationIcon, LumpSumIcon, SIPIcon, SWPIcon } from './calculators/icons';

type CalculatorType = 'sip' | 'lumpsum' | 'emi' | 'inflation' | 'fire' | 'swp';

const calculatorOptions: { id: CalculatorType; name: string; icon: React.ReactNode }[] = [
    { id: 'sip', name: 'SIP Calculator', icon: <SIPIcon /> },
    { id: 'lumpsum', name: 'Lump Sum Calculator', icon: <LumpSumIcon /> },
    { id: 'emi', name: 'EMI Calculator', icon: <EMIIcon /> },
    { id: 'inflation', name: 'Inflation Calculator', icon: <InflationIcon /> },
    { id: 'fire', name: 'FIRE Calculator', icon: <FireIcon /> },
    { id: 'swp', name: 'SWP Calculator', icon: <SWPIcon /> },
];

const renderCalculator = (type: CalculatorType) => {
    switch (type) {
        case 'sip': return <SIPCalculator />;
        case 'lumpsum': return <LumpSumCalculator />;
        case 'emi': return <EMICalculator />;
        case 'inflation': return <InflationCalculator />;
        case 'fire': return <FireCalculator />;
        case 'swp': return <SWPCalculator />;
        default: return <SIPCalculator />;
    }
}

export const Calculators: React.FC = () => {
    const [activeCalculator, setActiveCalculator] = useState<CalculatorType>('sip');

    return (
        <div className="flex flex-col md:flex-row gap-8">
            <aside className="w-full md:w-1/4">
                <div className="bg-gray-800 rounded-2xl p-4">
                     <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <CalculatorIcon />
                        Calculators
                    </h2>
                    <nav className="space-y-2">
                        {calculatorOptions.map(option => (
                             <button
                                key={option.id}
                                onClick={() => setActiveCalculator(option.id)}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors text-sm font-semibold ${
                                    activeCalculator === option.id 
                                    ? 'bg-green-600 text-white' 
                                    : 'text-gray-300 hover:bg-gray-700'
                                }`}
                            >
                                {option.icon}
                                {option.name}
                            </button>
                        ))}
                    </nav>
                </div>
            </aside>
            <main className="flex-1">
                {renderCalculator(activeCalculator)}
            </main>
        </div>
    );
};
