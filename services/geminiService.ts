import { GoogleGenAI } from "@google/genai";
import { Transaction, FinancialSummary } from '../types';

// Fix: Switched from Vite-specific import.meta.env to process.env.API_KEY and initialized directly as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getFinancialAdvice(
    prompt: string,
    transactions: Transaction[],
    summary: FinancialSummary
): Promise<string> {
    const financialDataContext = `
        Here is a summary of the user's financial data for the current month:
        - Total Balance: ₹${summary.totalBalance.toFixed(2)}
        - Monthly Income: ₹${summary.monthlyIncome.toFixed(2)}
        - Monthly Expenses: ₹${summary.monthlyExpenses.toFixed(2)}

        Recent Transactions:
        ${transactions.slice(0, 15).map(t => `- ${new Date(t.date).toLocaleDateString('en-IN')}: ${t.description} (${t.category}) - ₹${t.amount.toFixed(2)} [${t.type}]`).join('\n')}
    `;

    const fullPrompt = `
        Based on the following financial data, answer the user's question.
        Act as a helpful and concise financial advisor. Provide actionable insights. Do not just list data. The currency is Indian Rupees (₹).

        Financial Data:
        ${financialDataContext}

        User's Question: "${prompt}"
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: {
                systemInstruction: "You are a friendly financial advisor for a user in India. Your responses should be clear, insightful, and encouraging. Use markdown for formatting if needed.",
                temperature: 0.5,
                topP: 1,
            }
        });

        return response.text;
    } catch (error) {
        console.error("Gemini API call failed:", error);
        return "I'm sorry, but I'm having trouble connecting to my knowledge base. Please try again later.";
    }
}
