import React, { useState, useEffect } from 'react';
import { Modal } from './Modal.tsx';
import { RecurringTransaction, TransactionType, TransactionCategory, Frequency } from '../types.ts';

interface RecurringModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (transaction: Omit<RecurringTransaction, 'id'> | RecurringTransaction) => void;
    transactionToEdit: RecurringTransaction | null;
}

const initialFormState: Omit<RecurringTransaction, 'id'> = {
    name: '',
    amount: 0,
    type: TransactionType.EXPENSE,
    category: TransactionCategory.BILLS,
    frequency: Frequency.MONTHLY,
    startDate: new Date().toISOString().split('T')[0],
    nextDueDate: new Date().toISOString().split('T')[0],
};

export const RecurringModal: React.FC<RecurringModalProps> = ({ isOpen, onClose, onSave, transactionToEdit }) => {
    const [formState, setFormState] = useState(initialFormState);

    useEffect(() => {
        if (transactionToEdit) {
            setFormState({
                ...transactionToEdit,
                startDate: new Date(transactionToEdit.startDate).toISOString().split('T')[0],
            });
        } else {
            setFormState(initialFormState);
        }
    }, [transactionToEdit, isOpen]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormState(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
    };

    const handleSubmit = () => {
        if (!formState.name || formState.amount <= 0) {
            alert('Please fill in a name and a valid amount.');
            return;
        }

        const dataToSave = {
            ...formState,
            startDate: new Date(formState.startDate).toISOString(),
            // Set the first due date to be the start date
            nextDueDate: new Date(formState.startDate).toISOString(), 
        };
        
        // If editing, we preserve the original nextDueDate unless the start date changed
        if (transactionToEdit && transactionToEdit.id) {
             onSave({ ...dataToSave, id: transactionToEdit.id, nextDueDate: transactionToEdit.nextDueDate });
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
            <h3 className="text-lg font-bold mb-4">{transactionToEdit ? 'Edit' : 'Add'} Recurring Transaction</h3>
            <div className="space-y-4">
                <input type="text" name="name" value={formState.name} onChange={handleInputChange} placeholder="Name (e.g., Netflix Subscription)" className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none" />
                 <div className="grid grid-cols-2 gap-4">
                    <input type="number" name="amount" value={formState.amount} onChange={handleInputChange} placeholder="Amount (₹)" className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none" />
                    <select name="type" value={formState.type} onChange={handleInputChange} className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none">
                        {Object.values(TransactionType).map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <select name="category" value={formState.category} onChange={handleInputChange} className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none">
                        {categoryOptions.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <select name="frequency" value={formState.frequency} onChange={handleInputChange} className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none">
                        {Object.values(Frequency).map(freq => <option key={freq} value={freq}>{freq}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="text-xs text-gray-400">First Payment / Start Date</label>
                    <input type="date" name="startDate" value={formState.startDate} onChange={handleInputChange} className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none" />
                </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
                <button onClick={onClose} className="bg-gray-600 text-white px-4 py-2 rounded-lg">Cancel</button>
                <button onClick={handleSubmit} className="bg-green-600 text-white px-4 py-2 rounded-lg">Save</button>
            </div>
        </Modal>
    );
};