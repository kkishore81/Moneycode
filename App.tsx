import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { Navbar, View } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { Budget } from './components/Budget';
import { Goals } from './components/Goals';
import { Investments } from './components/Investments';
import { Insurance } from './components/Insurance';
import { Calculators } from './components/Calculators';
import { WillCreator } from './components/WillCreator';
import { Loans } from './components/Loans';
import { Auth } from './components/Auth';
import { Budgets, Goal, InsurancePolicy, TransactionCategory, InsuranceType, Loan, LoanType, Transaction, TransactionType, FinancialSummary } from './types';

// Mock Data generation
const generateMockTransactions = (): Transaction[] => {
  const transactions: Transaction[] = [];
  const today = new Date();
  
  // Salary
  transactions.push({
    id: 't1',
    date: new Date(today.getFullYear(), today.getMonth(), 1).toISOString(),
    description: 'Monthly Salary',
    amount: 75000,
    type: TransactionType.INCOME,
    category: TransactionCategory.SALARY
  });

  // Expenses
  const expenses = [
    { desc: 'Grocery Store', cat: TransactionCategory.FOOD, amt: 5500, day: 2 },
    { desc: 'Petrol', cat: TransactionCategory.TRANSPORT, amt: 3000, day: 3 },
    { desc: 'Online Shopping', cat: TransactionCategory.SHOPPING, amt: 8250, day: 4 },
  ];
  
  expenses.forEach((exp, index) => {
    transactions.push({
      id: `t-exp-${index + 1}`,
      date: new Date(today.getFullYear(), today.getMonth(), exp.day).toISOString(),
      description: exp.desc,
      amount: exp.amt,
      type: TransactionType.EXPENSE,
      category: exp.cat,
    });
  });

  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};


// Mock Data for other features
const mockGoals: Goal[] = [
    { id: 'g1', name: 'Vacation to Europe', targetAmount: 200000, currentAmount: 75000, deadline: new Date('2025-06-01').toISOString() },
    { id: 'g2', name: 'Downpayment for Car', targetAmount: 300000, currentAmount: 180000, deadline: new Date('2024-12-31').toISOString() },
];
const mockBudgets: Budgets = {
    [TransactionCategory.FOOD]: 15000,
    [TransactionCategory.SHOPPING]: 10000,
};
const mockPolicies: InsurancePolicy[] = [
    { id: 'p1', policyName: 'LIC Jeevan Anand', type: InsuranceType.LIFE, sumAssured: 1000000, premiumAmount: 25000, premiumDueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 28).toISOString(), issueDate: new Date('2020-05-10').toISOString(), expiryDate: new Date('2040-05-09').toISOString() },
];
const mockLoans: Loan[] = [
    { id: 'l1', name: 'HDFC Home Loan', type: LoanType.HOME, principal: 5000000, outstandingAmount: 4200000, interestRate: 8.5, tenure: 20, emi: 43391, startDate: new Date('2021-08-15').toISOString(), assetCurrentValue: 6500000 },
];

export interface DashboardWidgetSettings {
    summaryCards: boolean;
    cashFlowChart: boolean;
    expenseChart: boolean;
    transactionsList: boolean;
    aiAdvisor: boolean;
}

