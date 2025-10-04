import React, { useState, useEffect } from 'react';
import { Investment, InvestmentType } from '../types';
import { Modal } from './Modal';

interface InvestmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (investment: Omit<Investment, 'id'> | Investment) => void;
    investmentToEdit: Investment | null;
}

const initialFormState: Omit<Investment, 'id' | 'interestRate'> & { interestRate?: number } = {
    name: '',
    type: InvestmentType.STOCKS,
    investedAmount: 0,
    currentValue: 0,
    purchaseDate: new Date().toISOString().split('T')[0],
};


export const InvestmentModal: React.FC<InvestmentModalProps> = ({ isOpen, onClose, onSave, investmentToEdit }) => {
    const [formState, setFormState] = useState(initialFormState);

    useEffect(() => {
        if (investmentToEdit) {
            setFormState({
                ...investmentToEdit,
                purchaseDate: new Date(investmentToEdit.purchaseDate).toISOString().split('T')[0],
            });
        } else {
            setFormState(initialFormState);
        }
    }, [investmentToEdit, isOpen]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isNumber = type === 'number';
        setFormState(prev => ({ ...prev, [name]: isNumber ? parseFloat(value) || 0 : value }));
    };

    const handleSubmit = () => {
        // Basic validation
        if (!formState.name || !formState.investedAmount) {
            alert('Please fill out at least the name and invested amount.');
            return;
        }

        const dataToSave = {
            ...formState,
            purchaseDate: new Date(formState.purchaseDate).toISOString(),
        };

        if (investmentToEdit) {
            onSave({ ...dataToSave, id: investmentToEdit.id });
        } else {
            onSave(dataToSave);
        }
    };
    
    const isDepositType = formState.type === InvestmentType.FIXED_DEPOSIT || formState.type === InvestmentType.RECURRING_DEPOSIT;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h3 className="text-lg font-bold mb-4">{investmentToEdit ? 'Edit' : 'Add'} Investment</h3>
            <div className="space-y-4">
                <input
                    type="text"
                    name="name"
                    value={formState.name}
                    onChange={handleInputChange}
                    placeholder="Investment Name (e.g., Reliance Stock)"
                    className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
                <select
                    name="type"
                    value={formState.type}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                >
                    {Object.values(InvestmentType).map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
                <input
                    type="number"
                    name="investedAmount"
                    value={formState.investedAmount}
                    onChange={handleInputChange}
                    placeholder="Invested Amount (₹)"
                    className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
                <input
                    type="number"
                    name="currentValue"
                    value={formState.currentValue}
                    onChange={handleInputChange}
                    placeholder="Current Value (₹)"
                    className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
                 {isDepositType && (
                     <input
                        type="number"
                        name="interestRate"
                        value={formState.interestRate || ''}
                        onChange={handleInputChange}
                        placeholder="Interest Rate (%)"
                        className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                    />
                 )}
                <input
                    type="date"
                    name="purchaseDate"
                    value={formState.purchaseDate}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
            </div>
            <div className="flex justify-end space-x-2 mt-6">
                <button onClick={onClose} className="bg-gray-600 text-white px-4 py-2 rounded-lg">Cancel</button>
                <button onClick={handleSubmit} className="bg-green-600 text-white px-4 py-2 rounded-lg">Save</button>
            </div>
        </Modal>
    );
};
