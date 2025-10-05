import React from 'react';
import { OtherAsset } from '../types';

interface OtherAssetsListProps {
    assets: OtherAsset[];
    onAdd: () => void;
    onEdit: (asset: OtherAsset) => void;
    onDelete: (assetId: string) => void;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);

const PlusIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);

export const OtherAssetsList: React.FC<OtherAssetsListProps> = ({ assets, onAdd, onEdit, onDelete }) => {
    return (
        <div className="bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Other Assets</h3>
                <button 
                    onClick={onAdd}
                    className="flex items-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    <PlusIcon />
                    Add Asset
                </button>
            </div>
            {assets.length > 0 ? (
                <div className="divide-y divide-gray-700">
                    {assets.map(asset => (
                        <div key={asset.id} className="group flex items-center justify-between py-3">
                            <p className="font-semibold text-white">{asset.name}</p>
                            <div className="flex items-center gap-4">
                                <p className="font-bold text-lg text-gray-200">{formatCurrency(asset.value)}</p>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                                    <button onClick={() => onEdit(asset)} className="p-1 text-gray-400 hover:text-white">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>
                                    </button>
                                    <button onClick={() => onDelete(asset.id)} className="p-1 text-gray-400 hover:text-red-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-400 text-center py-8">Add other assets like your bank balance, property, or gold to get a complete net worth calculation.</p>
            )}
        </div>
    );
};
