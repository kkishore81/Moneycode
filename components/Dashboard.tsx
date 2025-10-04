import React, { useState } from 'react';
import { DashboardCard } from './DashboardCard';
import { ExpenseChart } from './ExpenseChart';
import { FinancialAdvisor } from './FinancialAdvisor';
import { TransactionsList } from './TransactionsList';
import { FinancialSummary, Transaction, TransactionType } from '../types';
import { TransactionModal } from './TransactionModal';
import { CashFlowChart } from './CashFlowChart';
import { CustomizeDashboardModal } from './CustomizeDashboardModal';
import { DashboardWidgetSettings } from '../App';
import { TransactionForm } from './TransactionForm';

interface DashboardProps {
    transactions: Transaction[];
    summary: FinancialSummary;
    onSaveTransaction: (transaction: Omit<Transaction, 'id'> | Transaction) => void;
    onDeleteTransaction: (transactionId: string) => void;
    widgetSettings: DashboardWidgetSettings;
    onWidgetSettingsChange: (settings: DashboardWidgetSettings) => void;
}

const SettingsIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);


export const Dashboard: React.FC<DashboardProps> = ({ transactions, summary, onSaveTransaction, onDeleteTransaction, widgetSettings, onWidgetSettingsChange }) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
    const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);

    const expenseTransactions = transactions.filter(t => t.type === TransactionType.EXPENSE);

    const handleOpenEditTransaction = (transaction: Transaction) => {
        setTransactionToEdit(transaction);
        setIsEditModalOpen(true);
    };
    
    const handleSaveAddForm = (transaction: Omit<Transaction, 'id'> | Transaction) => {
        onSaveTransaction(transaction);
        setShowAddForm(false);
    };

    const handleSaveEditForm = (transaction: Omit<Transaction, 'id'> | Transaction) => {
        onSaveTransaction(transaction);
        setIsEditModalOpen(false);
    };


    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <div className="flex items-center space-x-2">
                    <button onClick={() => setIsCustomizeModalOpen(true)} className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full text-gray-300 transition-colors">
                        <SettingsIcon className="w-5 h-5"/>
                    </button>
                    {!showAddForm && (
                        <button onClick={() => setShowAddForm(true)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                            Add Transaction
                        </button>
                    )}
                </div>
            </div>

            {/* Inline Add Transaction Form */}
            {showAddForm && (
                <div className="bg-gray-800 rounded-2xl shadow-lg p-6">
                    <h2 className="text-xl font-bold mb-4 text-white">Add New Transaction</h2>
                    <TransactionForm
                        onSave={handleSaveAddForm}
                        onCancel={() => setShowAddForm(false)}
                        transactionToEdit={null}
                    />
                </div>
            )}


            {/* Summary Cards */}
            {widgetSettings.summaryCards && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <DashboardCard title="Total Balance" value={summary.totalBalance} formatAsCurrency isPositive={summary.totalBalance >= 0} isNegative={summary.totalBalance < 0} />
                    <DashboardCard title="Monthly Income" value={summary.monthlyIncome} formatAsCurrency isPositive />
                    <DashboardCard title="Monthly Expenses" value={summary.monthlyExpenses} formatAsCurrency isNegative />
                </div>
            )}
            
            {/* Cash Flow Chart */}
            {widgetSettings.cashFlowChart && (
                <div className="bg-gray-800 rounded-2xl shadow-lg p-6">
                     <h2 className="text-xl font-bold mb-4 text-white">Cash Flow Trend</h2>
                     <CashFlowChart transactions={transactions} />
                </div>
            )}


            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Transactions & AI */}
                <div className="lg:col-span-2 space-y-8">
                     {widgetSettings.transactionsList && (
                        <div>
                            <h2 className="text-xl font-bold mb-4 text-white">All Transactions</h2>
                            <TransactionsList 
                                transactions={transactions} 
                                onEdit={handleOpenEditTransaction}
                                onDelete={onDeleteTransaction}
                            />
                        </div>
                    )}
                    {widgetSettings.aiAdvisor && <FinancialAdvisor transactions={transactions} summary={summary} />}
                </div>
                
                {/* Expense Chart */}
                {widgetSettings.expenseChart && (
                    <div className="bg-gray-800 rounded-2xl shadow-lg p-6">
                         <h2 className="text-xl font-bold mb-4 text-white">Expense Breakdown</h2>
                         <ExpenseChart data={expenseTransactions} />
                    </div>
                )}
            </div>

            <TransactionModal 
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleSaveEditForm}
                transactionToEdit={transactionToEdit}
            />
            
            <CustomizeDashboardModal
                isOpen={isCustomizeModalOpen}
                onClose={() => setIsCustomizeModalOpen(false)}
                settings={widgetSettings}
                onSettingsChange={onWidgetSettingsChange}
            />
        </div>
    );
};