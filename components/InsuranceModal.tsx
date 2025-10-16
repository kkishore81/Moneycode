import React, { useState, useEffect } from 'react';
import { InsurancePolicy, InsuranceType } from '../types.ts';
import { Modal } from './Modal.tsx';

interface InsuranceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (policy: Omit<InsurancePolicy, 'id'> | InsurancePolicy) => void;
    policyToEdit: InsurancePolicy | null;
}

const initialFormState: Omit<InsurancePolicy, 'id'> = {
    policyName: '',
    type: InsuranceType.LIFE,
    sumAssured: 0,
    premiumAmount: 0,
    premiumDueDate: new Date().toISOString().split('T')[0],
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date().toISOString().split('T')[0],
};

const formatDateForInput = (dateString: string) => new Date(dateString).toISOString().split('T')[0];

export const InsuranceModal: React.FC<InsuranceModalProps> = ({ isOpen, onClose, onSave, policyToEdit }) => {
    const [formState, setFormState] = useState(initialFormState);

    useEffect(() => {
        if (policyToEdit) {
            setFormState({
                ...policyToEdit,
                premiumDueDate: formatDateForInput(policyToEdit.premiumDueDate),
                issueDate: formatDateForInput(policyToEdit.issueDate),
                expiryDate: formatDateForInput(policyToEdit.expiryDate),
            });
        } else {
            setFormState(initialFormState);
        }
    }, [policyToEdit, isOpen]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormState(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
    };

    const handleSubmit = () => {
        if (!formState.policyName || !formState.sumAssured || !formState.premiumAmount) {
            alert('Please fill out all required fields.');
            return;
        }
        const dataToSave = {
            ...formState,
            premiumDueDate: new Date(formState.premiumDueDate).toISOString(),
            issueDate: new Date(formState.issueDate).toISOString(),
            expiryDate: new Date(formState.expiryDate).toISOString(),
        };

        onSave(dataToSave);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h3 className="text-lg font-bold mb-4">{policyToEdit ? 'Edit' : 'Add'} Insurance Policy</h3>
            <div className="space-y-4">
                 <input
                    type="text" name="policyName" value={formState.policyName} onChange={handleInputChange}
                    placeholder="Policy Name (e.g., HDFC Term Plan)"
                    className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
                <select
                    name="type" value={formState.type} onChange={handleInputChange}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                >
                    {Object.values(InsuranceType).map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
                <div className="grid grid-cols-2 gap-4">
                    <input type="number" name="sumAssured" value={formState.sumAssured} onChange={handleInputChange} placeholder="Sum Assured (₹)" className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none" />
                    <input type="number" name="premiumAmount" value={formState.premiumAmount} onChange={handleInputChange} placeholder="Premium (₹)" className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none" />
                </div>
                 <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="text-xs text-gray-400">Issue Date</label>
                        <input type="date" name="issueDate" value={formState.issueDate} onChange={handleInputChange} className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none" />
                    </div>
                     <div>
                        <label className="text-xs text-gray-400">Expiry Date</label>
                        <input type="date" name="expiryDate" value={formState.expiryDate} onChange={handleInputChange} className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none" />
                    </div>
                     <div>
                        <label className="text-xs text-gray-400">Premium Due</label>
                        <input type="date" name="premiumDueDate" value={formState.premiumDueDate} onChange={handleInputChange} className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none" />
                    </div>
                </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
                <button onClick={onClose} className="bg-gray-600 text-white px-4 py-2 rounded-lg">Cancel</button>
                <button onClick={handleSubmit} className="bg-green-600 text-white px-4 py-2 rounded-lg">Save</button>
            </div>
        </Modal>
    );
};