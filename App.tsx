import React, { useState, useMemo, useEffect } from 'react';
import { Navbar, View } from './components/Navbar.tsx';
import { Header } from './components/Header.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { Budget } from './components/Budget.tsx';
import { Goals } from './components/Goals.tsx';
import { Investments } from './components/Investments.tsx';
import { Insurance } from './components/Insurance.tsx';
import { Loans } from './components/Loans.tsx';
import { Recurring } from './components/Recurring.tsx';
import { Calculators } from './components/Calculators.tsx';
import { WillCreator } from './components/WillCreator.tsx';
import { Trends } from './components/Trends.tsx';
import Auth from './Auth.tsx';
import { supabaseService } from './services/supabaseService.ts';
import { supabaseAuthService } from './services/supabaseAuthService.ts';
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
    RecurringTransaction,
    Frequency,
} from './types.ts';
import { calculateFdValue, calculateRdValue } from './utils/investmentCalculators.ts';
import { calculateXIRR } from './utils/xirr.ts';

interface User {
    id: string;
    email?: string;
}

const App: React.FC = () => {
    // --- AUTHENTICATION STATE ---
    const [user, setUser] = useState<User | null>(null);
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
    const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);

    useEffect(() => {
        const initializeAuth = async () => {
            const { unsubscribe } = supabaseAuthService.onAuthStateChange(async (event, session) => {
                if (session?.user) {
                    const userData: User = { id: session.user.id, email: session.user.email };
                    setUser(userData);

                    const data = await supabaseService.getUserData(session.user.id);
                    setTransactions(data.transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
                    setInvestments(data.investments);
                    setGoals(data.goals);
                    setLoans(data.loans);
                    setInsurancePolicies(data.insurancePolicies);
                    setOtherAssets(data.otherAssets);
                    setBudgets(data.budgets);
                    setRecurringTransactions(data.recurringTransactions);
                } else {
                    setUser(null);
                }
                setIsLoadingAuth(false);
            });

            return () => unsubscribe();
        };

        initializeAuth();
    }, []);
    
    // Client-side simulation of recurring transaction generation
    useEffect(() => {
        if (!user || recurringTransactions.length === 0) return;

        const processRecurringTransactions = async () => {
            const today = new Date();
            const newTransactions: Omit<Transaction, 'id'>[] = [];
            const updatedRecurring: RecurringTransaction[] = [];

            recurringTransactions.forEach(rt => {
                let nextDueDate = new Date(rt.nextDueDate);
                let updatedNextDate = new Date(rt.nextDueDate);
                let hasChanges = false;

                // Process all overdue transactions, capped at 12 to prevent infinite loops on old items
                for (let i = 0; i < 12 && nextDueDate < today; i++) {
                    newTransactions.push({
                        date: nextDueDate.toISOString(),
                        amount: rt.amount,
                        description: rt.name,
                        type: rt.type,
                        category: rt.category,
                        recurringTransactionId: rt.id,
                    });
                    
                    if (rt.frequency === Frequency.MONTHLY) nextDueDate.setMonth(nextDueDate.getMonth() + 1);
                    else if (rt.frequency === Frequency.QUARTERLY) nextDueDate.setMonth(nextDueDate.getMonth() + 3);
                    else if (rt.frequency === Frequency.YEARLY) nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
                    
                    updatedNextDate = new Date(nextDueDate.getTime());
                    hasChanges = true;
                }
                
                if (hasChanges) {
                    updatedRecurring.push({ ...rt, nextDueDate: updatedNextDate.toISOString() });
                }
            });
            
            if (newTransactions.length > 0) {
                console.log(`Generating ${newTransactions.length} recurring transactions.`);
                const tempNewTransactions: Transaction[] = newTransactions.map((t, i) => ({ ...t, id: `temp-recurring-${i}-${Date.now()}` }));
                setTransactions(prev => [...prev, ...tempNewTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
                setRecurringTransactions(prev => prev.map(orig => updatedRecurring.find(upd => upd.id === orig.id) || orig));

                const savePromises = newTransactions.map(t => supabaseService.saveTransaction(user.id, t));
                const updatePromises = updatedRecurring.map(rt => supabaseService.saveRecurringTransaction(user.id, rt));
                await Promise.all([...savePromises, ...updatePromises]);
            }
        };

        const timer = setTimeout(processRecurringTransactions, 2000); 
        return () => clearTimeout(timer);
    }, [user]);


    const handleLogout = async () => {
        await supabaseAuthService.signOut();
        setUser(null);
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
            if (currentValue > 0) { cashFlows.push({ value: currentValue, date: new Date() }); }
            cashFlows.sort((a, b) => a.date.getTime() - b.date.getTime());
            const xirr = cashFlows.length > 1 ? calculateXIRR(cashFlows.map(cf => cf.value), cashFlows.map(cf => cf.date)) : 0;
            return { ...inv, currentValue, totalInvested, pnl, xirr: isNaN(xirr) ? 0 : xirr };
        });
    }, [investments, transactions]);
    
    useEffect(() => {
        setGoals(prevGoals => prevGoals.map(goal => {
            const linkedInvestmentsValue = investmentsWithPerformance
                .filter(inv => inv.goalId === goal.id)
                .reduce((sum, inv) => sum + inv.currentValue, 0);
            return { ...goal, currentAmount: linkedInvestmentsValue };
        }));
    }, [investmentsWithPerformance]);
    
    // --- Helper function for optimistic UI updates ---
    const optimisticUpdate = <T extends {id: string}>(
        setter: React.Dispatch<React.SetStateAction<T[]>>, item: Omit<T, 'id'> | T
    ) => {
        if ('id' in item) {
             setter(prev => prev.map(i => i.id === item.id ? item : i));
        } else {
             const tempId = `temp-${Date.now()}`;
             setter(prev => [{ ...item, id: tempId } as T, ...prev]);
        }
    };

    const handleSaveTransaction = async (transaction: Omit<Transaction, 'id'> | Transaction) => {
        if (!user) return;
        optimisticUpdate(setTransactions, transaction);
        await supabaseService.saveTransaction(user.id, transaction);
    };
    const handleDeleteTransaction = (id: string) => {
        if (!user) return;
        setTransactions(prev => prev.filter(t => t.id !== id));
        supabaseService.deleteTransaction(user.id, id);
    };

    const handleSaveInvestment = async (investment: Omit<Investment, 'id'> | Investment) => {
        if (!user) return;
        optimisticUpdate(setInvestments, investment);
        const savedId = await supabaseService.saveInvestment(user.id, investment);
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
        supabaseService.deleteInvestment(user.id, id);
        transactions.filter(t => t.investmentId === id).forEach(t => handleDeleteTransaction(t.id));
    };

    const handleSaveAsset = (asset: Omit<OtherAsset, 'id'> | OtherAsset) => {
        if (!user) return;
        optimisticUpdate(setOtherAssets, asset);
        supabaseService.saveAsset(user.id, asset);
    }
    const handleDeleteAsset = (id: string) => {
        if (!user) return;
        setOtherAssets(prev => prev.filter(a => a.id !== id));
        supabaseService.deleteAsset(user.id, id);
    }
    const handleSetBudget = (category: TransactionCategory, amount: number) => {
        if (!user) return;
        const newBudgets = { ...budgets, [category]: amount };
        setBudgets(newBudgets);
        supabaseService.saveBudget(user.id, newBudgets);
    };
    const handleResetBudgets = () => {
        if (!user) return;
        setBudgets({});
        supabaseService.saveBudget(user.id, {});
    };
    const handleSaveGoal = (goal: Omit<Goal, 'id' | 'currentAmount'> | Goal) => {
        if (!user) return;
        optimisticUpdate(setGoals, goal as Goal);
        supabaseService.saveGoal(user.id, goal);
    }
    const handleDeleteGoal = (id: string) => {
        if (!user) return;
        setGoals(prev => prev.filter(g => g.id !== id));
        supabaseService.deleteGoal(user.id, id);
    }
    const handleSavePolicy = (policy: Omit<InsurancePolicy, 'id'> | InsurancePolicy) => {
        if (!user) return;
        optimisticUpdate(setInsurancePolicies, policy);
        supabaseService.savePolicy(user.id, policy);
    }
    const handleDeletePolicy = (id: string) => {
        if (!user) return;
        setInsurancePolicies(prev => prev.filter(p => p.id !== id));
        supabaseService.deletePolicy(user.id, id);
    }
    const handleSaveLoan = (loan: Omit<Loan, 'id'> | Loan) => {
        if (!user) return;
        optimisticUpdate(setLoans, loan);
        supabaseService.saveLoan(user.id, loan);
    }
    const handleDeleteLoan = (id: string) => {
        if (!user) return;
        setLoans(prev => prev.filter(l => l.id !== id));
        supabaseService.deleteLoan(user.id, id);
    }
    const handleSaveRecurringTransaction = (recurring: Omit<RecurringTransaction, 'id'> | RecurringTransaction) => {
        if (!user) return;
        optimisticUpdate(setRecurringTransactions, recurring);
        supabaseService.saveRecurringTransaction(user.id, recurring);
    }
    const handleDeleteRecurringTransaction = (id: string) => {
        if (!user) return;
        setRecurringTransactions(prev => prev.filter(rt => rt.id !== id));
        supabaseService.deleteRecurringTransaction(user.id, id);
    }

    const renderView = () => {
        switch (activeView) {
            case 'dashboard': return <Dashboard transactions={transactions} investments={investmentsWithPerformance} loans={loans} otherAssets={otherAssets} onSaveAsset={handleSaveAsset} onDeleteAsset={handleDeleteAsset} onAddTransaction={handleSaveTransaction} onUpdateTransaction={handleSaveTransaction} onDeleteTransaction={handleDeleteTransaction}/>;
            case 'budgets': return <Budget transactions={transactions} budgets={budgets} onSetBudget={handleSetBudget} onResetBudgets={handleResetBudgets} onAddTransaction={handleSaveTransaction} />;
            case 'goals': return <Goals goals={goals} onAddGoal={handleSaveGoal} onUpdateGoal={handleSaveGoal as any} onDeleteGoal={handleDeleteGoal} />;
            case 'investments': return <Investments investments={investmentsWithPerformance} transactions={transactions} goals={goals} onSaveInvestment={handleSaveInvestment} onDeleteInvestment={handleDeleteInvestment} />;
            case 'insurance': return <Insurance policies={insurancePolicies} onAddPolicy={handleSavePolicy as any} onUpdatePolicy={handleSavePolicy} onDeletePolicy={handleDeletePolicy} />;
            case 'loans': return <Loans loans={loans} onSaveLoan={handleSaveLoan} onDeleteLoan={handleDeleteLoan} />;
            case 'recurring': return <Recurring recurringTransactions={recurringTransactions} onSave={handleSaveRecurringTransaction} onDelete={handleDeleteRecurringTransaction} />;
            case 'trends': return <Trends transactions={transactions} investments={investmentsWithPerformance} loans={loans} otherAssets={otherAssets} />;
            case 'calculators': return <Calculators />;
            case 'will-creator': return <WillCreator />;
            default: return <Dashboard transactions={transactions} investments={investmentsWithPerformance} loans={loans} otherAssets={otherAssets} onSaveAsset={handleSaveAsset} onDeleteAsset={handleDeleteAsset} onAddTransaction={handleSaveTransaction} onUpdateTransaction={handleSaveTransaction} onDeleteTransaction={handleDeleteTransaction}/>;
        }
    };
    
    if (isLoadingAuth) {
        return <div className="bg-gray-900 min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-400"></div></div>;
    }
    if (!user) {
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