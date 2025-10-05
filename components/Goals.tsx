import React, { useState } from 'react';
import { Goal } from '../types';
import { Modal } from './Modal';

interface GoalsProps {
    goals: Goal[];
    onAddGoal: (goal: Omit<Goal, 'id' | 'currentAmount'>) => void;
    onUpdateGoal: (goal: Omit<Goal, 'currentAmount'>) => void;
    onDeleteGoal: (goalId: string) => void;
}

const initialFormState: Omit<Goal, 'id' | 'currentAmount'> = {
    name: '',
    targetAmount: 0,
    deadline: '',
};

export const Goals: React.FC<GoalsProps> = ({ goals, onAddGoal, onUpdateGoal, onDeleteGoal }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formState, setFormState] = useState<Omit<Goal, 'id' | 'currentAmount'> & { id?: string }>(initialFormState);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
    const formatDate = (dateString: string) => new Date(dateString).toISOString().split('T')[0]; // YYYY-MM-DD for input

    const openAddModal = () => {
        setIsEditing(false);
        setFormState(initialFormState);
        setIsModalOpen(true);
    };
    
    const openEditModal = (goal: Goal) => {
        setIsEditing(true);
        setFormState({
            id: goal.id,
            name: goal.name,
            targetAmount: goal.targetAmount,
            deadline: formatDate(goal.deadline),
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormState(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
    };

    const handleSubmit = () => {
        if (!formState.name || !formState.targetAmount || !formState.deadline) {
            alert('Please fill out name, target amount, and deadline.');
            return;
        }

        const goalData = {
            name: formState.name,
            targetAmount: formState.targetAmount,
            deadline: new Date(formState.deadline).toISOString(),
        };
        
        if (isEditing && formState.id) {
            onUpdateGoal({ ...goalData, id: formState.id });
        } else {
            onAddGoal(goalData);
        }
        
        handleCloseModal();
    };
    
    const handleDelete = (id: string) => {
        onDeleteGoal(id);
        setDeleteConfirmId(null);
    };
    
    return (
        <div className="bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Financial Goals</h2>
                <button 
                    onClick={openAddModal}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    Add Goal
                </button>
            </div>
            
            <div className="space-y-4">
                {goals.length > 0 ? (
                    goals.map(goal => {
                        const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
                        return (
                            <div key={goal.id} className="p-4 bg-gray-700/50 rounded-lg">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-grow">
                                        <p className="font-bold text-white">{goal.name}</p>
                                        <p className="text-sm text-gray-400">Deadline: {new Date(goal.deadline).toLocaleDateString('en-IN')}</p>
                                    </div>
                                    <div className="flex space-x-2 flex-shrink-0">
                                        <button onClick={() => openEditModal(goal)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-3 rounded-lg text-sm">Edit</button>
                                        <button onClick={() => setDeleteConfirmId(goal.id)} className="bg-red-800 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-lg text-sm">Delete</button>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-800 rounded-full h-2.5 mb-1">
                                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-bold text-gray-200">{formatCurrency(goal.currentAmount)}</span>
                                    <span className="text-gray-400">of {formatCurrency(goal.targetAmount)}</span>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <p className="text-gray-400 text-center py-8">No goals set yet. Add a goal to start saving!</p>
                )}
            </div>

             <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
                <h3 className="text-lg font-bold mb-4">{isEditing ? 'Edit' : 'Add'} Goal</h3>
                <div className="space-y-4">
                    <input type="text" name="name" value={formState.name} onChange={handleInputChange} placeholder="Goal Name (e.g., New Car)" className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none" />
                    <input type="number" name="targetAmount" value={formState.targetAmount} onChange={handleInputChange} placeholder="Target Amount (₹)" className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none" />
                    <input type="date" name="deadline" value={formState.deadline} onChange={handleInputChange} className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none" />
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                    <button onClick={handleCloseModal} className="bg-gray-600 text-white px-4 py-2 rounded-lg">Cancel</button>
                    <button onClick={handleSubmit} className="bg-green-600 text-white px-4 py-2 rounded-lg">Save</button>
                </div>
            </Modal>
            
            <Modal isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)}>
                 <h3 className="text-lg font-bold mb-2">Confirm Deletion</h3>
                 <p className="text-gray-400 mb-4">Are you sure you want to delete this goal? This action cannot be undone.</p>
                 <div className="flex justify-end space-x-2">
                    <button onClick={() => setDeleteConfirmId(null)} className="bg-gray-600 text-white px-4 py-2 rounded-lg">Cancel</button>
                    <button onClick={() => handleDelete(deleteConfirmId!)} className="bg-red-600 text-white px-4 py-2 rounded-lg">Delete</button>
                </div>
            </Modal>
        </div>
    );
};