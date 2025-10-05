import React, { useState, useEffect } from 'react';
import { OtherAsset } from '../types';
import { Modal } from './Modal';

interface AssetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (asset: Omit<OtherAsset, 'id'> | OtherAsset) => void;
    assetToEdit: OtherAsset | null;
}

const initialFormState: Omit<OtherAsset, 'id'> = {
    name: '',
    value: 0,
};

export const AssetModal: React.FC<AssetModalProps> = ({ isOpen, onClose, onSave, assetToEdit }) => {
    const [formState, setFormState] = useState(initialFormState);

    useEffect(() => {
        if (assetToEdit) {
            setFormState(assetToEdit);
        } else {
            setFormState(initialFormState);
        }
    }, [assetToEdit, isOpen]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormState(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value,
        }));
    };

    const handleSubmit = () => {
        if (!formState.name || formState.value <= 0) {
            alert('Please enter a valid name and value for the asset.');
            return;
        }
        onSave(formState);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h3 className="text-lg font-bold mb-4">{assetToEdit ? 'Edit' : 'Add'} Asset</h3>
            <div className="space-y-4">
                <input
                    type="text"
                    name="name"
                    value={formState.name}
                    onChange={handleInputChange}
                    placeholder="Asset Name (e.g., Bank Balance)"
                    className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
                <input
                    type="number"
                    name="value"
                    value={formState.value}
                    onChange={handleInputChange}
                    placeholder="Current Value (₹)"
                    className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
            </div>
            <div className="flex justify-end space-x-2 mt-6">
                <button onClick={onClose} className="bg-gray-600 text-white px-4 py-2 rounded-lg">Cancel</button>
                <button onClick={handleSubmit} className="bg-green-600 text-white px-4 py-2 rounded-lg">Save</button>
            </div>
        </Modal>
    );
};
