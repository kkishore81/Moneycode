import React from 'react';
import { Loan } from '../types';

interface LoanListProps {
    loans: Loan[];
    onEdit: (loan: Loan) => void;
    onDelete: (loanId: string) => void;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);

export const LoanList: React.FC<LoanListProps> = ({ loans, onEdit, onDelete }) => {
    return (
        <div className="bg-gray-800 rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Your Loans</h3>
            {loans.length > 0 ? (
                <div className="space-y-4">
                    {loans.map(loan => {
                        const hasAsset = loan.assetCurrentValue && loan.assetCurrentValue > 0;
                        const netEquity = hasAsset ? loan.assetCurrentValue! - loan.outstandingAmount : 0;

                        return (
                            <div key={loan.id} className="p-4 bg-gray-700/50 rounded-lg">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="font-bold text-white text-lg">{loan.name}</p>
                                        <p className="text-sm text-cyan-400 font-semibold">{loan.type}</p>
                                    </div>
                                    <div className="flex space-x-2 flex-shrink-0">
                                        <button onClick={() => onEdit(loan)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-3 rounded-lg text-sm">Edit</button>
                                        <button onClick={() => onDelete(loan.id)} className="bg-red-800 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-lg text-sm">Delete</button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-400">Principal</p>
                                        <p className="font-semibold text-white">{formatCurrency(loan.principal)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400">Outstanding</p>
                                        <p className="font-semibold text-white">{formatCurrency(loan.outstandingAmount)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400">Monthly EMI</p>
                                        <p className="font-semibold text-white">{formatCurrency(loan.emi)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400">Interest Rate</p>
                                        <p className="font-semibold text-white">{loan.interestRate}%</p>
                                    </div>
                                </div>
                                {hasAsset && (
                                    <div className="mt-4 pt-4 border-t border-gray-600 grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-400">Asset Value</p>
                                            <p className="font-semibold text-white">{formatCurrency(loan.assetCurrentValue!)}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400">Net Equity (Asset - Loan)</p>
                                            <p className={`font-semibold ${netEquity >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(netEquity)}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            ) : (
                <p className="text-gray-400 text-center py-8">No loans added yet.</p>
            )}
        </div>
    );
};