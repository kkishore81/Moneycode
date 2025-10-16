import React, { useState, useMemo, useRef } from 'react';
import { Investment, InvestmentWithPerformance, Transaction, RiskProfile, InvestmentType, Goal } from '../types';
import { InvestmentOverview } from './InvestmentOverview';
import { InvestmentList } from './InvestmentList';
import { InvestmentModal } from './InvestmentModal';
import { InvestmentPerformanceChart } from './InvestmentPerformanceChart';
import { calculateInvestmentSummary } from '../utils/investmentCalculators';
import { RiskProfilerModal } from './RiskProfilerModal';

interface InvestmentsProps {
    investments: InvestmentWithPerformance[];
    transactions: Transaction[];
    goals: Goal[];
    onSaveInvestment: (investment: Omit<Investment, 'id'> | Investment) => void;
    onDeleteInvestment: (investmentId: string) => void;
}

const ProfileIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const DownloadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);


export const Investments: React.FC<InvestmentsProps> = ({ investments, transactions, goals, onSaveInvestment, onDeleteInvestment }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [investmentToEdit, setInvestmentToEdit] = useState<Investment | null>(null);
    const [camsFile, setCamsFile] = useState<File | null>(null);
    const [camsPassword, setCamsPassword] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isProfilerOpen, setIsProfilerOpen] = useState(false);
    const [riskProfile, setRiskProfile] = useState<RiskProfile | null>(null);
    const [filterType, setFilterType] = useState<InvestmentType | 'all'>('all');

    const summary = useMemo(() => calculateInvestmentSummary(investments, transactions), [investments, transactions]);
    
    const filteredInvestments = useMemo(() => {
        if (filterType === 'all') {
            return investments;
        }
        return investments.filter(inv => inv.type === filterType);
    }, [investments, filterType]);

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

    const handleDownloadReport = () => {
        const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

        const escapeCsvField = (field: any) => {
            const stringField = String(field);
            // If the field contains a comma, double quote, or newline, wrap it in double quotes.
            // Also, escape any existing double quotes by doubling them up.
            if (/[",\n]/.test(stringField)) {
                return `"${stringField.replace(/"/g, '""')}"`;
            }
            return stringField;
        };
        
        const summaryRows = [
            ['Portfolio Summary'],
            ['Metric', 'Value'],
            ['Total Invested', formatCurrency(summary.totalInvested)],
            ['Total Current Value', formatCurrency(summary.totalCurrentValue)],
            ['Overall P&L', formatCurrency(summary.overallGainLoss)],
            ['Portfolio XIRR', `${summary.xirr.toFixed(2)}%`],
        ];

        const investmentHeader = ['Name', 'Type', 'Total Invested', 'Current Value', 'P&L', 'XIRR (%)'];
        const investmentRows = investments.map(inv => [
            inv.name,
            inv.type,
            inv.totalInvested,
            inv.currentValue,
            inv.pnl,
            inv.xirr.toFixed(2)
        ]);

        const csvContent = [
            ...summaryRows.map(row => row.map(escapeCsvField).join(',')),
            '', // Empty line for spacing
            investmentHeader.map(escapeCsvField).join(','),
            ...investmentRows.map(row => row.map(escapeCsvField).join(','))
        ].join('\r\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        const today = new Date().toISOString().split('T')[0];
        link.setAttribute('download', `Investment_Performance_Report_${today}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
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
                     <button 
                        onClick={handleDownloadReport}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                        disabled={investments.length === 0}
                        title={investments.length === 0 ? "Add investments to generate a report" : "Download performance report"}
                    >
                        <DownloadIcon />
                        Download Report
                    </button>
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
                <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                    <h3 className="text-xl font-bold text-white">Portfolio Performance</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                        <button 
                            onClick={() => setFilterType('all')}
                            className={`px-3 py-1 text-sm font-semibold rounded-lg transition-colors ${filterType === 'all' ? 'bg-green-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
                        >
                            All
                        </button>
                        {Object.values(InvestmentType).map(type => (
                            <button 
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`px-3 py-1 text-sm font-semibold rounded-lg transition-colors ${filterType === type ? 'bg-green-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
                <InvestmentPerformanceChart data={filteredInvestments} />
            </div>

            <InvestmentList 
                investments={filteredInvestments}
                onEdit={handleOpenEditModal}
                onDelete={onDeleteInvestment}
            />

            <InvestmentModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={onSaveInvestment}
                investmentToEdit={investmentToEdit}
                goals={goals}
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