import { GoogleGenAI } from "@google/genai";
import { Transaction, FinancialSummary } from '../types';

// Per coding guidelines, API key must be read from process.env.API_KEY.
const apiKey = process.env.API_KEY;
let ai: GoogleGenAI | null = null;
let initError: string | null = null;

if (!apiKey) {
    // This will be displayed in the UI instead of crashing the app.
    initError = "AI Advisor Error: The API_KEY is not configured. Please set it in your Vercel project's environment variables.";
} else {
    try {
        ai = new GoogleGenAI({ apiKey });
    } catch (error) {
        console.error("Failed to initialize GoogleGenAI:", error);
        initError = "AI Advisor Error: Failed to initialize the AI service. Please check the console for details.";
    }
}


export async function getFinancialAdvice(
    prompt: string,
    transactions: Transaction[],
    summary: FinancialSummary
): Promise<string> {
    if (!ai) {
        console.error("Gemini AI service not initialized:", initError);
        return initError || "I'm sorry, but the AI service is not available due to a configuration error.";
    }
    
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
