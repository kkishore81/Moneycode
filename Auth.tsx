import React, { useState } from 'react';
import { GoogleIcon } from './components/icons';
import { signUpWithEmail, signInWithEmail } from './services/authService';

interface AuthProps {
    onGoogleSignIn: () => void;
}

const Auth: React.FC<AuthProps> = ({ onGoogleSignIn }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);

        if (isSignUp) {
            if (password !== confirmPassword) {
                setError("Passwords do not match.");
                setIsLoading(false);
                return;
            }
            try {
                await signUpWithEmail(email, password);
                setMessage("Sign up successful! Please check your email to verify your account.");
                setIsSignUp(false); // Switch to sign-in form after successful sign-up
            } catch (err: any) {
                if (err.code === 'auth/email-already-in-use') {
                    setError('This email is already in use. Please sign in or use a different email.');
                } else if (err.code === 'auth/weak-password') {
                    setError('Password should be at least 6 characters.');
                } else {
                    setError(err.message || "Sign up failed. Please try again.");
                }
            }
        } else { // Sign In
            try {
                await signInWithEmail(email, password);
                // Parent component will handle navigation via onAuthStateChanged listener
            } catch (err: any) {
                if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                    setError("Invalid email or password.");
                } else if (err.code === 'auth/user-disabled') {
                    setError("This account has been disabled.");
                } else {
                    setError(err.message || "Sign in failed. Please try again.");
                }
            }
        }
        setIsLoading(false);
    };

    const toggleForm = () => {
        setIsSignUp(!isSignUp);
        setError('');
        setMessage('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
    };

    return (
        <div className="bg-gray-900 min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-gray-800 p-8 rounded-2xl shadow-lg">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">{isSignUp ? "Create Account" : "Welcome Back"}</h1>
                    <p className="text-gray-400">{isSignUp ? "Join us to manage your finances." : "Sign in to your dashboard."}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email Address"
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
                    {isSignUp && (
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm Password"
                            required
                            className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                        />
                    )}
                    
                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                    {message && <p className="text-green-400 text-sm text-center">{message}</p>}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? "Processing..." : (isSignUp ? "Sign Up" : "Sign In")}
                    </button>
                </form>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-gray-800 text-gray-400">OR</span>
                    </div>
                </div>

                <button
                    onClick={onGoogleSignIn}
                    className="w-full bg-white text-gray-700 font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-200 transition-colors"
                >
                    <GoogleIcon className="w-6 h-6" />
                    Continue with Google
                </button>

                <p className="text-center text-gray-400 mt-6 text-sm">
                    {isSignUp ? "Already have an account?" : "Don't have an account?"}
                    <button onClick={toggleForm} className="font-semibold text-green-400 hover:text-green-300 ml-1">
                        {isSignUp ? "Sign In" : "Sign Up"}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Auth;
