import React from 'react';
import { Modal } from './Modal';
// Fix: Import DashboardWidgetSettings from types.ts to resolve module not found error.
import { DashboardWidgetSettings } from '../types';

interface CustomizeDashboardModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: DashboardWidgetSettings;
    onSettingsChange: (settings: DashboardWidgetSettings) => void;
}

const Toggle: React.FC<{ label: string; enabled: boolean; onChange: (enabled: boolean) => void }> = ({ label, enabled, onChange }) => (
    <div
        onClick={() => onChange(!enabled)}
        className="flex items-center justify-between p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
    >
        <span className="font-medium text-white">{label}</span>
        <div className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${enabled ? 'bg-green-500' : 'bg-gray-600'}`}>
            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${enabled ? 'translate-x-5' : ''}`}></div>
        </div>
    </div>
);


export const CustomizeDashboardModal: React.FC<CustomizeDashboardModalProps> = ({ isOpen, onClose, settings, onSettingsChange }) => {
    
    const handleToggle = (key: keyof DashboardWidgetSettings) => {
        onSettingsChange({
            ...settings,
            [key]: !settings[key]
        });
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h3 className="text-lg font-bold mb-4">Customize Dashboard</h3>
            <div className="space-y-3">
                <Toggle label="Summary Cards" enabled={settings.summaryCards} onChange={() => handleToggle('summaryCards')} />
                <Toggle label="Cash Flow Chart" enabled={settings.cashFlowChart} onChange={() => handleToggle('cashFlowChart')} />
                <Toggle label="Expense Breakdown Chart" enabled={settings.expenseChart} onChange={() => handleToggle('expenseChart')} />
                <Toggle label="Transactions List" enabled={settings.transactionsList} onChange={() => handleToggle('transactionsList')} />
                <Toggle label="AI Financial Advisor" enabled={settings.aiAdvisor} onChange={() => handleToggle('aiAdvisor')} />
            </div>
             <div className="flex justify-end mt-6">
                <button onClick={onClose} className="bg-green-600 text-white px-4 py-2 rounded-lg">Done</button>
            </div>
        </Modal>
    );
};