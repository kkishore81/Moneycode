import React, { useState } from 'react';
import { RecurringTransaction } from '../types.ts';
import { RecurringList } from './RecurringList.tsx';
import { RecurringModal } from './RecurringModal.tsx';
import { Modal } from './Modal.tsx';

interface RecurringProps {
    recurringTransactions: RecurringTransaction[];
    onSave: (transaction: Omit<RecurringTransaction, 'id'> | RecurringTransaction) => void;
    onDelete: (transactionId: string) => void;
}

export const Recurring: React.FC<RecurringProps> = ({ recurringTransactions, onSave, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [transactionToEdit, setTransactionToEdit] = useState<RecurringTransaction | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    const handleOpenAddModal = () => {
        setTransactionToEdit(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (transaction: RecurringTransaction) => {
        setTransactionToEdit(transaction);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleDelete = () => {
        if(deleteConfirmId) {
            onDelete(deleteConfirmId);
            setDeleteConfirmId(null);
        }
    };

    return (
        <div className="bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Recurring Transactions</h2>
                <button 
                    onClick={handleOpenAddModal}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    Add Recurring
                </button>
            </div>
            
            <RecurringList 
                transactions={recurringTransactions}
                onEdit={handleOpenEditModal}
                onDelete={(id) => setDeleteConfirmId(id)}
            />

            <RecurringModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={onSave}
                transactionToEdit={transactionToEdit}
            />

            <Modal isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)}>
                 <h3 className="text-lg font-bold mb-2">Confirm Deletion</h3>
                 <p className="text-gray-400 mb-4">Are you sure you want to delete this recurring transaction? This will stop future automatic entries.</p>
                 <div className="flex justify-end space-x-2">
                    <button onClick={() => setDeleteConfirmId(null)} className="bg-gray-600 text-white px-4 py-2 rounded-lg">Cancel</button>
                    <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded-lg">Delete</button>
                </div>
            </Modal>
        </div>
    );
};