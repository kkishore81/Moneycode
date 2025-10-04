import React, { useState } from 'react';

// Fix: Added props interface to accept onVerify and userEmail from App.tsx.
interface VerificationProps {
    onVerify: (code: string) => boolean;
    userEmail: string | null;
}

// Fix: Implemented a functional verification component using the passed props.
export const Verification: React.FC<VerificationProps> = ({ onVerify, userEmail }) => {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');

    const handleVerifyClick = () => {
        setError('');
        if (!onVerify(code)) {
            setError('Invalid verification code. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="max-w-md w-full bg-gray-800 rounded-2xl shadow-lg p-8 space-y-6 text-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">Check your email</h2>
                    <p className="text-gray-400 mt-2">
                        We've sent a verification code to <br />
                        <strong className="text-white">{userEmail || 'your email address'}</strong>.
                    </p>
                    <p className="text-gray-500 text-sm mt-2">(Hint: The code is 123456)</p>
                </div>
                <div className="space-y-4">
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleVerifyClick()}
                        placeholder="Enter verification code"
                        className="w-full bg-gray-700 text-white text-center placeholder-gray-400 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                    />
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <button
                        onClick={handleVerifyClick}
                        className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                    >
                        Verify
                    </button>
                </div>
            </div>
        </div>
    );
};
