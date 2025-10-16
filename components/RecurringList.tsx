import React from 'react';
import { RecurringTransaction, TransactionType } from '../types.ts';
import { CategoryIcon } from './CategoryIcon.tsx';

interface RecurringListProps {
    transactions: RecurringTransaction[];
    onEdit: (transaction: RecurringTransaction) => void;
    onDelete: (transactionId: string) => void;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export const RecurringList: React.FC<RecurringListProps> = ({ transactions, onEdit, onDelete }) => {
    return (
        <div className="space-y-4">
            {transactions.length > 0 ? (
                transactions.map(transaction => (
                    <div key={transaction.id} className="group flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                        <div className="flex items-center space-x-4">
                            <div className="p-2 bg-gray-800 rounded-full">
                                <CategoryIcon category={transaction.category} className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="font-semibold text-white">{transaction.name}</p>
                                <p className="text-sm text-gray-400">
                                    {transaction.frequency} &bull; Next on {formatDate(transaction.nextDueDate)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <p className={`font-bold ${transaction.type === TransactionType.INCOME ? 'text-green-400' : 'text-red-400'}`}>
                                {formatCurrency(transaction.amount)}
                            </p>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                                <button onClick={() => onEdit(transaction)} className="p-1 text-gray-400 hover:text-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>
                                </button>
                                <button onClick={() => onDelete(transaction.id)} className="p-1 text-gray-400 hover:text-red-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-12 text-gray-400">
                    <p>No recurring transactions set up yet.</p>
                    <p className="text-sm text-gray-500">Add recurring bills, subscriptions, or salaries to automate tracking.</p>
                </div>
            )}
        </div>
    );
};