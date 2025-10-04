import React from 'react';

interface CalculatorWrapperProps {
    title: string;
    description: string;
    children: React.ReactNode;
}

export const CalculatorWrapper: React.FC<CalculatorWrapperProps> = ({ title, description, children }) => {
    return (
        <div className="bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <p className="text-gray-400 mt-1 mb-6">{description}</p>
            {children}
        </div>
    );
};
