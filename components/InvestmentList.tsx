import React, { useState } from 'react';
import { Investment, InvestmentType } from '../types';
import { calculateIndividualGainLoss, calculateIndividualReturnPercentage } from '../utils/investmentCalculators';
import { InvestmentPerformanceChart } from './InvestmentPerformanceChart';

interface InvestmentListProps {
    investments: Investment[];
    onEdit: (investment: Investment) => void;
    onDelete: (investmentId: string) => void;
}

const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);

const ChevronUpIcon: React.FC<{ className?: string }> = ({ className }) => (
     <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
);

export const InvestmentList: React.FC<InvestmentListProps> = ({ investments, onEdit, onDelete }) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

    const toggleChart = (id: string) => {
        setExpandedId(prevId => (prevId === id ? null : id));
    };

    if (investments.length === 0) {
        return <p className="text-gray-400 text-center py-8">No investments tracked yet. Add an investment to get started.</p>;
    }

    return (
        <div className="space-y-4">
            {investments.map(inv => {
                const gainLoss = calculateIndividualGainLoss(inv);
                const returnPercentage = calculateIndividualReturnPercentage(inv);
                const isPositive = gainLoss >= 0;
                const isExpanded = expandedId === inv.id;

                return (
                    <div key={inv.id} className="p-4 bg-gray-700/50 rounded-lg transition-all duration-300">
                        <div className="flex justify-between items-start">
                             <div>
                                <p className="font-bold text-white text-lg">{inv.name}</p>
                                <p className="text-sm text-gray-400">
                                    {inv.type}
                                    {(inv.type === InvestmentType.FIXED_DEPOSIT || inv.type === InvestmentType.RECURRING_DEPOSIT) && inv.interestRate && (
                                        <span className="ml-2 font-semibold text-cyan-400">@ {inv.interestRate}%</span>
                                    )}
                                </p>
                             </div>
                             <div className="flex space-x-2">
                                <button onClick={() => onEdit(inv)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-3 rounded-lg text-sm">Edit</button>
                                <button onClick={() => onDelete(inv.id)} className="bg-red-800 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-lg text-sm">Delete</button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-center">
                            <div>
                                <p className="text-xs text-gray-400">Invested</p>
                                <p className="font-semibold text-white">{formatCurrency(inv.investedAmount)}</p>
                            </div>
                             <div>
                                <p className="text-xs text-gray-400">Current Value</p>
                                <p className="font-semibold text-white">{formatCurrency(inv.currentValue)}</p>
                            </div>
                             <div>
                                <p className="text-xs text-gray-400">Gain/Loss</p>
                                <p className={`font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(gainLoss)}</p>
                            </div>
                             <div>
                                <p className="text-xs text-gray-400">Return %</p>
                                <p className={`font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>{returnPercentage.toFixed(2)}%</p>
                            </div>
                        </div>

                        {inv.valueHistory && inv.valueHistory.length > 0 && (
                            <div className="mt-4 border-t border-gray-600 pt-4">
                                <button
                                    onClick={() => toggleChart(inv.id)}
                                    className="w-full flex justify-between items-center text-left text-gray-300 hover:text-white transition-colors"
                                >
                                    <span className="font-semibold">View Performance</span>
                                    {isExpanded ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                                </button>
                                {isExpanded && (
                                    <InvestmentPerformanceChart data={inv.valueHistory} dataKey="value" />
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};