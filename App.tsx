
import React, { useState, useEffect, useMemo } from 'react';
import { Auth } from './Auth';
import { Verification } from './Verification';
import { Header } from './components/Header';
import { Navbar, View } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { Budget } from './components/Budget';
import { Goals } from './components/Goals';
import { Investments } from './components/Investments';
import { Insurance } from './components/Insurance';
import { Loans } from './components/Loans';
import { Calculators } from './components/Calculators';
import { WillCreator } from './components/WillCreator';
import { Transaction, TransactionType, TransactionCategory, Budgets, Goal, InsurancePolicy, InsuranceType, Loan, LoanType, Investment, InvestmentType, InvestmentWithPerformance, OtherAsset } from './types';
import { calculateXIRR } from './utils/xirr';
import { calculateFdValue, calculateRdValue } from './utils/investmentCalculators';


// Define this type since it's used in CustomizeDashboardModal
export interface DashboardWidgetSettings {
    summaryCards: boolean;
    cashFlowChart: boolean;
    expenseChart: boolean;
    transactionsList: boolean;
    aiAdvisor: boolean;
}

const simpleId = () => Math.random().toString(36).substring(2, 9);

// Mock Data Inlined
const mockData = {
    transactions: [
        { id: simpleId(), date: new Date(2023, 10, 1).toISOString(), amount: 50000, description: 'Monthly Salary', type: TransactionType.INCOME, category: TransactionCategory.SALARY },
        { id: simpleId(), date: new Date(2023, 10, 2).toISOString(), amount: 2500, description: 'Groceries', type: TransactionType.EXPENSE, category: TransactionCategory.FOOD },
        { id: simpleId(), date: new Date(2023, 10, 5).toISOString(), amount: 5000, description: 'Rent', type: TransactionType.EXPENSE, category: TransactionCategory.HOUSING },
        // Investment transactions
        { id: simpleId(), date: new Date(2023, 0, 15).toISOString(), amount: 100000, description: 'Initial FD Investment', type: TransactionType.EXPENSE, category: TransactionCategory.INVESTMENT, investmentId: 'fd1' },
        { id: simpleId(), date: new Date(2023, 6, 5).toISOString(), amount: 5000, description: 'Monthly RD Installment', type: TransactionType.EXPENSE, category: TransactionCategory.INVESTMENT, investmentId: 'rd1' },
        { id: simpleId(), date: new Date(2023, 7, 5).toISOString(), amount: 5000, description: 'Monthly RD Installment', type: TransactionType.EXPENSE, category: TransactionCategory.INVESTMENT, investmentId: 'rd1' },
    ],
    budgets: {
        [TransactionCategory.FOOD]: 10000,
        [TransactionCategory.SHOPPING]: 5000,
    },
    goals: [
        { id: simpleId(), name: 'Vacation to Goa', targetAmount: 50000, currentAmount: 15000, deadline: new Date(2024, 5, 1).toISOString() },
    ],
    insurancePolicies: [
        { id: simpleId(), policyName: 'HDFC Life Click 2 Protect', type: InsuranceType.LIFE, sumAssured: 10000000, premiumAmount: 15000, premiumDueDate: new Date(2024, 0, 15).toISOString(), issueDate: new Date(2022, 0, 10).toISOString(), expiryDate: new Date(2052, 0, 10).toISOString() },
    ],
    loans: [
        { id: simpleId(), name: 'SBI Home Loan', type: LoanType.HOME, principal: 5000000, outstandingAmount: 4800000, interestRate: 8.5, tenure: 20, emi: 43391, startDate: new Date(2022, 6, 1).toISOString(), assetCurrentValue: 6000000 },
    ],
    investments: [
        { id: 'fd1', name: 'SBI Fixed Deposit', type: InvestmentType.FD, currentValue: 100000, startDate: new Date(2023, 0, 15).toISOString(), interestRate: 7.5 },
        { id: 'rd1', name: 'ICICI Recurring Deposit', type: InvestmentType.RECURRING_DEPOSIT, currentValue: 10000, startDate: new Date(2023, 6, 5).toISOString(), interestRate: 7.0, monthlyInvestment: 5000 },
        { id: simpleId(), name: 'Nifty 50 Index Fund', type: InvestmentType.MUTUAL_FUNDS, currentValue: 120000 },
    ],
    otherAssets: [
        { id: simpleId(), name: 'Savings Account Balance', value: 250000 },
        { id: simpleId(), name: 'Primary Home Value', value: 7500000 },
    ],
};


