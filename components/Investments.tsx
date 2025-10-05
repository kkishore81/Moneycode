
import React, { useState, useMemo, useRef } from 'react';
import { Investment, InvestmentWithPerformance, Transaction, RiskProfile } from '../types';
import { InvestmentOverview } from './InvestmentOverview';
import { InvestmentList } from './InvestmentList';
import { InvestmentModal } from './InvestmentModal';
import { InvestmentPerformanceChart } from './InvestmentPerformanceChart';
import { calculateInvestmentSummary } from '../utils/investmentCalculators';
import { RiskProfilerModal } from './RiskProfilerModal';

interface InvestmentsProps {
    investments: InvestmentWithPerformance[];
    transactions: Transaction[];
    onSaveInvestment: (investment: Omit<Investment, 'id'> | Investment) => void;
    onDeleteInvestment: (investmentId: string) => void;
}

const ProfileIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

export const Investments: React.FC<InvestmentsProps> = ({ investments, transactions, onSaveInvestment, onDeleteInvestment }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [investmentToEdit, setInvestmentToEdit] = useState<Investment | null>(null);
    const [camsFile, setCamsFile] = useState<File | null>(null);
    const [camsPassword, setCamsPassword] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isProfilerOpen, setIsProfilerOpen] = useState(false);
    const [riskProfile, setRiskProfile] = useState<RiskProfile | null>(null);

    const summary = useMemo(() => calculateInvestmentSummary(investments, transactions), [investments, transactions]);
    
    const handleOpenAddModal = () => {
        setInvestmentToEdit(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (investment: InvestmentWithPerformance) => {
        setInvestmentToEdit(investment);
        setIsModalOpen(true);
    };
    
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setCamsFile(event.target.files[0]);
        }
    };

    const handleImportClick = () => {
        if (!camsFile || !camsPassword) {
            alert('Please select a file and enter the password.');
            return;
        }
        alert('Thank you! PDF parsing and import functionality will be implemented in a future update.');
        setCamsFile(null);
        setCamsPassword('');
    };

    const getProfileInfo = (profile: RiskProfile | null) => {
        if (!profile) return { color: 'text-gray-400', description: 'Complete the questionnaire to understand your investment style.'};
        switch (profile) {
            case 'Conservative': return { color: 'text-blue-400', description: 'You prioritize capital preservation with minimal risk.' };
            case 'Moderate': return { color: 'text-yellow-400', description: 'You seek a balance between growth and safety.' };
            case 'Aggressive': return { color: 'text-red-400', description: 'You are comfortable with high risk for high returns.' };
        }
    };

    const profileInfo = getProfileInfo(riskProfile);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Investment Portfolio</h2>
                <div className="flex items-center gap-2">
                     <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                        Import from CAMS/KFintech
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileSelect}
                        accept=".pdf"
                        className="hidden" 
                    />
                    <button onClick={handleOpenAddModal} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                        Add Investment
                    </button>
                </div>
            </div>

            {camsFile && (
                <div className="bg-gray-800 rounded-2xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Import Statement</h3>
                    <div className="flex items-end gap-4">
                        <div className="flex-grow">
                            <label className="block text-sm font-medium text-gray-300 mb-1">Selected File</label>
                            <p className="w-full bg-gray-700 text-gray-300 rounded-lg p-3">{camsFile.name}</p>
                        </div>
                         <div className="flex-grow">
                            <label htmlFor="camsPassword"  className="block text-sm font-medium text-gray-300 mb-1">Statement Password</label>
                            <input 
                                type="password"
                                id="camsPassword"
                                value={camsPassword}
                                onChange={(e) => setCamsPassword(e.target.value)}
                                placeholder="Enter PDF Password"
                                className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                            />
                             <p className="text-xs text-gray-500 mt-1">Usually your PAN in uppercase.</p>
                        </div>
                        <button onClick={handleImportClick} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors h-fit">
                            Import Now
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex items-start gap-4">
                             <ProfileIcon />
                             <div>
                                <h3 className="text-xl font-bold text-white">Your Risk Profile</h3>
                                 <p className={`text-2xl font-bold mt-1 ${profileInfo.color}`}>{riskProfile || 'Not Determined'}</p>
                            </div>
                        </div>
                        <p className="text-gray-400 mt-2">{profileInfo.description}</p>
                    </div>
                    <button onClick={() => setIsProfilerOpen(true)} className="mt-4 w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                        {riskProfile ? 'Retake Questionnaire' : 'Find Your Risk Profile'}
                    </button>
                </div>
                 <InvestmentOverview summary={summary} />
            </div>

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

            <RiskProfilerModal
                isOpen={isProfilerOpen}
                onClose={() => setIsProfilerOpen(false)}
                onComplete={(profile) => {
                    setRiskProfile(profile);
                    setIsProfilerOpen(false);
                }}
            />
        </div>
    );
};