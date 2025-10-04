import React, { useState } from 'react';
import { FinancialDocument } from '../types';
import { Modal } from './Modal';
import { DocumentModal } from './DocumentModal';

interface VaultProps {
    documents: FinancialDocument[];
    onSave: (doc: Omit<FinancialDocument, 'id'> | FinancialDocument) => void;
    onDelete: (docId: string) => void;
}

const FileIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0011.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
);


export const Vault: React.FC<VaultProps> = ({ documents, onSave, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [docToEdit, setDocToEdit] = useState<FinancialDocument | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    const handleOpenAdd = () => {
        setDocToEdit(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (doc: FinancialDocument) => {
        setDocToEdit(doc);
        setIsModalOpen(true);
    };
    
    const handleSaveAndClose = (doc: Omit<FinancialDocument, 'id'> | FinancialDocument) => {
        onSave(doc);
        setIsModalOpen(false);
    };

    const handleDelete = () => {
        if (deleteConfirmId) {
            onDelete(deleteConfirmId);
            setDeleteConfirmId(null);
        }
    };

    return (
        <div className="bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Document Vault</h2>
                <button 
                    onClick={handleOpenAdd}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    Add Document
                </button>
            </div>

            {documents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {documents.map(doc => (
                        <div key={doc.id} className="group relative bg-gray-700/50 rounded-lg p-4 flex flex-col items-center justify-center text-center aspect-square">
                            <FileIcon className="w-16 h-16 text-cyan-400 mb-2" />
                            <p className="font-semibold text-white text-sm break-all">{doc.name}</p>
                            <p className="text-xs text-gray-400">{new Date(doc.uploadDate).toLocaleDateString('en-IN')}</p>
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                                <button onClick={() => handleOpenEdit(doc)} className="p-2 bg-gray-600 rounded-full hover:bg-gray-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg></button>
                                <button onClick={() => setDeleteConfirmId(doc.id)} className="p-2 bg-red-800 rounded-full hover:bg-red-700"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-400 text-center py-16">Your vault is empty. Add a document to get started.</p>
            )}

            <DocumentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveAndClose}
                documentToEdit={docToEdit}
            />

            <Modal isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)}>
                 <h3 className="text-lg font-bold mb-2">Confirm Deletion</h3>
                 <p className="text-gray-400 mb-4">Are you sure you want to delete this document entry? This cannot be undone.</p>
                 <div className="flex justify-end space-x-2">
                    <button onClick={() => setDeleteConfirmId(null)} className="bg-gray-600 text-white px-4 py-2 rounded-lg">Cancel</button>
                    <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded-lg">Delete</button>
                </div>
            </Modal>
        </div>
    );
};
