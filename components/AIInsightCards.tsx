import React, { useState, useEffect } from 'react';
import { getDashboardInsights } from '../services/geminiService.ts';
import { Transaction, FinancialSummary } from '../types.ts';

interface AIInsightCardsProps {
    transactions: Transaction[];
    summary: FinancialSummary;
}

const InsightIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);

const LoadingSkeleton: React.FC = () => (
    <div className="bg-gray-700/50 p-4 rounded-lg animate-pulse">
        <div className="h-4 bg-gray-600 rounded w-3/4"></div>
    </div>
);

export const AIInsightCards: React.FC<AIInsightCardsProps> = ({ transactions, summary }) => {
    const [insights, setInsights] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Debounce or prevent re-fetching on minor transaction changes if needed
        const handler = setTimeout(() => {
            setIsLoading(true);
            getDashboardInsights(transactions, summary)
                .then(setInsights)
                .finally(() => setIsLoading(false));
        }, 500); // Small delay to batch updates

        return () => clearTimeout(handler);
    }, [transactions, summary]);

    return (
        <div className="bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
                <InsightIcon />
                AI Insights
            </h2>
            <div className="space-y-3">
                {isLoading ? (
                    <>
                        <LoadingSkeleton />
                        <LoadingSkeleton />
                    </>
                ) : insights.length > 0 ? (
                    insights.map((insight, index) => (
                        <div key={index} className="bg-gray-700/50 p-4 rounded-lg text-gray-300">
                           <p>{insight}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-400 text-center py-4">No new insights right now. Keep tracking your finances!</p>
                )}
            </div>
        </div>
    );
};