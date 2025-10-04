import { Investment } from '../types';

/**
 * Calculates the total invested amount from a list of investments.
 */
export const calculateTotalInvestedAmount = (investments: Investment[]): number => {
    return investments.reduce((acc, inv) => acc + inv.investedAmount, 0);
};

/**
 * Calculates the total current value of all investments.
 */
export const calculateTotalCurrentValue = (investments: Investment[]): number => {
    return investments.reduce((acc, inv) => acc + inv.currentValue, 0);
};

/**
 * Calculates the overall gain or loss in absolute currency value.
 */
export const calculateOverallGainLoss = (investments: Investment[]): number => {
    const totalInvested = calculateTotalInvestedAmount(investments);
    const totalCurrentValue = calculateTotalCurrentValue(investments);
    return totalCurrentValue - totalInvested;
};

/**
 * Calculates the overall return percentage across all investments.
 */
export const calculateOverallReturnPercentage = (investments: Investment[]): number => {
    const totalInvested = calculateTotalInvestedAmount(investments);
    if (totalInvested === 0) {
        return 0;
    }
    const totalGainLoss = calculateOverallGainLoss(investments);
    return (totalGainLoss / totalInvested) * 100;
};

/**
 * Calculates the gain or loss for an individual investment.
 */
export const calculateIndividualGainLoss = (investment: Investment): number => {
    return investment.currentValue - investment.investedAmount;
};

/**
 * Calculates the return percentage for an individual investment.
 */
export const calculateIndividualReturnPercentage = (investment: Investment): number => {
    if (investment.investedAmount === 0) {
        return 0;
    }
    const gainLoss = calculateIndividualGainLoss(investment);
    return (gainLoss / investment.investedAmount) * 100;
};

/**
 * Aggregates the value history of all investments to create a total portfolio history.
 */
export const calculatePortfolioHistory = (investments: Investment[]): { date: string; value: number }[] => {
    const historyMap = new Map<string, number>();

    investments.forEach(inv => {
        if (inv.valueHistory) {
            inv.valueHistory.forEach(point => {
                const existingValue = historyMap.get(point.date) || 0;
                historyMap.set(point.date, existingValue + point.value);
            });
        }
    });

    if (historyMap.size === 0) {
        return [];
    }
    
    const aggregatedHistory = Array.from(historyMap.entries()).map(([date, value]) => ({ date, value }));

    // Sort by date to ensure the chart line is correct
    return aggregatedHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};