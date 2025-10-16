import React from 'react';
import { InsurancePolicy } from '../types.ts';

interface UpcomingPremiumsProps {
    policies: InsurancePolicy[];
}

const BellIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);


export const UpcomingPremiums: React.FC<UpcomingPremiumsProps> = ({ policies }) => {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    const upcoming = policies.filter(p => {
        const dueDate = new Date(p.premiumDueDate);
        return dueDate >= now && dueDate <= thirtyDaysFromNow;
    });

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });


    return (
        <div className="bg-gray-800 rounded-2xl shadow-lg p-6 h-full">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <BellIcon className="w-6 h-6 mr-2 text-yellow-400" />
                Upcoming Premiums
            </h3>
            {upcoming.length > 0 ? (
                <div className="space-y-3">
                    {upcoming.map(policy => (
                        <div key={policy.id} className="bg-gray-700/50 p-3 rounded-lg flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-white">{policy.policyName}</p>
                                <p className="text-sm text-gray-400">{policy.type}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-yellow-400">{formatCurrency(policy.premiumAmount)}</p>
                                <p className="text-sm text-gray-300">Due: {formatDate(policy.premiumDueDate)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-400 text-center py-4">No premiums due in the next 30 days.</p>
            )}
        </div>
    );
};