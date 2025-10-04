import React, { useMemo, useState } from 'react';
import { Transaction, TransactionType, FinancialSummary } from '../types';
import { DashboardCard } from './DashboardCard';
import { CashFlowChart } from './CashFlowChart';
import { ExpenseChart } from './ExpenseChart';
import { TransactionsList } from './TransactionsList';
import { FinancialAdvisor } from './FinancialAdvisor';
import { TransactionModal } from './TransactionModal';
import { CustomizeDashboardModal } from './CustomizeDashboardModal';
import { DashboardWidgetSettings } from '../App';

interface DashboardProps {
    transactions: Transaction[];
}

export const Dashboard: React.FC<DashboardProps> = ({ transactions: initialTransactions }) => {
    const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
    const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);

    const [widgetSettings, setWidgetSettings] = useState<DashboardWidgetSettings>({
        summaryCards: true,
        cashFlowChart: true,
        expenseChart: true,
        transactionsList: true,
        aiAdvisor: true,
    });
    
    const financialSummary = useMemo((): FinancialSummary => {
        const monthlyIncome = transactions
            .filter(t => t.type === TransactionType.INCOME)
            .reduce((sum, t) => sum + t.amount, 0);

        const monthlyExpenses = transactions
            .filter(t => t.type === TransactionType.EXPENSE)
            .reduce((sum, t) => sum + t.amount, 0);

        const totalBalance = monthlyIncome - monthlyExpenses;
        
        return { totalBalance, monthlyIncome, monthlyExpenses };
    }, [transactions]);

    const handleAddTransaction = (transaction: Omit<Transaction, 'id'>) => {
        const newTransaction = { ...transaction, id: Math.random().toString(36).substring(2, 9) };
        setTransactions(prev => [...prev, newTransaction].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    };

    const handleUpdateTransaction = (transaction: Transaction) => {
        setTransactions(prev => prev.map(t => t.id === transaction.id ? transaction : t));
    };

    const handleDeleteTransaction = (id: string) => {
        setTransactions(prev => prev.filter(t => t.id !== id));
    };

    const handleOpenEditModal = (transaction: Transaction) => {
        setTransactionToEdit(transaction);
        setIsTransactionModalOpen(true);
    };

    const handleOpenAddModal = () => {
        setTransactionToEdit(null);
        setIsTransactionModalOpen(true);
    };

    const expenses = useMemo(() => transactions.filter(t => t.type === TransactionType.EXPENSE), [transactions]);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                <div>
                     <button onClick={() => setIsCustomizeModalOpen(true)} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors mr-2">Customize</button>
                    <button onClick={handleOpenAddModal} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">Add Transaction</button>
                </div>
            </div>

            {widgetSettings.summaryCards && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <DashboardCard title="Total Balance" value={financialSummary.totalBalance} formatAsCurrency />
                    <DashboardCard title="Monthly Income" value={financialSummary.monthlyIncome} formatAsCurrency isPositive />
                    <DashboardCard title="Monthly Expenses" value={financialSummary.monthlyExpenses} formatAsCurrency isNegative />
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {widgetSettings.cashFlowChart && (
                    <div className="bg-gray-800 rounded-2xl shadow-lg p-6">
                        <h2 className="text-xl font-bold mb-4 text-white">Cash Flow</h2>
                        <CashFlowChart transactions={transactions} />
                    </div>
                )}
                {widgetSettings.expenseChart && (
                     <div className="bg-gray-800 rounded-2xl shadow-lg p-6">
                        <h2 className="text-xl font-bold mb-4 text-white">Expense Breakdown</h2>
                        <ExpenseChart data={expenses} />
                    </div>
                )}
            </div>

            {widgetSettings.transactionsList && (
                <div className="bg-gray-800 rounded-2xl shadow-lg p-6">
                    <h2 className="text-xl font-bold mb-4 text-white">Recent Transactions</h2>
                    <TransactionsList transactions={transactions} onEdit={handleOpenEditModal} onDelete={handleDeleteTransaction} />
                </div>
            )}
            
            {widgetSettings.aiAdvisor && (
                <FinancialAdvisor transactions={transactions} summary={financialSummary} />
            )}

            <TransactionModal 
                isOpen={isTransactionModalOpen}
                onClose={() => setIsTransactionModalOpen(false)}
                onSave={(data) => {
                    if('id' in data) {
                        handleUpdateTransaction(data);
                    } else {
                        handleAddTransaction(data);
                    }
                }}
                transactionToEdit={transactionToEdit}
            />

            <CustomizeDashboardModal 
                isOpen={isCustomizeModalOpen}
                onClose={() => setIsCustomizeModalOpen(false)}
                settings={widgetSettings}
                onSettingsChange={setWidgetSettings}
            />
        </div>
    );
};
