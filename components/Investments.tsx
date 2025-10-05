
import React, { useState, useMemo } from 'react';
// Fix: Import additional types required for props and logic.
import { Investment, InvestmentWithPerformance, Transaction } from '../types';
import { InvestmentOverview } from './InvestmentOverview';
import { InvestmentList } from './InvestmentList';
import { InvestmentModal } from './InvestmentModal';
import { InvestmentPerformanceChart } from './InvestmentPerformanceChart';
import { calculateInvestmentSummary } from '../utils/investmentCalculators';

interface InvestmentsProps {
    // Fix: Corrected prop types to use InvestmentWithPerformance and include transactions.
    investments: InvestmentWithPerformance[];
    transactions: Transaction[];
    onSaveInvestment: (investment: Omit<Investment, 'id'> | Investment) => void;
    onDeleteInvestment: (investmentId: string) => void;
}

// Fix: Updated component signature to accept transactions prop.
export const Investments: React.FC<InvestmentsProps> = ({ investments, transactions, onSaveInvestment, onDeleteInvestment }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [investmentToEdit, setInvestmentToEdit] = useState<Investment | null>(null);

    const summary = useMemo(() => calculateInvestmentSummary(investments, transactions), [investments, transactions]);
    
    const handleOpenAddModal = () => {
        setInvestmentToEdit(null);
        setIsModalOpen(true);
    };

    // Fix: Updated handler signature to match the onEdit prop of InvestmentList.
    const handleOpenEditModal = (investment: InvestmentWithPerformance) => {
        setInvestmentToEdit(investment);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Investment Portfolio</h2>
                <button onClick={handleOpenAddModal} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    Add Investment
                </button>
            </div>
            
            <InvestmentOverview summary={summary} />

            <div className="bg-gray-800 rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">Portfolio Performance</h3>
                <InvestmentPerformanceChart data={investments} />
            </div>

            <InvestmentList 
                investments={investments}
                onEdit={handleOpenEditModal}
                onDelete={onDeleteInvestment}
            />

            <InvestmentModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={onSaveInvestment}
                investmentToEdit={investmentToEdit}
            />
        </div>
    );
};
