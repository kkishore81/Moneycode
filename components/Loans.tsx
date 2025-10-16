import React, { useState } from 'react';
import { Loan } from '../types.ts';
import { LoanForeclosureSimulator } from './LoanForeclosureSimulator.tsx';
import { LoanList } from './LoanList.tsx';
import { LoanModal } from './LoanModal.tsx';
import { LoanDetailModal } from './LoanDetailModal.tsx';
import { Modal } from './Modal.tsx';

interface LoansProps {
    loans: Loan[];
    onSaveLoan: (loan: Omit<Loan, 'id'> | Loan) => void;
    onDeleteLoan: (loanId: string) => void;
}

export const Loans: React.FC<LoansProps> = ({ loans, onSaveLoan, onDeleteLoan }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loanToEdit, setLoanToEdit] = useState<Loan | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [selectedLoanForDetail, setSelectedLoanForDetail] = useState<Loan | null>(null);

    const handleOpenAddModal = () => {
        setLoanToEdit(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (loan: Loan) => {
        setLoanToEdit(loan);
        setIsModalOpen(true);
    };
    
    const handleViewDetails = (loan: Loan) => {
        setSelectedLoanForDetail(loan);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setLoanToEdit(null);
    };

    const handleSave = (loanData: Omit<Loan, 'id'> | Loan) => {
        onSaveLoan(loanData);
        handleCloseModal();
    };
    
    const handleDelete = () => {
        if(deleteConfirmId) {
            onDeleteLoan(deleteConfirmId);
            setDeleteConfirmId(null);
        }
    };
    
    const handleMarkAsPaid = (loanId: string) => {
        const loanToUpdate = loans.find(l => l.id === loanId);
        if (loanToUpdate) {
            onSaveLoan({ ...loanToUpdate, status: 'Paid Off', outstandingAmount: 0 });
            setSelectedLoanForDetail(null); // Close the detail modal
        }
    };

    return (
        <div className="space-y-8">
             <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Loan Manager</h2>
                 <button 
                    onClick={handleOpenAddModal}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    Add Loan
                </button>
            </div>
            
            <LoanForeclosureSimulator />
            
            <LoanList 
                loans={loans}
                onEdit={handleOpenEditModal}
                onDelete={(id) => setDeleteConfirmId(id)}
                onViewDetails={handleViewDetails}
                onAdd={handleOpenAddModal}
            />

            <LoanModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSave}
                loanToEdit={loanToEdit}
            />
            
            <LoanDetailModal
                loan={selectedLoanForDetail}
                onClose={() => setSelectedLoanForDetail(null)}
                onMarkAsPaid={handleMarkAsPaid}
            />

             <Modal isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)}>
                 <h3 className="text-lg font-bold mb-2">Confirm Deletion</h3>
                 <p className="text-gray-400 mb-4">Are you sure you want to delete this loan? This action cannot be undone.</p>
                 <div className="flex justify-end space-x-2">
                    <button onClick={() => setDeleteConfirmId(null)} className="bg-gray-600 text-white px-4 py-2 rounded-lg">Cancel</button>
                    <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded-lg">Delete</button>
                </div>
            </Modal>
        </div>
    );
};