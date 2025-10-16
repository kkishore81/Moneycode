import React, { useMemo, useState } from 'react';
import { Budgets, Transaction, TransactionCategory, TransactionType } from '../types.ts';
import { CategoryIcon } from './CategoryIcon.tsx';
import { Modal } from './Modal.tsx';
import { TransactionModal } from './TransactionModal.tsx';

interface BudgetProps {
    transactions: Transaction[];
    budgets: Budgets;
    onSetBudget: (category: TransactionCategory, amount: number) => void;
    onResetBudgets: () => void;
    onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
}

interface EditModalState {
    isOpen: boolean;
    category: TransactionCategory | null;
    amount: string;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);

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


export const Budget: React.FC<BudgetProps> = ({ transactions, budgets, onSetBudget, onResetBudgets, onAddTransaction }) => {
    const [editModal, setEditModal] = useState<EditModalState>({ isOpen: false, category: null, amount: '' });
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(new Date());

    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [defaultTransactionType, setDefaultTransactionType] = useState<TransactionType>(TransactionType.EXPENSE);

    const openTransactionModal = (type: TransactionType) => {
        setDefaultTransactionType(type);
        setIsTransactionModalOpen(true);
    };

    const handlePreviousMonth = () => {
        setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const isCurrentMonth = selectedMonth.getFullYear() === new Date().getFullYear() && selectedMonth.getMonth() === new Date().getMonth();

    const filteredTransactions = useMemo(() => {
        const startOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
        const endOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);

        return transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate >= startOfMonth && transactionDate <= endOfMonth;
        });
    }, [transactions, selectedMonth]);

    // Fix: Correctly typed the initial value for the reduce function. This ensures proper type inference for
    // the accumulator `acc` and the resulting `expensesByCategory` object, which resolves both TypeScript errors.
    const expensesByCategory = useMemo(() => {
        return filteredTransactions
            .filter(t => t.type === TransactionType.EXPENSE)
            .reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
                return acc;
            }, {} as Record<TransactionCategory, number>);
    }, [filteredTransactions]);

    const { totalIncome, totalExpenses, netFlow } = useMemo(() => {
        const income = filteredTransactions
            .filter(t => t.type === TransactionType.INCOME)
            .reduce((sum, t) => sum + t.amount, 0);

        const expenses = Object.values(expensesByCategory).reduce((sum, amount) => sum + amount, 0);

        return {
            totalIncome: income,
            totalExpenses: expenses,
            netFlow: income - expenses,
        };
    }, [filteredTransactions, expensesByCategory]);


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
    
    const budgetableCategories = Object.values(TransactionCategory).filter(
      cat => cat !== TransactionCategory.SALARY && cat !== TransactionCategory.INVESTMENT
    );

    return (
        <div className="bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={handlePreviousMonth} className="p-2 rounded-full bg-gray-700 hover:bg-gray-600">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <h2 className="text-2xl font-bold text-white text-center w-48">
                        {selectedMonth.toLocaleString('en-IN', { month: 'long', year: 'numeric' })}
                    </h2>
                     <button onClick={handleNextMonth} disabled={isCurrentMonth} className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
                 <div className="flex items-center gap-2">
                    <button 
                        onClick={() => openTransactionModal(TransactionType.INCOME)}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                        + Add Income
                    </button>
                     <button 
                        onClick={() => openTransactionModal(TransactionType.EXPENSE)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                        + Add Expense
                    </button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-900/50 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-400">Total Income</p>
                    <p className="text-2xl font-bold text-green-400">{formatCurrency(totalIncome)}</p>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-400">Total Expenses</p>
                    <p className="text-2xl font-bold text-red-400">{formatCurrency(totalExpenses)}</p>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-400">Net Savings</p>
                    <p className={`text-2xl font-bold ${netFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(netFlow)}
                    </p>
                </div>
            </div>

            <div className="flex justify-between items-center mb-4">
                 <h3 className="text-xl font-bold text-white">Budget Envelopes</h3>
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

            {/* Add Transaction Modal */}
            <TransactionModal
                isOpen={isTransactionModalOpen}
                onClose={() => setIsTransactionModalOpen(false)}
                onSave={onAddTransaction}
                transactionToEdit={null}
                defaultType={defaultTransactionType}
            />
        </div>
    );
};