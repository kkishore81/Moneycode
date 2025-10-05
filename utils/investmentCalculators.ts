
import { InvestmentWithPerformance, Transaction, TransactionCategory } from '../types';
import { calculateXIRR } from './xirr';

// A = P(1 + r/n)^(nt)
// P = principal, r = annual rate, n = compounding periods per year, t = time in years
export const calculateFdValue = (principal: number, annualRate: number, startDate: string): number => {
    if (principal <= 0 || annualRate <= 0 || !startDate) {
        return principal;
    }
    const rate = annualRate / 100;
    const n = 4; // Compounded quarterly, a common standard
    const start = new Date(startDate);
    const today = new Date();
    // time in years
    const t = (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    
    if (t <= 0) return principal;

    const amount = principal * Math.pow(1 + rate / n, n * t);
    return amount;
};

// M = P * ({[1 + i]^n - 1} / i) where i = r/12 and n = months
export const calculateRdValue = (monthlyInvestment: number, annualRate: number, startDate: string): number => {
    if (monthlyInvestment <= 0 || annualRate <= 0 || !startDate) {
        return 0;
    }
    const rate = annualRate / 100;
    const i = rate / 12; // monthly interest rate
    const start = new Date(startDate);
    const today = new Date();
    
    // Calculate total full months passed
    const years = today.getFullYear() - start.getFullYear();
    let n = years * 12 + (today.getMonth() - start.getMonth());
    
    if (today.getDate() < start.getDate()) {
        n--; // Don't count the current month if the start day hasn't been reached
    }

    if (n <= 0) return 0;
    
    // Calculate maturity value for each monthly installment
    let totalValue = 0;
    for (let month = 0; month < n; month++) {
      // Months remaining for this installment to grow
      const monthsRemaining = n - month;
      totalValue += monthlyInvestment * Math.pow(1 + i, monthsRemaining);
    }
    
    // A simpler formula for Future Value of an Annuity
    // const amount = monthlyInvestment * ( (Math.pow(1 + i, n) - 1) / i );
    return totalValue;
};


export const calculateInvestmentSummary = (investments: InvestmentWithPerformance[], transactions: Transaction[]) => {
    const totalInvested = investments.reduce((sum, inv) => sum + inv.totalInvested, 0);
    const totalCurrentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
    const overallGainLoss = totalCurrentValue - totalInvested;

    // For portfolio XIRR, use all investment transactions as outflows
    const investmentTransactions = transactions.filter(t => t.category === TransactionCategory.INVESTMENT);
    
    const cashFlows = investmentTransactions.map(t => ({
        value: -t.amount,
        date: new Date(t.date)
    }));

    // Add the total current value as the final inflow
    if (totalCurrentValue > 0) {
        cashFlows.push({ value: totalCurrentValue, date: new Date() });
    }
    
    // Sort cashflows by date before calculating XIRR
    cashFlows.sort((a, b) => a.date.getTime() - b.date.getTime());

    const values = cashFlows.map(cf => cf.value);
    const dates = cashFlows.map(cf => cf.date);

    const xirr = calculateXIRR(values, dates);

    return {
        totalInvested,
        totalCurrentValue,
        overallGainLoss,
        xirr: isNaN(xirr) ? 0 : xirr,
    };
};