const App: React.FC = () => {
    const [activeView, setActiveView] = useState<View>('dashboard');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    
    // States for features
    const [transactions, setTransactions] = useState<Transaction[]>(generateMockTransactions());
    const [budgets, setBudgets] = useState<Budgets>(mockBudgets);
    const [goals, setGoals] = useState<Goal[]>(mockGoals);
    const [policies, setPolicies] = useState<InsurancePolicy[]>(mockPolicies);
    const [loans, setLoans] = useState<Loan[]>(mockLoans);
    const [dashboardWidgets, setDashboardWidgets] = useState<DashboardWidgetSettings>({
        summaryCards: true,
        cashFlowChart: true,
        expenseChart: true,
        transactionsList: true,
        aiAdvisor: true,
    });

    // Derived state for financial summary
    const summary = useMemo<FinancialSummary>(() => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const monthlyIncome = transactions
            .filter(t => {
                const tDate = new Date(t.date);
                return t.type === TransactionType.INCOME && tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
            })
            .reduce((sum, t) => sum + t.amount, 0);

        const monthlyExpenses = transactions
            .filter(t => {
                const tDate = new Date(t.date);
                return t.type === TransactionType.EXPENSE && tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
            })
            .reduce((sum, t) => sum + t.amount, 0);

        const totalBalance = transactions.reduce((acc, t) => acc + (t.type === TransactionType.INCOME ? t.amount : -t.amount), 0);

        return { totalBalance, monthlyIncome, monthlyExpenses };
    }, [transactions]);


    // --- Auth Handlers ---
    const handleLogin = (email: string, pass: string) => setIsAuthenticated(true);
    const handleSignup = (email: string, pass: string) => setIsAuthenticated(true);
    const handleGoogleLogin = () => setIsAuthenticated(true);
    const handleLogout = () => setIsAuthenticated(false);

    // --- Transaction Handlers ---
    const handleSaveTransaction = (transactionData: Omit<Transaction, 'id'> | Transaction) => {
         if ('id' in transactionData) {
            setTransactions(prev => prev.map(t => t.id === transactionData.id ? transactionData : t));
        } else {
            const newTransaction = { ...transactionData, id: `t${Date.now()}` };
            setTransactions(prev => [...prev, newTransaction].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        }
    };
     const handleDeleteTransaction = (transactionId: string) => {
        setTransactions(prev => prev.filter(t => t.id !== transactionId));
    };


    // --- Other Feature Handlers ---
    const handleSetBudget = (category: TransactionCategory, amount: number) => setBudgets(prev => ({ ...prev, [category]: amount }));
    const handleResetBudgets = () => setBudgets({});
    const handleAddGoal = (goal: Omit<Goal, 'id'>) => setGoals(prev => [...prev, { ...goal, id: `g${Date.now()}` }]);
    const handleUpdateGoal = (updatedGoal: Goal) => setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
    const handleDeleteGoal = (goalId: string) => setGoals(prev => prev.filter(g => g.id !== goalId));
    const handleAddPolicy = (policy: Omit<InsurancePolicy, 'id'>) => setPolicies(prev => [...prev, { ...policy, id: `p${Date.now()}` }]);
    const handleUpdatePolicy = (updatedPolicy: InsurancePolicy) => setPolicies(prev => prev.map(p => p.id === updatedPolicy.id ? updatedPolicy : p));
    const handleDeletePolicy = (policyId: string) => setPolicies(prev => prev.filter(p => p.id !== policyId));
    const handleSaveLoan = (loanData: Omit<Loan, 'id'> | Loan) => {
        if ('id' in loanData) setLoans(prev => prev.map(l => l.id === loanData.id ? loanData : l));
        else setLoans(prev => [...prev, { ...loanData, id: `l${Date.now()}` }]);
    };
    const handleDeleteLoan = (loanId: string) => setLoans(prev => prev.filter(l => l.id !== loanId));


    const renderContent = () => {
        switch (activeView) {
            case 'dashboard':
                return <Dashboard 
                    transactions={transactions} 
                    summary={summary}
                    onSaveTransaction={handleSaveTransaction}
                    onDeleteTransaction={handleDeleteTransaction}
                    widgetSettings={dashboardWidgets}
                    onWidgetSettingsChange={setDashboardWidgets}
                />;
            case 'budgets':
                return <Budget transactions={transactions} budgets={budgets} onSetBudget={handleSetBudget} onResetBudgets={handleResetBudgets} />;
            case 'goals':
                return <Goals goals={goals} onAddGoal={handleAddGoal} onUpdateGoal={handleUpdateGoal} onDeleteGoal={handleDeleteGoal} />;
            case 'investments':
                return <Investments />;
            case 'insurance':
                return <Insurance policies={policies} onAddPolicy={handleAddPolicy} onUpdatePolicy={handleUpdatePolicy} onDeletePolicy={handleDeletePolicy} />;
            case 'loans':
                return <Loans loans={loans} onSaveLoan={handleSaveLoan} onDeleteLoan={handleDeleteLoan} />;
            case 'calculators':
                return <Calculators />;
            case 'will-creator':
                return <WillCreator />;
            default:
                return <Dashboard 
                    transactions={transactions} 
                    summary={summary}
                    onSaveTransaction={handleSaveTransaction}
                    onDeleteTransaction={handleDeleteTransaction}
                    widgetSettings={dashboardWidgets}
                    onWidgetSettingsChange={setDashboardWidgets}
                />;
        }
    };
    
    if (!isAuthenticated) {
        return <Auth onLogin={handleLogin} onSignup={handleSignup} onGoogleLogin={handleGoogleLogin} />;
    }

    return (
        <div className="bg-gray-900 text-gray-100 min-h-screen">
            <Header onLogout={handleLogout} />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-3">
                        <Navbar activeView={activeView} setActiveView={setActiveView} />
                    </div>
                    <main className="lg:col-span-9">
                        {renderContent()}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default App;