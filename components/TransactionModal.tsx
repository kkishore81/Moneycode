import React from 'react';
import { Transaction } from '../types';
import { Modal } from './Modal';
import { TransactionForm } from './TransactionForm';

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (transaction: Omit<Transaction, 'id'> | Transaction) => void;
    transactionToEdit: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onSave, transactionToEdit }) => {
    
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h3 className="text-lg font-bold mb-4">Edit Transaction</h3>
            <TransactionForm
                onSave={onSave}
                onCancel={onClose}
                transactionToEdit={transactionToEdit}
            />
        </Modal>
    );
};