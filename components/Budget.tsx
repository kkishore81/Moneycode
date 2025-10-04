import React, { useMemo, useState } from 'react';
import { Budgets, Transaction, TransactionCategory, TransactionType } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { Modal } from './Modal';

interface BudgetProps {
    transactions: Transaction[];
    budgets: Budgets;
    onSetBudget: (category: TransactionCategory, amount: number) => void;
    onResetBudgets: () => void;
}

interface EditModalState {
    isOpen: boolean;
    category: TransactionCategory | null;
    amount: string;
}

const BudgetCategoryRow: React.FC<{
    category: TransactionCategory;
    spent: number;
    budget: number;
    onEdit: () => void;
}> = ({ category, spent, budget, onEdit }) => {
    const percentage = budget > 0 ? (spent / budget) * 100 : 0;
    const isOverBudget = percentage > 100;
    
    let progressBarColor = 'bg-green-500';
    if (isOverBudget) { // > 100%
        progressBarColor = 'bg-red-500';
    } else if (percentage > 75) { // > 75% and <= 100%
        progressBarColor = 'bg-yellow-500';
    }

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-4 bg-gray-700/50 rounded-lg">
            <div className="flex items-center space-x-4">
                <div className="p-2 bg-gray-800 rounded-full">
                    <CategoryIcon category={category} className="w-6 h-6" />
                </div>
                <span className="font-semibold text-white">{category}</span>
            </div>
            
            <div className="w-full">
                <div className="flex justify-between items-center mb-1 text-sm">
                    <span className={`font-bold ${isOverBudget ? 'text-red-400' : 'text-gray-200'}`}>{formatCurrency(spent)}</span>
                    <span className="text-gray-400">of {formatCurrency(budget)}</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2.5">
                    <div className={`${progressBarColor} h-2.5 rounded-full`} style={{ width: `${Math.min(percentage, 100)}%` }}></div>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={onEdit}
                    className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    Edit
                </button>
            </div>
        </div>
    );
};


export const Budget: React.FC<BudgetProps> = ({ transactions, budgets, onSetBudget, onResetBudgets }) => {
    const [editModal, setEditModal] = useState<EditModalState>({ isOpen: false, category: null, amount: '' });
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);

    const expensesByCategory = useMemo(() => {
        return transactions
            .filter(t => t.type === TransactionType.EXPENSE)
            .reduce((acc, t) => {
                if (!acc[t.category]) {
                    acc[t.category] = 0;
                }
                acc[t.category] += t.amount;
                return acc;
            }, {} as Record<TransactionCategory, number>);
    }, [transactions]);

    const handleOpenEditModal = (category: TransactionCategory) => {
        setEditModal({
            isOpen: true,
            category,
            amount: budgets[category]?.toString() || '0'
        });
    };
    
    const handleCloseEditModal = () => {
        setEditModal({ isOpen: false, category: null, amount: '' });
    };

    const handleSaveBudget = () => {
        if (editModal.category) {
            const amount = parseFloat(editModal.amount) || 0;
            onSetBudget(editModal.category, amount);
        }
        handleCloseEditModal();
    };

    const handleConfirmReset = () => {
        onResetBudgets();
        setIsResetModalOpen(false);
    }
    
    // Filter out categories that shouldn't have budgets, like Salary
    const budgetableCategories = Object.values(TransactionCategory).filter(
      cat => cat !== TransactionCategory.SALARY
    );

    return (
        <div className="bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Budget Envelopes</h2>
                <button 
                    onClick={() => setIsResetModalOpen(true)}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    Reset All Budgets
                </button>
            </div>
            
            <div className="space-y-4">
                {budgetableCategories.map(category => (
                    <BudgetCategoryRow 
                        key={category}
                        category={category}
                        spent={expensesByCategory[category] || 0}
                        budget={budgets[category] || 0}
                        onEdit={() => handleOpenEditModal(category)}
                    />
                ))}
            </div>

            {/* Edit Budget Modal */}
            <Modal isOpen={editModal.isOpen} onClose={handleCloseEditModal}>
                <h3 className="text-lg font-bold mb-4">Set Budget for {editModal.category}</h3>
                <input
                    type="number"
                    value={editModal.amount}
                    onChange={(e) => setEditModal(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-green-500 focus:outline-none"
                    placeholder="Enter budget amount"
                />
                <div className="flex justify-end space-x-2">
                    <button onClick={handleCloseEditModal} className="bg-gray-600 text-white px-4 py-2 rounded-lg">Cancel</button>
                    <button onClick={handleSaveBudget} className="bg-green-600 text-white px-4 py-2 rounded-lg">Save</button>
                </div>
            </Modal>

            {/* Reset Confirmation Modal */}
            <Modal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)}>
                 <h3 className="text-lg font-bold mb-2">Are you sure?</h3>
                 <p className="text-gray-400 mb-4">This will reset all your budget allocations to ₹0.</p>
                 <div className="flex justify-end space-x-2">
                    <button onClick={() => setIsResetModalOpen(false)} className="bg-gray-600 text-white px-4 py-2 rounded-lg">Cancel</button>
                    <button onClick={handleConfirmReset} className="bg-red-600 text-white px-4 py-2 rounded-lg">Confirm Reset</button>
                </div>
            </Modal>
        </div>
    );
};