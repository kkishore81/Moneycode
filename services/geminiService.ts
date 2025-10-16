import { httpsCallable } from "firebase/functions";
import { functions } from '../firebase';
import { Transaction, FinancialSummary } from '../types';

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

    try {
        // IMPORTANT: You need to deploy a Cloud Function named 'getFinancialAdvice'
        // in your Firebase project for this to work.
        const getAdvice = httpsCallable(functions, 'getFinancialAdvice');
        const result = await getAdvice({ 
            prompt, 
            financialDataContext 
        });
        
        // The result's data is automatically parsed.
        return result.data as string;

    } catch (error) {
        console.error("Firebase Cloud Function call failed:", error);
        return "I'm sorry, but I'm having trouble connecting to the AI service. Please check the function logs in your Firebase project or try again later.";
    }
}
