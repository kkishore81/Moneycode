import React, { useState } from 'react';
import { InsurancePolicy } from '../types.ts';
import { UpcomingPremiums } from './UpcomingPremiums.tsx';
import { HumanLifeValueCalculator } from './HumanLifeValueCalculator.tsx';
import { InsuranceList } from './InsuranceList.tsx';
import { InsuranceModal } from './InsuranceModal.tsx';
import { Modal } from './Modal.tsx';

interface InsuranceProps {
    policies: InsurancePolicy[];
    onAddPolicy: (policy: Omit<InsurancePolicy, 'id'>) => void;
    onUpdatePolicy: (policy: InsurancePolicy) => void;
    onDeletePolicy: (policyId: string) => void;
}

export const Insurance: React.FC<InsuranceProps> = ({ policies, onAddPolicy, onUpdatePolicy, onDeletePolicy }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [policyToEdit, setPolicyToEdit] = useState<InsurancePolicy | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    const handleOpenAddModal = () => {
        setPolicyToEdit(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (policy: InsurancePolicy) => {
        setPolicyToEdit(policy);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setPolicyToEdit(null);
    };

    const handleSavePolicy = (policyData: Omit<InsurancePolicy, 'id'> | InsurancePolicy) => {
        if ('id' in policyData) {
            onUpdatePolicy(policyData);
        } else {
            onAddPolicy(policyData);
        }
        handleCloseModal();
    };

    const handleDelete = () => {
        if (deleteConfirmId) {
            onDeletePolicy(deleteConfirmId);
            setDeleteConfirmId(null);
        }
    };


    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Insurance Manager</h2>
                 <button 
                    onClick={handleOpenAddModal}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    Add Insurance
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                     <UpcomingPremiums policies={policies} />
                </div>
                <div className="lg:col-span-2">
                     <HumanLifeValueCalculator />
                </div>
            </div>
            
            <InsuranceList 
                policies={policies}
                onEdit={handleOpenEditModal}
                onDelete={(id) => setDeleteConfirmId(id)}
                onAdd={handleOpenAddModal}
            />

            <InsuranceModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSavePolicy}
                policyToEdit={policyToEdit}
            />

             <Modal isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)}>
                 <h3 className="text-lg font-bold mb-2">Confirm Deletion</h3>
                 <p className="text-gray-400 mb-4">Are you sure you want to delete this policy? This action cannot be undone.</p>
                 <div className="flex justify-end space-x-2">
                    <button onClick={() => setDeleteConfirmId(null)} className="bg-gray-600 text-white px-4 py-2 rounded-lg">Cancel</button>
                    <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded-lg">Delete</button>
                </div>
            </Modal>
        </div>
    );
};