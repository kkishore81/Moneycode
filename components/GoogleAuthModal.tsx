import React, { useState } from 'react';
import { Modal } from './Modal';
import { GoogleIcon } from './icons';
import { signInWithGoogle } from '../services/authService';

interface GoogleAuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({ isOpen, onClose }) => {
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        setError('');
        setIsLoading(true);
        try {
            await signInWithGoogle();
            onClose();
            // Auth state change will be caught by the listener in App.tsx
        } catch (err: any) {
            setError('Failed to sign in with Google. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="text-center p-4">
                <h3 className="text-xl font-bold mb-4 text-white">Sign in with Google</h3>
                <p className="text-gray-400 mb-6">
                    Continue to Indian Money Code by logging in with your Google account.
                </p>
                {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
                <button
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-3 w-full hover:bg-blue-700 transition-colors disabled:bg-gray-500"
                >
                    <GoogleIcon className="w-6 h-6 bg-white rounded-full p-0.5" />
                    {isLoading ? "Redirecting..." : "Continue with Google"}
                </button>
                <button
                    onClick={onClose}
                    className="mt-4 text-gray-400 text-sm hover:text-white"
                >
                    Cancel
                </button>
            </div>
        </Modal>
    );
};
