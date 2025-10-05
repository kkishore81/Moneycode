import React from 'react';
import { InvestmentWithPerformance } from '../types';

interface InvestmentListProps {
    investments: InvestmentWithPerformance[];
    onEdit: (investment: InvestmentWithPerformance) => void;
    onDelete: (investmentId: string) => void;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);

export const InvestmentList: React.FC<InvestmentListProps> = ({ investments, onEdit, onDelete }) => {
    return (
        <div className="bg-gray-800 rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Your Investments</h3>
            {investments.length > 0 ? (
                <div className="space-y-4">
                    {investments.map(inv => {
                        return (
                            <div key={inv.id} className="p-4 bg-gray-700/50 rounded-lg">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="font-bold text-white text-lg">{inv.name}</p>
                                        <p className="text-sm text-cyan-400 font-semibold">{inv.type}</p>
                                    </div>
                                    <div className="flex space-x-2 flex-shrink-0">
                                        <button onClick={() => onEdit(inv)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-3 rounded-lg text-sm">Edit</button>
                                        <button onClick={() => onDelete(inv.id)} className="bg-red-800 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-lg text-sm">Delete</button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-400">Total Invested</p>
                                        <p className="font-semibold text-white">{formatCurrency(inv.totalInvested)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400">Current Value</p>
                                        <p className="font-semibold text-white">{formatCurrency(inv.currentValue)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400">P&L</p>
                                        <p className={`font-semibold ${inv.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(inv.pnl)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400">XIRR (%)</p>
                                        <p className={`font-semibold ${inv.xirr >= 0 ? 'text-green-400' : 'text-red-400'}`}>{inv.xirr.toFixed(2)}%</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="text-gray-400 text-center py-8">No investments added yet.</p>
            )}
        </div>
    );
};