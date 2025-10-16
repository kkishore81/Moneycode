import React, { useState, useMemo, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { Navbar, View } from './components/Navbar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { Budget } from './components/Budget';
import { Goals } from './components/Goals';
import { Investments } from './components/Investments';
import { Insurance } from './components/Insurance';
import { Loans } from './components/Loans';
import { Calculators } from './components/Calculators';
import { WillCreator } from './components/WillCreator';
import Auth from './Auth';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { firestoreService } from './services/firestoreService';
import {
    Transaction,
    TransactionCategory,
    TransactionType,
    Budgets,
    Goal,
    InsurancePolicy,
    Loan,
    Investment,
    InvestmentWithPerformance,
    OtherAsset,
    InvestmentType,
} from './types';
import { calculateFdValue, calculateRdValue } from './utils/investmentCalculators';
import { calculateXIRR } from './utils/xirr';

const App: React.FC = () => {
    // --- AUTHENTICATION STATE ---
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);
    
    // --- MAIN APP STATE ---
    const [activeView, setActiveView] = useState<View>('dashboard');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [investments, setInvestments] = useState<Investment[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loans, setLoans] = useState<Loan[]>([]);
    const [insurancePolicies, setInsurancePolicies] = useState<InsurancePolicy[]>([]);
    const [budgets, setBudgets] = useState<Budgets>({});
    const [otherAssets, setOtherAssets] = useState<OtherAsset[]>([]);

    // Bypassed Firebase Auth for Preview Environment
    // This effect creates a mock user and loads empty data to allow the app to be previewed
    // without requiring a live Firebase connection.
    useEffect(() => {
        const loadMockSession = async () => {
            const mockUser: FirebaseUser = {
                uid: 'preview-user-123',
                email: 'preview@example.com',
                emailVerified: true,
                displayName: 'Preview User',
            } as FirebaseUser;

            setUser(mockUser);
            
            // Load initial (empty) data
            const data = await firestoreService.getUserData(mockUser.uid);
            setTransactions(data.transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            setInvestments(data.investments);
            setGoals(data.goals);
            setLoans(data.loans);
            setInsurancePolicies(data.insurancePolicies);
            setOtherAssets(data.otherAssets);
            setBudgets(data.budgets);

            setIsLoadingAuth(false);
        };

        loadMockSession();
    }, []);


    const handleLogout = () => {
        // In preview mode, logout can simply reset the state or reload the page
        setUser(null);
        window.location.reload();
    };

    // --- Derived State / Data Processing ---
    const investmentsWithPerformance = useMemo((): InvestmentWithPerformance[] => {
        return investments.map(inv => {
            const investmentTransactions = transactions.filter(
                t => t.category === TransactionCategory.INVESTMENT && t.investmentId === inv.id
            );

            let totalInvested = investmentTransactions.reduce((sum, t) => sum + t.amount, 0);

            let currentValue = inv.currentValue;
            if (inv.type === InvestmentType.FD && inv.startDate && inv.interestRate) {
                const principal = investmentTransactions.length > 0 ? investmentTransactions[0].amount : 0;
                currentValue = calculateFdValue(principal, inv.interestRate, inv.startDate);
            } else if (inv.type === InvestmentType.RECURRING_DEPOSIT && inv.startDate && inv.interestRate && inv.monthlyInvestment) {
                 currentValue = calculateRdValue(inv.monthlyInvestment, inv.interestRate, inv.startDate);
                 const start = new Date(inv.startDate);
                 const today = new Date();
                 const years = today.getFullYear() - start.getFullYear();
                 let n = years * 12 + (today.getMonth() - start.getMonth());
                 if (today.getDate() < start.getDate()) { n--; }
                 totalInvested = inv.monthlyInvestment * Math.max(0, n);
            }

            const pnl = currentValue - totalInvested;
            const cashFlows = investmentTransactions.map(t => ({ value: -t.amount, date: new Date(t.date) }));
            if (currentValue > 0) {
                cashFlows.push({ value: currentValue, date: new Date() });
            }
            cashFlows.sort((a, b) => a.date.getTime() - b.date.getTime());
            const xirr = cashFlows.length > 1 ? calculateXIRR(cashFlows.map(cf => cf.value), cashFlows.map(cf => cf.date)) : 0;

            return { ...inv, currentValue, totalInvested, pnl, xirr: isNaN(xirr) ? 0 : xirr };
        });
    }, [investments, transactions]);
    
    useEffect(() => {
        setGoals(prevGoals => {
            return prevGoals.map(goal => {
                const linkedInvestmentsValue = investmentsWithPerformance
                    .filter(inv => inv.goalId === goal.id)
                    .reduce((sum, inv) => sum + inv.currentValue, 0);
                return { ...goal, currentAmount: linkedInvestmentsValue };
            });
        });
    }, [investmentsWithPerformance]);
    
    // --- Helper function for optimistic UI updates ---
    const optimisticUpdate = <T extends {id: string}>(
        setter: React.Dispatch<React.SetStateAction<T[]>>,
        item: Omit<T, 'id'> | T
    ) => {
        if ('id' in item) {
             setter(prev => prev.map(i => i.id === item.id ? item : i));
        } else {
            // Create a temporary ID for the new item for the key
             const tempId = `temp-${Date.now()}`;
             setter(prev => [{ ...item, id: tempId } as T, ...prev]);
        }
    };


    // --- Firestore CRUD Handlers with Optimistic Updates ---
    const handleSaveTransaction = async (transaction: Omit<Transaction, 'id'> | Transaction) => {
        if (!user) return;
        optimisticUpdate(setTransactions, transaction);
        await firestoreService.saveTransaction(user.uid, transaction);
    };
    const handleDeleteTransaction = (id: string) => {
        if (!user) return;
        setTransactions(prev => prev.filter(t => t.id !== id));
        firestoreService.deleteTransaction(user.uid, id);
    };
    
    const handleSaveInvestment = async (investment: Omit<Investment, 'id'> | Investment) => {
        if (!user) return;
        optimisticUpdate(setInvestments, investment);
        const savedId = await firestoreService.saveInvestment(user.uid, investment);
        
        // Add initial transaction for new FDs
        if (!('id' in investment) && investment.type === InvestmentType.FD && investment.currentValue > 0) {
            handleSaveTransaction({
                date: investment.startDate || new Date().toISOString(), amount: investment.currentValue, description: `Initial Investment: ${investment.name}`,
                type: TransactionType.EXPENSE, category: TransactionCategory.INVESTMENT, investmentId: savedId,
            });
        }
    };
    const handleDeleteInvestment = (id: string) => {
        if (!user) return;
        setInvestments(prev => prev.filter(inv => inv.id !== id));
        firestoreService.deleteInvestment(user.uid, id);
        transactions.filter(t => t.investmentId === id).forEach(t => handleDeleteTransaction(t.id));
    };

    const handleSaveAsset = (asset: Omit<OtherAsset, 'id'> | OtherAsset) => {
        if (!user) return;
        optimisticUpdate(setOtherAssets, asset);
        firestoreService.saveAsset(user.uid, asset);
    }
    const handleDeleteAsset = (id: string) => {
        if (!user) return;
        setOtherAssets(prev => prev.filter(a => a.id !== id));
        firestoreService.deleteAsset(user.uid, id);
    }
    const handleSetBudget = (category: TransactionCategory, amount: number) => {
        if (!user) return;
        const newBudgets = { ...budgets, [category]: amount };
        setBudgets(newBudgets);
        firestoreService.saveBudget(user.uid, newBudgets);
    };
    const handleResetBudgets = () => {
        if (!user) return;
        setBudgets({});
        firestoreService.saveBudget(user.uid, {});
    };
    const handleSaveGoal = (goal: Omit<Goal, 'id' | 'currentAmount'> | Goal) => {
        if (!user) return;
        optimisticUpdate(setGoals, goal as Goal);
        firestoreService.saveGoal(user.uid, goal);
    }
    const handleDeleteGoal = (id: string) => {
        if (!user) return;
        setGoals(prev => prev.filter(g => g.id !== id));
        firestoreService.deleteGoal(user.uid, id);
    }
    const handleSavePolicy = (policy: Omit<InsurancePolicy, 'id'> | InsurancePolicy) => {
        if (!user) return;
        optimisticUpdate(setInsurancePolicies, policy);
        firestoreService.savePolicy(user.uid, policy);
    }
    const handleDeletePolicy = (id: string) => {
        if (!user) return;
        setInsurancePolicies(prev => prev.filter(p => p.id !== id));
        firestoreService.deletePolicy(user.uid, id);
    }
    const handleSaveLoan = (loan: Omit<Loan, 'id'> | Loan) => {
        if (!user) return;
        optimisticUpdate(setLoans, loan);
        firestoreService.saveLoan(user.uid, loan);
    }
    const handleDeleteLoan = (id: string) => {
        if (!user) return;
        setLoans(prev => prev.filter(l => l.id !== id));
        firestoreService.deleteLoan(user.uid, id);
    }


    const renderView = () => {
        switch (activeView) {
            case 'dashboard': return <Dashboard transactions={transactions} investments={investmentsWithPerformance} loans={loans} otherAssets={otherAssets} onSaveAsset={handleSaveAsset} onDeleteAsset={handleDeleteAsset} onAddTransaction={handleSaveTransaction} onUpdateTransaction={handleSaveTransaction} onDeleteTransaction={handleDeleteTransaction}/>;
            case 'budgets': return <Budget transactions={transactions} budgets={budgets} onSetBudget={handleSetBudget} onResetBudgets={handleResetBudgets} onAddTransaction={handleSaveTransaction} />;
            case 'goals': return <Goals goals={goals} onAddGoal={handleSaveGoal} onUpdateGoal={handleSaveGoal as any} onDeleteGoal={handleDeleteGoal} />;
            case 'investments': return <Investments investments={investmentsWithPerformance} transactions={transactions} goals={goals} onSaveInvestment={handleSaveInvestment} onDeleteInvestment={handleDeleteInvestment} />;
            case 'insurance': return <Insurance policies={insurancePolicies} onAddPolicy={handleSavePolicy as any} onUpdatePolicy={handleSavePolicy} onDeletePolicy={handleDeletePolicy} />;
            case 'loans': return <Loans loans={loans} onSaveLoan={handleSaveLoan} onDeleteLoan={handleDeleteLoan} />;
            case 'calculators': return <Calculators />;
            case 'will-creator': return <WillCreator />;
            default: return <Dashboard transactions={transactions} investments={investmentsWithPerformance} loans={loans} otherAssets={otherAssets} onSaveAsset={handleSaveAsset} onDeleteAsset={handleDeleteAsset} onAddTransaction={handleSaveTransaction} onUpdateTransaction={handleSaveTransaction} onDeleteTransaction={handleDeleteTransaction}/>;
        }
    };
    
    if (isLoadingAuth) {
        return (
            <div className="bg-gray-900 min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-400"></div>
            </div>
        );
    }

    if (!user) {
        // This view is now unlikely to be reached in preview mode but is kept as a fallback.
        // It would be used if the mock session fails or for a real auth implementation.
        return <Auth onGoogleSignIn={() => { alert("Google Sign-In is disabled in this preview. The app will load directly into the dashboard.")}} />;
    }

    return (
        <div className="bg-gray-900 text-gray-100 min-h-screen">
            <Header onLogout={handleLogout} />
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-1">
                        <Navbar activeView={activeView} setActiveView={setActiveView} />
                    </div>
                    <main className="lg:col-span-3 pb-20 lg:pb-0">
                        {renderView()}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default App;