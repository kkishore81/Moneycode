import React from 'react';
import {
    DashboardIcon,
    BudgetIcon,
    GoalIcon,
    InvestmentIcon,
    InsuranceIcon,
    LoanIcon,
    RecurringIcon,
    CalculatorIcon,
    WillIcon,
    TrendIcon,
} from './icons/NavigationIcons.tsx';

export type View = 'dashboard' | 'budgets' | 'goals' | 'investments' | 'insurance' | 'loans' | 'recurring' | 'calculators' | 'will-creator' | 'trends';

interface NavItem {
    id: View;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
    { id: 'budgets', label: 'Budgets', icon: BudgetIcon },
    { id: 'trends', label: 'Trends', icon: TrendIcon },
    { id: 'goals', label: 'Goals', icon: GoalIcon },
    { id: 'investments', label: 'Investments', icon: InvestmentIcon },
    { id: 'insurance', label: 'Insurance', icon: InsuranceIcon },
    { id: 'loans', label: 'Loans', icon: LoanIcon },
    { id: 'recurring', label: 'Recurring', icon: RecurringIcon },
    { id: 'calculators', label: 'Calculators', icon: CalculatorIcon },
    { id: 'will-creator', label: 'Will Creator', icon: WillIcon },
];

interface NavbarProps {
    activeView: View;
    setActiveView: (view: View) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeView, setActiveView }) => {
    return (
        <>
            {/* Desktop Sidebar (visible on lg screens and up) */}
            <nav className="hidden lg:block bg-gray-800 rounded-2xl p-4 shadow-lg">
                <div className="grid grid-cols-2 gap-3">
                    {navItems.map(item => {
                        const IconComponent = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveView(item.id)}
                                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl text-center transition-all duration-200 font-semibold aspect-square ${
                                    activeView === item.id 
                                    ? 'bg-green-600 text-white shadow-lg shadow-green-600/30 scale-105' 
                                    : 'bg-gray-900/50 text-gray-300 hover:bg-gray-700 hover:text-white'
                                }`}
                            >
                                <IconComponent className="w-8 h-8" />
                                <span className="text-sm">{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            </nav>

            {/* Mobile Bottom Tab Bar (visible on screens smaller than lg) */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 z-50">
                <div className="flex justify-around items-center h-16 overflow-x-auto">
                    {navItems.map(item => {
                        const IconComponent = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveView(item.id)}
                                className={`flex-shrink-0 flex flex-col items-center justify-center text-center transition-colors duration-200 p-2 w-20 h-full ${
                                    activeView === item.id ? 'text-green-400' : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                <IconComponent className="w-6 h-6" />
                                <span className="text-xs mt-1">{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            </nav>
        </>
    );
};