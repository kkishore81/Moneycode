import React, { useState, useEffect } from 'react';
import { Investment, InvestmentType, Goal } from '../types';
import { Modal } from './Modal';

interface InvestmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (investment: Omit<Investment, 'id'> | Investment) => void;
    investmentToEdit: Investment | null;
    goals: Goal[];
}

const initialFormState: Omit<Investment, 'id'> = {
    name: '',
    type: InvestmentType.MUTUAL_FUNDS,
    currentValue: 0,
    startDate: new Date().toISOString().split('T')[0],
    interestRate: 0,
    monthlyInvestment: 0,
    goalId: undefined,
};

export const InvestmentModal: React.FC<InvestmentModalProps> = ({ isOpen, onClose, onSave, investmentToEdit, goals }) => {
    const [formState, setFormState] = useState(initialFormState);

    useEffect(() => {
        if (investmentToEdit) {
            setFormState({
                ...initialFormState, // Start with defaults
                ...investmentToEdit, // Overlay existing data
                startDate: investmentToEdit.startDate ? new Date(investmentToEdit.startDate).toISOString().split('T')[0] : initialFormState.startDate,
            });
        } else {
            setFormState(initialFormState);
        }
    }, [investmentToEdit, isOpen]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        let processedValue: string | number | undefined = value;
        if (type === 'number' || e.target.type === 'number') { // Check target's type attribute
            processedValue = parseFloat(value) || 0;
        }
        if (name === 'goalId' && value === '') {
            processedValue = undefined;
        }

        setFormState(prev => ({ ...prev, [name]: processedValue }));
    };

    const handleSubmit = () => {
        if (!formState.name) {
            alert("Please enter an investment name.");
            return;
        }
        if (!formState.goalId) {
            alert("Please link this investment to a goal.");
            return;
        }
        onSave(formState);
        onClose();
    };
    
    const isAutoCalculated = formState.type === InvestmentType.FD || formState.type === InvestmentType.RECURRING_DEPOSIT;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h3 className="text-lg font-bold mb-4">{investmentToEdit ? 'Edit' : 'Add'} Investment</h3>
            <div className="space-y-4">
                 <input type="text" name="name" value={formState.name} onChange={handleInputChange} placeholder="Investment Name (e.g., SBI Fixed Deposit)" className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none" />
                <select name="type" value={formState.type} onChange={handleInputChange} className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none">
                    {Object.values(InvestmentType).map(type => <option key={type} value={type}>{type}</option>)}
                </select>
                
                <div>
                    <label className="text-xs text-gray-400 mb-1 block">Link to Goal*</label>
                    <select
                        name="goalId"
                        value={formState.goalId || ''}
                        onChange={handleInputChange}
                        className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none disabled:bg-gray-800 disabled:cursor-not-allowed"
                        disabled={goals.length === 0}
                    >
                        <option value="" disabled>
                            {goals.length > 0 ? 'Select a goal' : 'No goals available'}
                        </option>
                        {goals.map(goal => (
                            <option key={goal.id} value={goal.id}>
                                {goal.name}
                            </option>
                        ))}
                    </select>
                    {goals.length === 0 && <p className="text-xs text-yellow-400 mt-1">Please create a goal in the 'Goals' section first.</p>}
                </div>


                {isAutoCalculated ? (
                    <div className="p-4 bg-gray-700/50 rounded-lg space-y-4">
                        <p className="text-sm text-cyan-300">The current value for this investment will be calculated automatically.</p>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Start Date</label>
                                <input type="date" name="startDate" value={formState.startDate} onChange={handleInputChange} className="w-full bg-gray-600 text-white border border-gray-500 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Interest Rate (p.a. %)</label>
                                <input type="number" name="interestRate" value={formState.interestRate} onChange={handleInputChange} placeholder="e.g., 7.5" className="w-full bg-gray-600 text-white placeholder-gray-400 border border-gray-500 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none" />
                            </div>
                        </div>
                        {formState.type === InvestmentType.RECURRING_DEPOSIT && (
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Monthly Investment (₹)</label>
                                <input type="number" name="monthlyInvestment" value={formState.monthlyInvestment} onChange={handleInputChange} placeholder="e.g., 5000" className="w-full bg-gray-600 text-white placeholder-gray-400 border border-gray-500 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none" />
                            </div>
                        )}
                         {formState.type === InvestmentType.FD && (
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Principal Investment (₹)</label>
                                <input type="number" name="currentValue" value={formState.currentValue} onChange={handleInputChange} placeholder="e.g., 100000" className="w-full bg-gray-600 text-white placeholder-gray-400 border border-gray-500 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none" />
                                <p className="text-xs text-gray-500 mt-1">This will also be recorded as your initial transaction.</p>
                            </div>
                        )}
                    </div>
                ) : (
                     <div>
                        <label className="text-xs text-gray-400 mb-1 block">Current Value (₹)</label>
                        <input type="number" name="currentValue" value={formState.currentValue} onChange={handleInputChange} placeholder="Current Market Value" className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none" />
                     </div>
                )}
            </div>
            <div className="flex justify-end space-x-2 mt-6">
                <button onClick={onClose} className="bg-gray-600 text-white px-4 py-2 rounded-lg">Cancel</button>
                <button onClick={handleSubmit} className="bg-green-600 text-white px-4 py-2 rounded-lg">Save</button>
            </div>
        </Modal>
    );
};