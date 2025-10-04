import { Loan } from '../types';

export const calculateEMI = (principal: number, annualRate: number, tenureYears: number): number => {
    if (principal <= 0 || annualRate < 0 || tenureYears <= 0) {
        return 0;
    }
    const monthlyRate = annualRate / 12 / 100;
    const numberOfMonths = tenureYears * 12;

    if (monthlyRate === 0) {
        return principal / numberOfMonths;
    }

    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfMonths)) / (Math.pow(1 + monthlyRate, numberOfMonths) - 1);
    return emi;
};

export const calculateTotalInterestPayable = (principal: number, emi: number, tenureYears: number): number => {
    if (principal <= 0 || emi <= 0 || tenureYears <= 0) {
        return 0;
    }
    const numberOfMonths = tenureYears * 12;
    const totalPayment = emi * numberOfMonths;
    return totalPayment - principal;
};

export const calculateAmortization = (principal: number, annualRate: number, tenureYears: number): { month: number; emi: number; principal: number; interest: number; balance: number }[] => {
    const emi = calculateEMI(principal, annualRate, tenureYears);
    const monthlyRate = annualRate / 12 / 100;
    const numberOfMonths = tenureYears * 12;
    let balance = principal;
    const schedule = [];

    for (let i = 1; i <= numberOfMonths; i++) {
        const interest = balance * monthlyRate;
        const principalPaid = emi - interest;
        balance -= principalPaid;
        schedule.push({
            month: i,
            emi: emi,
            principal: principalPaid,
            interest: interest,
            balance: balance > 0 ? balance : 0,
        });
    }
    return schedule;
};
