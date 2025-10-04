import React, { useState } from 'react';
// Fix: Corrected import path for GoogleIcon from a root-level component.
import { GoogleIcon } from './components/icons';

interface AuthProps {
    onLogin: (email: string, pass: string) => void;
    onSignup: (email: string, pass: string) => void;
    onGoogleLogin: () => void;
}

type AuthMode = 'signin' | 'signup';

export const Auth: React.FC<AuthProps> = ({ onLogin, onSignup, onGoogleLogin }) => {
    const [mode, setMode] = useState<AuthMode>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === 'signin') {
            onLogin(email, password);
        } else {
            onSignup(email, password);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="max-w-md w-full bg-gray-800 rounded-2xl shadow-lg p-8 space-y-8">
                <div>
                    <h2 className="text-center text-3xl font-extrabold text-white">
                        Indian Money Code
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-400">
                        {mode === 'signin' ? 'Sign in to your account' : 'Create a new account'}
                    </p>
                </div>

                <div className="flex border-b border-gray-700">
                    <button 
                        onClick={() => setMode('signin')}
                        className={`w-1/2 py-4 text-sm font-medium transition-colors ${mode === 'signin' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-400 hover:text-white'}`}
                    >
                        Sign In
                    </button>
                    <button 
                        onClick={() => setMode('signup')}
                        className={`w-1/2 py-4 text-sm font-medium transition-colors ${mode === 'signup' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-400 hover:text-white'}`}
                    >
                        Sign Up
                    </button>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email address"
                        required
                        className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                    />
                    <input 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder="Password"
                        required
                        className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                    />
                    <button 
                        type="submit"
                        className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                    >
                        {mode === 'signin' ? 'Sign In' : 'Sign Up'}
                    </button>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-gray-800 text-gray-400">Or continue with</span>
                    </div>
                </div>

                <div>
                    <button
                        onClick={onGoogleLogin}
                        className="w-full flex justify-center items-center gap-3 py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                    >
                        <GoogleIcon className="w-5 h-5" />
                        Sign in with Google
                    </button>
                </div>
            </div>
        </div>
    );
};