import React, { useState, useRef, useEffect } from 'react';
import { Transaction, FinancialSummary } from '../types';
import { getFinancialAdvice } from '../services/geminiService';

interface FinancialAdvisorProps {
    transactions: Transaction[];
    summary: FinancialSummary;
}

interface Message {
    sender: 'user' | 'ai';
    text: string;
}

const UserIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const AIIcon: React.FC = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M12.001 2C6.478 2 2.001 6.477 2.001 12c0 5.522 4.477 10 10 10 5.522 0 10-4.478 10-10 0-5.523-4.478-10-10-10Zm4.469 13.015-1.5 1.5a.75.75 0 0 1-1.06 0l-1.92-1.919a.75.75 0 0 0-1.06 0l-1.92 1.92a.75.75 0 1 1-1.06-1.061l1.92-1.92a.75.75 0 0 0 0-1.06l-1.92-1.92a.75.75 0 1 1 1.06-1.06l1.92 1.919a.75.75 0 0 0 1.06 0l1.92-1.92a.75.75 0 1 1 1.06 1.061l-1.92 1.92a.75.75 0 0 0 0 1.06l1.92 1.92a.75.75 0 0 1 0 1.06Z" clipRule="evenodd" />
    </svg>
);

const SparklesIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.293 2.293a1 1 0 010 1.414l-2.293 2.293m-4.586-4.586l-2.293 2.293a1 1 0 000 1.414l2.293 2.293m4.586 4.586l-2.293-2.293a1 1 0 00-1.414 0l-2.293 2.293m4.586-4.586l2.293 2.293a1 1 0 001.414 0l2.293-2.293M9 21v-4m-2 2h4m5-4l-2.293-2.293a1 1 0 010-1.414l2.293-2.293m4.586 4.586l2.293-2.293a1 1 0 000-1.414l-2.293-2.293" />
    </svg>
);


export const FinancialAdvisor: React.FC<FinancialAdvisorProps> = ({ transactions, summary }) => {
    const [messages, setMessages] = useState<Message[]>([
        { sender: 'ai', text: 'Hello! I am your AI financial advisor. How can I help you analyze your spending today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [analysisMode, setAnalysisMode] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);
    
    const toggleAnalysisMode = () => {
        setAnalysisMode(!analysisMode);
        setInput(''); // Clear input when toggling
    };

    const handleSend = async () => {
        if (input.trim() === '' || isLoading) return;
        
        const prompt = analysisMode ? `Analyze if I can afford this purchase: "${input}"` : input;

        const userMessage: Message = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        if (analysisMode) setAnalysisMode(false); // Reset mode after sending

        try {
            const aiResponse = await getFinancialAdvice(prompt, transactions, summary);
            const aiMessage: Message = { sender: 'ai', text: aiResponse };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Error getting financial advice:', error);
            const errorMessage: Message = { sender: 'ai', text: 'Sorry, I encountered an error. Please try again.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-white">AI Financial Advisor</h2>
            <div className="h-80 overflow-y-auto mb-4 p-4 bg-gray-900 rounded-lg space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                        {msg.sender === 'ai' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center"><AIIcon /></div>}
                        <div className={`max-w-md p-3 rounded-lg ${msg.sender === 'ai' ? 'bg-gray-700 text-gray-200' : 'bg-green-600 text-white'}`}>
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                         {msg.sender === 'user' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center"><UserIcon /></div>}
                    </div>
                ))}
                {isLoading && (
                     <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center"><AIIcon /></div>
                        <div className="max-w-md p-3 rounded-lg bg-gray-700 text-gray-200">
                           <div className="flex items-center space-x-2">
                               <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                               <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                               <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                           </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="flex items-center space-x-2">
                 <button 
                    onClick={toggleAnalysisMode}
                    title="Analyze a Purchase"
                    className={`p-3 rounded-lg transition-colors ${analysisMode ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                >
                    <SparklesIcon className="w-5 h-5" />
                </button>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={analysisMode ? 'Item and cost (e.g., New Laptop for ₹80,000)' : 'Ask about your finances...'}
                    className="flex-grow bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                    disabled={isLoading}
                />
                <button
                    onClick={handleSend}
                    className="bg-green-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                    disabled={isLoading}
                >
                    Send
                </button>
            </div>
        </div>
    );
};
