import React, { useState } from 'react';
import { Transaction, TransactionType } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { Modal } from './Modal';

interface TransactionsListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transactionId: string) => void;
}

export const TransactionsList: React.FC<TransactionsListProps> = ({ transactions, onEdit, onDelete }) => {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  const handleDelete = () => {
    if (deleteConfirmId) {
        onDelete(deleteConfirmId);
        setDeleteConfirmId(null);
    }
  };

  if (transactions.length === 0) {
    return <p className="text-gray-400 text-center py-4">No transactions yet.</p>;
  }

  return (
    <>
    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="group flex items-center justify-between p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors duration-200">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-gray-800 rounded-full">
              <CategoryIcon category={transaction.category} className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold text-white">{transaction.description}</p>
              <p className="text-sm text-gray-400">{formatDate(transaction.date)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
             <p className={`font-bold ${transaction.type === TransactionType.INCOME ? 'text-green-400' : 'text-red-400'}`}>
                {transaction.type === TransactionType.INCOME ? '+' : '-'}
                ₹{transaction.amount.toLocaleString('en-IN')}
             </p>
             <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                <button onClick={() => onEdit(transaction)} className="p-1 text-gray-400 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>
                </button>
                <button onClick={() => setDeleteConfirmId(transaction.id)} className="p-1 text-gray-400 hover:text-red-400">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
             </div>
          </div>
        </div>
      ))}
    </div>

    <Modal isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)}>
        <h3 className="text-lg font-bold mb-2">Confirm Deletion</h3>
        <p className="text-gray-400 mb-4">Are you sure you want to delete this transaction? This action cannot be undone.</p>
        <div className="flex justify-end space-x-2">
            <button onClick={() => setDeleteConfirmId(null)} className="bg-gray-600 text-white px-4 py-2 rounded-lg">Cancel</button>
            <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded-lg">Delete</button>
        </div>
    </Modal>
    </>
  );
};
