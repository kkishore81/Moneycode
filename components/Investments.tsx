import React, { useState } from 'react';
import { Investment, InvestmentType } from '../types';
import { InvestmentOverview } from './InvestmentOverview';
import { InvestmentList } from './InvestmentList';
import { InvestmentModal } from './InvestmentModal';
import { Modal } from './Modal';

const mockInvestments: Investment[] = [
    { 
        id: 'inv1', 
        name: 'Nifty 50 Index Fund', 
        type: InvestmentType.MUTUAL_FUNDS, 
        investedAmount: 150000, 
        currentValue: 185000, 
        purchaseDate: new Date('2022-01-15').toISOString(),
        valueHistory: [
            { date: '2023-01-01', value: 160000 },
            { date: '2023-04-01', value: 165000 },
            { date: '2023-07-01', value: 175000 },
            { date: '2023-10-01', value: 172000 },
            { date: '2024-01-01', value: 185000 },
        ]
    },
    { 
        id: 'inv2', 
        name: 'Tata Motors Stock', 
        type: InvestmentType.STOCKS, 
        investedAmount: 80000, 
        currentValue: 110000, 
        purchaseDate: new Date('2023-03-20').toISOString(),
        valueHistory: [
            { date: '2023-04-01', value: 82000 },
            { date: '2023-07-01', value: 95000 },
            { date: '2023-10-01', value: 98000 },
            { date: '2024-01-01', value: 110000 },
        ]
    },
    { id: 'inv3', name: 'Bitcoin', type: InvestmentType.CRYPTO, investedAmount: 50000, currentValue: 45000, purchaseDate: new Date('2023-11-01').toISOString() },
    { id: 'inv4', name: 'Bank of India FD', type: InvestmentType.FIXED_DEPOSIT, investedAmount: 200000, currentValue: 215000, purchaseDate: new Date('2023-01-01').toISOString(), interestRate: 7.5 },
    { id: 'inv5', name: 'Post Office RD', type: InvestmentType.RECURRING_DEPOSIT, investedAmount: 60000, currentValue: 63000, purchaseDate: new Date('2023-05-01').toISOString(), interestRate: 6.5 },
];

export const Investments: React.FC = () => {
    const [investments, setInvestments] = useState<Investment[]>(mockInvestments);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [investmentToEdit, setInvestmentToEdit] = useState<Investment | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    const handleOpenAddModal = () => {
        setInvestmentToEdit(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (investment: Investment) => {
        setInvestmentToEdit(investment);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setInvestmentToEdit(null);
    };
    
    const handleSaveInvestment = (investmentData: Omit<Investment, 'id'> | Investment) => {
        if ('id' in investmentData) {
            // Update
            setInvestments(prev => prev.map(inv => inv.id === investmentData.id ? investmentData : inv));
        } else {
            // Add
            const newInvestment = { ...investmentData, id: `inv${Date.now()}`};
            setInvestments(prev => [...prev, newInvestment]);
        }
        handleCloseModal();
    };
    
    const handleDeleteInvestment = (id: string) => {
        setInvestments(prev => prev.filter(inv => inv.id !== id));
        setDeleteConfirmId(null);
    };

    return (
        <div className="bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Investment Portfolio</h2>
                <button 
                    onClick={handleOpenAddModal}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    Add Investment
                </button>
            </div>

            <InvestmentOverview investments={investments} />
            <InvestmentList 
                investments={investments} 
                onEdit={handleOpenEditModal} 
                onDelete={(id) => setDeleteConfirmId(id)} 
            />

            <InvestmentModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveInvestment}
                investmentToEdit={investmentToEdit}
            />

            <Modal isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)}>
                 <h3 className="text-lg font-bold mb-2">Confirm Deletion</h3>
                 <p className="text-gray-400 mb-4">Are you sure you want to delete this investment? This action cannot be undone.</p>
                 <div className="flex justify-end space-x-2">
                    <button onClick={() => setDeleteConfirmId(null)} className="bg-gray-600 text-white px-4 py-2 rounded-lg">Cancel</button>
                    <button onClick={() => handleDeleteInvestment(deleteConfirmId!)} className="bg-red-600 text-white px-4 py-2 rounded-lg">Delete</button>
                </div>
            </Modal>
        </div>
    );
};