import React from 'react';
import { InsurancePolicy } from '../types';

interface InsuranceListProps {
    policies: InsurancePolicy[];
    onEdit: (policy: InsurancePolicy) => void;
    onDelete: (policyId: string) => void;
}

export const InsuranceList: React.FC<InsuranceListProps> = ({ policies, onEdit, onDelete }) => {

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-IN');

    return (
        <div className="bg-gray-800 rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Your Policies</h3>
            {policies.length > 0 ? (
                <div className="space-y-4">
                    {policies.map(policy => (
                        <div key={policy.id} className="p-4 bg-gray-700/50 rounded-lg">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <p className="font-bold text-white text-lg">{policy.policyName}</p>
                                    <p className="text-sm text-cyan-400 font-semibold">{policy.type}</p>
                                </div>
                                <div className="flex space-x-2 flex-shrink-0">
                                    <button onClick={() => onEdit(policy)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-3 rounded-lg text-sm">Edit</button>
                                    <button onClick={() => onDelete(policy.id)} className="bg-red-800 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-lg text-sm">Delete</button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-400">Sum Assured</p>
                                    <p className="font-semibold text-white">{formatCurrency(policy.sumAssured)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">Premium</p>
                                    <p className="font-semibold text-white">{formatCurrency(policy.premiumAmount)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">Due Date</p>
                                    <p className="font-semibold text-white">{formatDate(policy.premiumDueDate)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">Expires On</p>
                                    <p className="font-semibold text-white">{formatDate(policy.expiryDate)}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                 <p className="text-gray-400 text-center py-8">No insurance policies added yet.</p>
            )}
        </div>
    );
};