const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [needsVerification, setNeedsVerification] = useState(false);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [activeView, setActiveView] = useState<View>('dashboard');

    // State for all financial data
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [budgets, setBudgets] = useState<Budgets>({});
    const [goals, setGoals] = useState<Goal[]>([]);
    const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
    const [loans, setLoans] = useState<Loan[]>([]);
    const [investments, setInvestments] = useState<Investment[]>([]);
    const [otherAssets, setOtherAssets] = useState<OtherAsset[]>([]);
    
    // Load data from mock on mount
    useEffect(() => {
        setTransactions(mockData.transactions);
        setBudgets(mockData.budgets);
        setGoals(mockData.goals);
        setPolicies(mockData.insurancePolicies);
        setLoans(mockData.loans);
        setInvestments(mockData.investments);
        setOtherAssets(mockData.otherAssets);
    }, []);

    const investmentsWithPerformance = useMemo((): InvestmentWithPerformance[] => {
        return investments.map(inv => {
            const investmentTransactions = transactions.filter(t => t.investmentId === inv.id);
            const totalInvested = investmentTransactions.reduce((sum, t) => sum + t.amount, 0);
            
            let calculatedCurrentValue = inv.currentValue;
            if (inv.type === InvestmentType.FD && inv.startDate && inv.interestRate) {
                calculatedCurrentValue = calculateFdValue(totalInvested, inv.interestRate, inv.startDate);
            } else if (inv.type === InvestmentType.RECURRING_DEPOSIT && inv.startDate && inv.interestRate && inv.monthlyInvestment) {
                calculatedCurrentValue = calculateRdValue(inv.monthlyInvestment, inv.interestRate, inv.startDate);
            }

            const cashFlows = investmentTransactions.map(t => ({ value: -t.amount, date: new Date(t.date) }));
            if (calculatedCurrentValue > 0) {
                cashFlows.push({ value: calculatedCurrentValue, date: new Date() });
            }

            cashFlows.sort((a,b) => a.date.getTime() - b.date.getTime());
            
            const values = cashFlows.map(cf => cf.value);
            const dates = cashFlows.map(cf => cf.date);
            const xirr = calculateXIRR(values, dates);

            return {
                ...inv,
                currentValue: calculatedCurrentValue,
                totalInvested,
                pnl: calculatedCurrentValue - totalInvested,
                xirr: isNaN(xirr) ? 0 : xirr,
            };
        });
    }, [investments, transactions]);

    // Data Handlers for Transactions and Assets
    const handleAddTransaction = (transaction: Omit<Transaction, 'id'>) => {
        const newTransaction = { ...transaction, id: simpleId() };
        setTransactions(prev => [...prev, newTransaction].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    };

    const handleUpdateTransaction = (transaction: Transaction) => {
        setTransactions(prev => prev.map(t => t.id === transaction.id ? transaction : t));
    };

    const handleDeleteTransaction = (id: string) => {
        setTransactions(prev => prev.filter(t => t.id !== id));
    };

    const handleSaveAsset = (asset: Omit<OtherAsset, 'id'> | OtherAsset) => {
        if ('id' in asset) {
            setOtherAssets(prev => prev.map(a => a.id === asset.id ? asset : a));
        } else {
            setOtherAssets(prev => [...prev, { ...asset, id: simpleId() }]);
        }
    };

    const handleDeleteAsset = (assetId: string) => {
        setOtherAssets(prev => prev.filter(a => a.id !== assetId));
    };


    // Auth Handlers
    const handleLogin = () => {
        setIsAuthenticated(true);
        setNeedsVerification(false);
    };

    const handleSignupRequest = (email: string) => {
        setUserEmail(email);
        setNeedsVerification(true);
    };

    const handleVerify = (code: string): boolean => {
        if (code === '123456') { // Mock verification
            handleLogin();
            return true;
        }
        return false;
    };
    
    const handleLogout = () => {
        setIsAuthenticated(false);
        setUserEmail(null);
        setNeedsVerification(false);
    };

    const renderContent = () => {
        switch (activeView) {
            case 'dashboard': return <Dashboard 
                transactions={transactions} 
                investments={investmentsWithPerformance} 
                loans={loans} 
                otherAssets={otherAssets} 
                onSaveAsset={handleSaveAsset} 
                onDeleteAsset={handleDeleteAsset}
                onAddTransaction={handleAddTransaction}
                onUpdateTransaction={handleUpdateTransaction}
                onDeleteTransaction={handleDeleteTransaction}
            />;
            case 'budgets': return <Budget transactions={transactions} budgets={budgets} onSetBudget={(cat, amt) => setBudgets(b => ({...b, [cat]: amt}))} onResetBudgets={() => setBudgets({})} />;
            case 'goals': return <Goals goals={goals} onAddGoal={() => {}} onUpdateGoal={() => {}} onDeleteGoal={() => {}} />;
            // Fix: Pass transactions to Investments component to fix chart data calculation.
            case 'investments': return <Investments investments={investmentsWithPerformance} transactions={transactions} onSaveInvestment={() => {}} onDeleteInvestment={() => {}} />;
            case 'insurance': return <Insurance policies={policies} onAddPolicy={() => {}} onUpdatePolicy={() => {}} onDeletePolicy={() => {}} />;
            case 'loans': return <Loans loans={loans} onSaveLoan={() => {}} onDeleteLoan={() => {}} />;
            case 'calculators': return <Calculators />;
            case 'will-creator': return <WillCreator />;
            default: return <Dashboard 
                transactions={transactions} 
                investments={investmentsWithPerformance} 
                loans={loans} 
                otherAssets={otherAssets} 
                onSaveAsset={handleSaveAsset} 
                onDeleteAsset={handleDeleteAsset} 
                onAddTransaction={handleAddTransaction}
                onUpdateTransaction={handleUpdateTransaction}
                onDeleteTransaction={handleDeleteTransaction}
            />;
        }
    };
    
    if (!isAuthenticated) {
        if (needsVerification) {
            return <Verification onVerify={handleVerify} userEmail={userEmail} />;
        }
        return <Auth onLogin={handleLogin} onSignupRequest={handleSignupRequest} onGoogleLogin={handleLogin} />;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
            <Header onLogout={handleLogout} />
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row gap-8">
                    <aside className="w-full md:w-1/4">
                        <Navbar activeView={activeView} setActiveView={setActiveView} />
                    </aside>
                    <section className="flex-1">
                        {renderContent()}
                    </section>
                </div>
            </main>
        </div>
    );
};

export default App;