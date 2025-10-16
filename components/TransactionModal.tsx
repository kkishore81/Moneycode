import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Transaction, TransactionType, TransactionCategory } from '../types';

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (transaction: Omit<Transaction, 'id'> | Transaction) => void;
    transactionToEdit: Transaction | null;
    defaultType?: TransactionType;
}

const initialFormState: Omit<Transaction, 'id'> = {
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    description: '',
    type: TransactionType.EXPENSE,
    category: TransactionCategory.OTHER,
};

export const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onSave, transactionToEdit, defaultType }) => {
    const [formState, setFormState] = useState(initialFormState);

    useEffect(() => {
        if (transactionToEdit) {
            setFormState({
                ...transactionToEdit,
                date: new Date(transactionToEdit.date).toISOString().split('T')[0],
            });
        } else {
            setFormState({
                ...initialFormState,
                type: defaultType || TransactionType.EXPENSE,
            });
        }
    }, [transactionToEdit, isOpen, defaultType]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormState(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
    };

    const handleSubmit = () => {
        if (!formState.description || formState.amount <= 0) {
            alert('Please fill in a description and a valid amount.');
            return;
        }

        const dataToSave = {
            ...formState,
            date: new Date(formState.date).toISOString(),
        };

        if (transactionToEdit) {
            onSave({ ...dataToSave, id: transactionToEdit.id });
        } else {
            onSave(dataToSave);
        }
        onClose();
    };
    
    const expenseCategories = Object.values(TransactionCategory).filter(c => c !== TransactionCategory.SALARY);
    const incomeCategories = [TransactionCategory.SALARY, TransactionCategory.OTHER];
    const categoryOptions = formState.type === TransactionType.EXPENSE ? expenseCategories : incomeCategories;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h3 className="text-lg font-bold mb-4">{transactionToEdit ? 'Edit' : 'Add'} Transaction</h3>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <select name="type" value={formState.type} onChange={handleInputChange} className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none">
                        {Object.values(TransactionType).map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                    <input type="date" name="date" value={formState.date} onChange={handleInputChange} className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none" />
                </div>
                 <input type="text" name="description" value={formState.description} onChange={handleInputChange} placeholder="Description" className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none" />
                 <div className="grid grid-cols-2 gap-4">
                    <input type="number" name="amount" value={formState.amount} onChange={handleInputChange} placeholder="Amount (₹)" className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none" />
                    <select name="category" value={formState.category} onChange={handleInputChange} className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none">
                        {categoryOptions.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                 </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
                <button onClick={onClose} className="bg-gray-600 text-white px-4 py-2 rounded-lg">Cancel</button>
                <button onClick={handleSubmit} className="bg-green-600 text-white px-4 py-2 rounded-lg">Save</button>
            </div>
        </Modal>
    );
};