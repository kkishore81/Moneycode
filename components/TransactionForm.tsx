import React, { useState, useEffect } from 'react';
import { Transaction, TransactionCategory, TransactionType } from '../types';

interface TransactionFormProps {
    onSave: (transaction: Omit<Transaction, 'id'> | Transaction) => void;
    onCancel: () => void;
    transactionToEdit: Transaction | null;
}

const initialFormState: Omit<Transaction, 'id'> = {
    description: '',
    amount: 0,
    type: TransactionType.EXPENSE,
    category: TransactionCategory.OTHER,
    date: new Date().toISOString().split('T')[0],
};

export const TransactionForm: React.FC<TransactionFormProps> = ({ onSave, onCancel, transactionToEdit }) => {
    const [formState, setFormState] = useState(initialFormState);
    const [errors, setErrors] = useState<{ description?: string; amount?: string }>({});

    useEffect(() => {
        if (transactionToEdit) {
            setFormState({
                ...transactionToEdit,
                date: new Date(transactionToEdit.date).toISOString().split('T')[0],
            });
        } else {
            setFormState(initialFormState);
        }
        setErrors({});
    }, [transactionToEdit]);

    const validate = () => {
        const newErrors: { description?: string; amount?: string } = {};
        if (!formState.description.trim()) {
            newErrors.description = 'Description is required.';
        }
        if (formState.amount <= 0) {
            newErrors.amount = 'Amount must be greater than zero.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isNumber = type === 'number';

        setFormState(prev => {
            const newState = { ...prev, [name]: isNumber ? parseFloat(value) || 0 : value };
            // If type changes, reset category to a sensible default
            if (name === 'type') {
                newState.category = value === TransactionType.INCOME ? TransactionCategory.SALARY : TransactionCategory.OTHER;
            }
            return newState;
        });

        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = () => {
        if (!validate()) {
            return;
        }

        const dataToSave = {
            ...formState,
            date: new Date(formState.date).toISOString(),
        };
        
        onSave(transactionToEdit ? { ...dataToSave, id: transactionToEdit.id } : dataToSave);
    };

    const expenseCategories = Object.values(TransactionCategory).filter(cat => cat !== TransactionCategory.SALARY);
    const incomeCategories = [TransactionCategory.SALARY, TransactionCategory.OTHER];
    
    return (
        <div className="space-y-4">
            <div>
                <input
                    type="text" name="description" value={formState.description} onChange={handleInputChange}
                    placeholder="Description (e.g., Groceries)"
                    className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
                {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <input type="number" name="amount" value={formState.amount} onChange={handleInputChange} placeholder="Amount (₹)" className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none" />
                    {errors.amount && <p className="text-red-400 text-xs mt-1">{errors.amount}</p>}
                </div>
                <input type="date" name="date" value={formState.date} onChange={handleInputChange} className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <select name="type" value={formState.type} onChange={handleInputChange} className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none">
                    <option value={TransactionType.EXPENSE}>Expense</option>
                    <option value={TransactionType.INCOME}>Income</option>
                </select>
                <select name="category" value={formState.category} onChange={handleInputChange} className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none">
                    {(formState.type === TransactionType.EXPENSE ? expenseCategories : incomeCategories).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
                <button onClick={onCancel} className="bg-gray-600 text-white px-4 py-2 rounded-lg">Cancel</button>
                <button onClick={handleSubmit} className="bg-green-600 text-white px-4 py-2 rounded-lg">Save Transaction</button>
            </div>
        </div>
    );
};