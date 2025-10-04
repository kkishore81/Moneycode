import React from 'react';

interface ResultDisplayProps {
    mainResult: string;
    mainLabel: string;
    breakdown: { label: string; value: string; colorClass?: string }[];
}

export const CalculatorResultDisplay: React.FC<ResultDisplayProps> = ({ mainResult, mainLabel, breakdown }) => {
    return (
        <div className="bg-gray-900/50 rounded-lg p-6 text-center">
            <p className="text-gray-400 text-sm">{mainLabel}</p>
            <p className="text-green-400 text-4xl font-bold my-2">{mainResult}</p>
            <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-gray-700">
                {breakdown.map((item, index) => (
                    <div key={index}>
                        <p className="text-gray-400 text-xs">{item.label}</p>
                        <p className={`font-semibold text-lg ${item.colorClass || 'text-white'}`}>{item.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
