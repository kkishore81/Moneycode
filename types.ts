export enum TransactionType {
    INCOME = 'Income',
    EXPENSE = 'Expense',
}

export enum TransactionCategory {
    FOOD = 'Food',
    SHOPPING = 'Shopping',
    TRANSPORT = 'Transport',
    BILLS = 'Bills',
    ENTERTAINMENT = 'Entertainment',
    HEALTH = 'Health',
    HOUSING = 'Housing',
    SALARY = 'Salary',
    INVESTMENT = 'Investment',
    OTHER = 'Other',
}

export interface Transaction {
    id: string;
    date: string; // ISO string
    amount: number;
    description: string;
    type: TransactionType;
    category: TransactionCategory;
    investmentId?: string; // Link to a specific investment
}

export interface FinancialSummary {
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
}

export type Budgets = {
    [key in TransactionCategory]?: number;
};

export interface Goal {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number; // This will be calculated from linked investments
    deadline: string; // ISO string
}

export enum InsuranceType {
    LIFE = 'Life Insurance',
    HEALTH = 'Health Insurance',
    VEHICLE = 'Vehicle Insurance',
    PROPERTY = 'Property Insurance',
    OTHER = 'Other',
}

export interface InsurancePolicy {
    id: string;
    policyName: string;
    type: InsuranceType;
    sumAssured: number;
    premiumAmount: number;
    premiumDueDate: string; // ISO string
    issueDate: string; // ISO string
    expiryDate: string; // ISO string
}

export enum LoanType {
    PERSONAL = 'Personal Loan',
    HOME = 'Home Loan',
    CAR = 'Car Loan',
    EDUCATION = 'Education Loan',
    BUSINESS = 'Business Loan',
    OTHER = 'Other',
}

export interface Loan {
    id: string;
    name: string;
    type: LoanType;
    principal: number;
    outstandingAmount: number;
    interestRate: number; // Annual percentage
    tenure: number; // In years
    emi: number;
    startDate: string; // ISO string
    assetCurrentValue?: number; // Optional, for home/car loans
    status?: 'Active' | 'Paid Off';
}

export interface WillPersonalInfo {
    fullName: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
}

export interface Executor {
    fullName: string;
    relationship: string;
    address: string;
}

export interface Asset {
    id: string;
    description: string;
}

export interface Beneficiary {
    id: string;
    fullName: string;
    relationship: string;
    assets: Asset[];
}

export interface Guardian {
    fullName: string;
    relationship: string;
}

export enum InvestmentType {
    STOCKS = 'Stocks',
    MUTUAL_FUNDS = 'Mutual Funds',
    CRYPTO = 'Cryptocurrency',
    FD = 'Fixed Deposit',
    RECURRING_DEPOSIT = 'Recurring Deposit',
    OTHER = 'Other',
}

export interface Investment {
    id: string;
    name: string;
    type: InvestmentType;
    currentValue: number; // Manual entry for non-auto-calculated types
    goalId?: string;
    // New fields for automated calculation
    startDate?: string; // ISO String
    interestRate?: number; // Annual percentage
    monthlyInvestment?: number; // For RDs
}

// Enriched type after calculations
export interface InvestmentWithPerformance extends Investment {
    totalInvested: number;
    pnl: number;
    xirr: number;
}


export interface InvestmentSummary {
    totalInvested: number;
    totalCurrentValue: number;
    overallGainLoss: number;
    xirr: number;
}

export type RiskProfile = 'Conservative' | 'Moderate' | 'Aggressive';

export interface OtherAsset {
    id: string;
    name: string;
    value: number;
}
// Fix: Add User type for authentication state.
export interface User {
    email: string;
    password: string; // In a real app, this would be a hash
    verified: boolean;
}

// Fix: Add DashboardWidgetSettings type to be shared between components.
export interface DashboardWidgetSettings {
    summaryCards: boolean;
    cashFlowChart: boolean;
    expenseChart: boolean;
    transactionsList: boolean;
    aiAdvisor: boolean;
}