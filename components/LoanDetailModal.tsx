import React, { useMemo, useState, useEffect } from 'react';
import { Loan } from '../types';
import { Modal } from './Modal';
import { calculateAmortization } from '../utils/loanCalculators';

interface LoanDetailModalProps {
    loan: Loan | null;
    onClose: () => void;
    onMarkAsPaid: (loanId: string) => void;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

export const LoanDetailModal: React.FC<LoanDetailModalProps> = ({ loan, onClose, onMarkAsPaid }) => {
    const [isConfirming, setIsConfirming] = useState(false);
    const [showAmortization, setShowAmortization] = useState(false);

    useEffect(() => {
        // Reset state when modal is opened or closed
        if (!loan) {
            setIsConfirming(false);
            setShowAmortization(false);
        }
    }, [loan]);

    const amortizationSchedule = useMemo(() => {
        if (!loan) return [];
        return calculateAmortization(loan.principal, loan.interestRate, loan.tenure);
    }, [loan]);

    if (!loan) return null;
    
    const handleConfirmPaid = () => {
        onMarkAsPaid(loan.id);
        setIsConfirming(false);
    };

    return (
        <Modal isOpen={!!loan} onClose={onClose}>
            <div className="w-[80vw] max-w-4xl">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-white">{loan.name}</h3>
                        <p className="text-md text-cyan-400 font-semibold">{loan.type}</p>
                    </div>
                    {!isConfirming && (
                        <button 
                            onClick={() => setIsConfirming(true)}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                        >
                            Mark as Paid Off
                        </button>
                    )}
                    {isConfirming && (
                         <div className="bg-gray-700 p-3 rounded-lg flex items-center gap-4">
                            <p className="text-sm font-semibold">Are you sure?</p>
                            <button onClick={handleConfirmPaid} className="bg-green-600 text-white px-3 py-1 rounded">Yes</button>
                            <button onClick={() => setIsConfirming(false)} className="bg-gray-600 text-white px-3 py-1 rounded">No</button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm p-4 bg-gray-700/50 rounded-lg">
                     <div>
                        <p className="text-gray-400">Principal Amount</p>
                        <p className="font-semibold text-white text-lg">{formatCurrency(loan.principal)}</p>
                    </div>
                    <div>
                        <p className="text-gray-400">Outstanding</p>
                        <p className="font-semibold text-white text-lg">{formatCurrency(loan.outstandingAmount)}</p>
                    </div>
                    <div>
                        <p className="text-gray-400">Monthly EMI</p>
                        <p className="font-semibold text-white text-lg">{formatCurrency(loan.emi)}</p>
                    </div>
                    <div>
                        <p className="text-gray-400">Interest Rate</p>
                        <p className="font-semibold text-white text-lg">{loan.interestRate}% p.a.</p>
                    </div>
                     <div>
                        <p className="text-gray-400">Tenure</p>
                        <p className="font-semibold text-white text-lg">{loan.tenure} Years</p>
                    </div>
                     <div>
                        <p className="text-gray-400">Start Date</p>
                        <p className="font-semibold text-white text-lg">{formatDate(loan.startDate)}</p>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <button 
                        onClick={() => setShowAmortization(!showAmortization)}
                        className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                        {showAmortization ? 'Hide' : 'View'} Amortization Schedule
                    </button>
                </div>

                {showAmortization && (
                    <div className="mt-6">
                        <h4 className="text-lg font-bold text-white mb-2">Amortization Schedule</h4>
                        <div className="max-h-80 overflow-y-auto bg-gray-900/50 rounded-lg">
                            <table className="w-full text-sm text-left text-gray-300">
                                <thead className="text-xs text-gray-400 uppercase bg-gray-700 sticky top-0">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Month</th>
                                        <th scope="col" className="px-6 py-3">Principal</th>
                                        <th scope="col" className="px-6 py-3">Interest</th>
                                        <th scope="col" className="px-6 py-3">Balance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {amortizationSchedule.map((row) => (
                                        <tr key={row.month} className="border-b border-gray-700 hover:bg-gray-600/50">
                                            <td className="px-6 py-3">{row.month}</td>
                                            <td className="px-6 py-3 text-yellow-400">{formatCurrency(row.principal)}</td>
                                            <td className="px-6 py-3 text-red-400">{formatCurrency(row.interest)}</td>
                                            <td className="px-6 py-3 font-semibold">{formatCurrency(row.balance)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};