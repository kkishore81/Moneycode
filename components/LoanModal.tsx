import React, { useState, useEffect } from 'react';
import { Loan, LoanType } from '../types.ts';
import { Modal } from './Modal.tsx';
import { calculateEMI } from '../utils/loanCalculators.ts';

interface LoanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (loan: Omit<Loan, 'id'> | Loan) => void;
    loanToEdit: Loan | null;
}

const initialFormState: Omit<Loan, 'id' | 'emi'> = {
    name: '',
    type: LoanType.PERSONAL,
    principal: 0,
    outstandingAmount: 0,
    interestRate: 0,
    tenure: 0,
    startDate: new Date().toISOString().split('T')[0],
    assetCurrentValue: 0,
    status: 'Active',
};

export const LoanModal: React.FC<LoanModalProps> = ({ isOpen, onClose, onSave, loanToEdit }) => {
    const [formState, setFormState] = useState(initialFormState);

    useEffect(() => {
        if (loanToEdit) {
            setFormState({
                ...loanToEdit,
                startDate: new Date(loanToEdit.startDate).toISOString().split('T')[0],
            });
        } else {
            setFormState(initialFormState);
        }
    }, [loanToEdit, isOpen]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormState(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
    };

    const handleSubmit = () => {
        if (!formState.name || !formState.principal || !formState.interestRate || !formState.tenure) {
            alert('Please fill out all required fields.');
            return;
        }
        
        const emi = calculateEMI(formState.principal, formState.interestRate, formState.tenure);

        const dataToSave = {
            ...formState,
            startDate: new Date(formState.startDate).toISOString(),
            emi,
        };

        onSave(dataToSave);
        onClose();
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h3 className="text-lg font-bold mb-4">{loanToEdit ? 'Edit' : 'Add'} Loan</h3>
            <div className="space-y-4">
                 <input type="text" name="name" value={formState.name} onChange={handleInputChange} placeholder="Loan Name (e.g., HDFC Home Loan)" className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none" />
                <select name="type" value={formState.type} onChange={handleInputChange} className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none">
                    {Object.values(LoanType).map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
                <div className="grid grid-cols-2 gap-4">
                    <input type="number" name="principal" value={formState.principal} onChange={handleInputChange} placeholder="Principal Amount (₹)" className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none" />
                    <input type="number" name="outstandingAmount" value={formState.outstandingAmount} onChange={handleInputChange} placeholder="Outstanding Amount (₹)" className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none" />
                    <input type="number" name="interestRate" value={formState.interestRate} onChange={handleInputChange} placeholder="Interest Rate (p.a. %)" className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none" />
                    <input type="number" name="tenure" value={formState.tenure} onChange={handleInputChange} placeholder="Tenure (Years)" className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none" />
                </div>
                 {(formState.type === LoanType.HOME || formState.type === LoanType.CAR) && (
                    <input
                        type="number"
                        name="assetCurrentValue"
                        value={formState.assetCurrentValue || ''}
                        onChange={handleInputChange}
                        placeholder="Current Asset Value (₹)"
                        className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                    />
                 )}
                 <div>
                    <label className="text-xs text-gray-400">Start Date</label>
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