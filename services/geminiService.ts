import { GoogleGenAI } from "@google/genai";
import { Transaction, FinancialSummary, TransactionCategory } from '../types.ts';

// In a preview environment, process.env.API_KEY may not be set.
// We check for its existence and provide a mock implementation if it's missing.
const API_KEY = process.env.API_KEY; 
let ai: GoogleGenAI | null = null;

if (API_KEY) {
    ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
    console.warn("API_KEY environment variable not found. AI features will be mocked.");
}

const mockApiCall = (mockResponse: any, delay = 1000) => {
    return new Promise(resolve => setTimeout(() => resolve(mockResponse), delay));
};

export async function getCategorySuggestion(description: string): Promise<TransactionCategory> {
    if (!ai) {
        return mockApiCall(TransactionCategory.SHOPPING) as Promise<TransactionCategory>;
    }
    
    const validCategories = Object.values(TransactionCategory).join(', ');
    const prompt = `Based on the transaction description "${description}", what is the most appropriate category? Choose exactly one from this list: [${validCategories}]. Do not add any explanation or punctuation, just the category name.`;

    try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
        const category = response.text.trim() as TransactionCategory;
        if (Object.values(TransactionCategory).includes(category)) {
            return category;
        }
        return TransactionCategory.OTHER;
    } catch (error) {
        console.error("Error getting category suggestion:", error);
        throw error;
    }
}

export async function getDashboardInsights(transactions: Transaction[], summary: FinancialSummary): Promise<string[]> {
     if (!ai) {
        return mockApiCall([
            "Mock Insight: Your spending on 'Food' seems high this month compared to your budget.",
            "Mock Insight: Great job! You are on track to meet your 'New Car' savings goal.",
        ]) as Promise<string[]>;
    }

    const transactionSummary = transactions.slice(0, 10).map(t => `${t.description}: ${t.amount} (${t.type})`).join('\n');
    const prompt = `You are a helpful and concise financial advisor. Analyze the following financial data and provide 2 short, actionable insights for the user. Present each insight as a complete sentence.
    
    Data:
    - Monthly Income: ${summary.monthlyIncome}
    - Monthly Expenses: ${summary.monthlyExpenses}
    - Recent Transactions:
    ${transactionSummary}

    Format your response as a JSON array of strings, like ["Insight 1", "Insight 2"]. Do not include any other text or markdown.`;

    try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
        const responseText = response.text.trim().replace(/```json|```/g, '');
        const insights: string[] = JSON.parse(responseText);
        return insights;
    } catch (error) {
        console.error("Error getting dashboard insights:", error);
        return ["Could not generate insights at this time.", "Remember to stick to your budget."];
    }
}

export async function getFinancialAdvice(
    prompt: string,
    transactions: Transaction[],
    summary: FinancialSummary
): Promise<string> {
   if (!ai) {
        return mockApiCall("Mock Advice: Based on your query, this seems like a reasonable purchase if it fits your budget.") as Promise<string>;
   }
    
    const financialDataContext = `
        Here is a summary of the user's financial data for the current month:
        - Total Balance: ₹${summary.totalBalance.toFixed(2)}
        - Monthly Income: ₹${summary.monthlyIncome.toFixed(2)}
        - Monthly Expenses: ₹${summary.monthlyExpenses.toFixed(2)}

        Recent Transactions:
        ${transactions.slice(0, 15).map(t => `- ${new Date(t.date).toLocaleDateString('en-IN')}: ${t.description} (${t.category}) - ₹${t.amount.toFixed(2)} [${t.type}]`).join('\n')}
    `;

    const fullPrompt = `${financialDataContext}\n\nUser's question: "${prompt}"\n\nProvide a helpful, concise answer.`;

    try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: fullPrompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error getting financial advice:", error);
        return "I'm sorry, but I'm having trouble connecting to the AI service. Please try again later.";
    }
}