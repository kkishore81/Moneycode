import React, { useMemo, useState } from 'react';
import { Transaction, FinancialSummary, InvestmentWithPerformance, Loan, OtherAsset, DashboardWidgetSettings } from '../types.ts';
import { CashFlowChart } from './CashFlowChart.tsx';
import { ExpenseChart } from './ExpenseChart.tsx';
import { TransactionsList } from './TransactionsList.tsx';
import { FinancialAdvisor } from './FinancialAdvisor.tsx';
import { TransactionModal } from './TransactionModal.tsx';
import { CustomizeDashboardModal } from './CustomizeDashboardModal.tsx';
import { NetWorth } from './NetWorth.tsx';
import { OtherAssetsList } from './OtherAssetsList.tsx';
import { AssetModal } from './AssetModal.tsx';
import { CustomizeIcon, AddIcon } from './icons/NavigationIcons.tsx';
import { AIInsightCards } from './AIInsightCards.tsx';

interface DashboardProps {
    transactions: Transaction[];
    investments: InvestmentWithPerformance[];
    loans: Loan[];
    otherAssets: OtherAsset[];
    onSaveAsset: (asset: Omit<OtherAsset, 'id'> | OtherAsset) => void;
    onDeleteAsset: (assetId: string) => void;
    onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
    onUpdateTransaction: (transaction: Transaction) => void;
    onDeleteTransaction: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
    transactions,
    investments,
    loans,
    otherAssets,
    onSaveAsset,
    onDeleteAsset,
    onAddTransaction,
    onUpdateTransaction,
    onDeleteTransaction,
}) => {
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
    const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
    
    const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
    const [assetToEdit, setAssetToEdit] = useState<OtherAsset | null>(null);

    const [widgetSettings, setWidgetSettings] = useState<DashboardWidgetSettings>({
        summaryCards: true,
        cashFlowChart: true,
        expenseChart: true,
        transactionsList: true,
        aiAdvisor: true,
    });
    
    const financialSummary = useMemo((): FinancialSummary => {
        const monthlyIncome = transactions
            .filter(t => t.type === 'Income')
            .reduce((sum, t) => sum + t.amount, 0);

        const monthlyExpenses = transactions
            .filter(t => t.type === 'Expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalBalance = monthlyIncome - monthlyExpenses;
        
        return { totalBalance, monthlyIncome, monthlyExpenses };
    }, [transactions]);

    const handleOpenEditModal = (transaction: Transaction) => {
        setTransactionToEdit(transaction);
        setIsTransactionModalOpen(true);
    };

    const handleOpenAddModal = () => {
        setTransactionToEdit(null);
        setIsTransactionModalOpen(true);
    };
    
    const handleOpenAddAssetModal = () => {
        setAssetToEdit(null);
        setIsAssetModalOpen(true);
    }
    
    const handleOpenEditAssetModal = (asset: OtherAsset) => {
        setAssetToEdit(asset);
        setIsAssetModalOpen(true);
    }

    const expenses = useMemo(() => transactions.filter(t => t.type === 'Expense'), [transactions]);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                <div className="flex items-center gap-4">
                     <button onClick={() => setIsCustomizeModalOpen(true)} className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                        <CustomizeIcon className="w-5 h-5" />
                        Customize
                     </button>
                    <button onClick={handleOpenAddModal} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                        <AddIcon className="w-5 h-5" />
                        Add Transaction
                    </button>
                </div>
            </div>

            <NetWorth investments={investments} loans={loans} otherAssets={otherAssets} />
            
            <AIInsightCards transactions={transactions} summary={financialSummary} />

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
            
            <OtherAssetsList 
                assets={otherAssets}
                onAdd={handleOpenAddAssetModal}
                onEdit={handleOpenEditAssetModal}
                onDelete={onDeleteAsset}
            />

            {widgetSettings.transactionsList && (
                <div className="bg-gray-800 rounded-2xl shadow-lg p-6">
                    <h2 className="text-xl font-bold mb-4 text-white">Recent Transactions</h2>
                    <TransactionsList transactions={transactions} onEdit={handleOpenEditModal} onDelete={onDeleteTransaction} />
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
                        onUpdateTransaction(data);
                    } else {
                        onAddTransaction(data);
                    }
                }}
                transactionToEdit={transactionToEdit}
            />

            <AssetModal
                isOpen={isAssetModalOpen}
                onClose={() => setIsAssetModalOpen(false)}
                onSave={onSaveAsset}
                assetToEdit={assetToEdit}
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