import React, { useState, useEffect } from 'react';
import { FinancialDocument, DocumentType } from '../types';
import { Modal } from './Modal';

interface DocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (doc: Omit<FinancialDocument, 'id'> | FinancialDocument) => void;
    documentToEdit: FinancialDocument | null;
}

const initialFormState: Omit<FinancialDocument, 'id'> = {
    name: '',
    type: DocumentType.PDF,
    uploadDate: new Date().toISOString(),
};

export const DocumentModal: React.FC<DocumentModalProps> = ({ isOpen, onClose, onSave, documentToEdit }) => {
    const [formState, setFormState] = useState(initialFormState);

    useEffect(() => {
        if (documentToEdit) {
            setFormState(documentToEdit);
        } else {
            setFormState(initialFormState);
        }
    }, [documentToEdit, isOpen]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        if (!formState.name) {
            alert('Please enter a document name.');
            return;
        }

        onSave({
            ...formState,
            uploadDate: new Date().toISOString() // Update date on save
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h3 className="text-lg font-bold mb-4">{documentToEdit ? 'Edit' : 'Add'} Document</h3>
            <div className="space-y-4">
                 <input
                    type="text"
                    name="name"
                    value={formState.name}
                    onChange={handleInputChange}
                    placeholder="Document Name (e.g., Insurance Policy 2024)"
                    className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
                <select
                    name="type"
                    value={formState.type}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                >
                    {Object.values(DocumentType).map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
                <div className="text-sm text-gray-400 bg-gray-900/50 p-3 rounded-lg">
                    Note: This is a simulation. No file will be uploaded. This entry simply helps you track your physical or cloud-stored documents.
                </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
                <button onClick={onClose} className="bg-gray-600 text-white px-4 py-2 rounded-lg">Cancel</button>
                <button onClick={handleSubmit} className="bg-green-600 text-white px-4 py-2 rounded-lg">Save</button>
            </div>
        </Modal>
    );
};
