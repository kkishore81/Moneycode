import React, { useState, useEffect } from 'react';
import { Modal } from './Modal.tsx';
import { Transaction, TransactionType, TransactionCategory } from '../types.ts';
import { getCategorySuggestion } from '../services/geminiService.ts';

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
    const [isSuggesting, setIsSuggesting] = useState(false);

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
        
        let processedValue: string | number | undefined = value;
        if (e.target instanceof HTMLInputElement && e.target.type === 'number') {
            processedValue = parseFloat(value) || 0;
        }
        
        setFormState(prev => ({ ...prev, [name]: processedValue }));
    };

    const handleSuggestCategory = async () => {
        if (!formState.description) return;
        setIsSuggesting(true);
        try {
            const suggestedCategory = await getCategorySuggestion(formState.description);
            setFormState(prev => ({ ...prev, category: suggestedCategory }));
        } catch (error) {
            console.error("Failed to suggest category:", error);
        } finally {
            setIsSuggesting(false);
        }
    };

    const handleSubmit = () => {
        if (!formState.description || formState.amount <= 0) {
            alert('Please enter a description and a valid amount.');
            return;
        }
        onSave(formState);
        onClose();
    };
    
    const expenseCategories = Object.values(TransactionCategory).filter(c => c !== TransactionCategory.SALARY);
    const incomeCategories = [TransactionCategory.SALARY, TransactionCategory.OTHER, TransactionCategory.INVESTMENT];
    const categoryOptions = formState.type === TransactionType.EXPENSE ? expenseCategories : incomeCategories;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h3 className="text-lg font-bold mb-4">{transactionToEdit ? 'Edit' : 'Add'} Transaction</h3>
            <div className="space-y-4">
                <input type="date" name="date" value={formState.date} onChange={handleInputChange} className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none" />
                <div className="flex items-center gap-2">
                    <input type="text" name="description" value={formState.description} onChange={handleInputChange} placeholder="Description (e.g., Groceries)" className="flex-grow bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none" />
                    <button onClick={handleSuggestCategory} disabled={isSuggesting || !formState.description} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
                        {isSuggesting ? '...' : 'Suggest'}
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <input type="number" name="amount" value={formState.amount} onChange={handleInputChange} placeholder="Amount (₹)" className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none" />
                    <select name="type" value={formState.type} onChange={handleInputChange} className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none">
                        <option value={TransactionType.EXPENSE}>Expense</option>
                        <option value={TransactionType.INCOME}>Income</option>
                    </select>
                </div>
                <select name="category" value={formState.category} onChange={handleInputChange} className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none">
                     {categoryOptions.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
                <button onClick={onClose} className="bg-gray-600 text-white px-4 py-2 rounded-lg">Cancel</button>
                <button onClick={handleSubmit} className="bg-green-600 text-white px-4 py-2 rounded-lg">Save</button>
            </div>
        </Modal>
    );
};
