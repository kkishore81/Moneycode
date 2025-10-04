// Transactions
export enum TransactionType {
  INCOME = 'Income',
  EXPENSE = 'Expense',
}

export enum TransactionCategory {
  FOOD = 'Food',
  TRANSPORT = 'Transport',
  SHOPPING = 'Shopping',
  BILLS = 'Bills',
  // Fix: Corrected typo 'ENTERTAINTAINMENT' to 'ENTERTAINMENT'.
  ENTERTAINMENT = 'Entertainment',
  HEALTH = 'Health',
  HOUSING = 'Housing',
  SALARY = 'Salary',
  OTHER = 'Other',
}

export interface Transaction {
  id: string;
  date: string; // ISO string
  description: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
}

// Summary
export interface FinancialSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
}

// Budgets
export type Budgets = Partial<Record<TransactionCategory, number>>;

// Goals
export interface Goal {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string; // ISO string
}

// Investments
export enum InvestmentType {
    STOCKS = 'Stocks',
    MUTUAL_FUNDS = 'Mutual Funds',
    CRYPTO = 'Cryptocurrency',
    FIXED_DEPOSIT = 'Fixed Deposit',
    RECURRING_DEPOSIT = 'Recurring Deposit',
}

export interface InvestmentValueHistory {
    date: string; // ISO string
    value: number;
}

export interface Investment {
    id: string;
    name: string;
    type: InvestmentType;
    investedAmount: number;
    currentValue: number;
    purchaseDate: string; // ISO string
    interestRate?: number; // For FD/RD
    valueHistory?: InvestmentValueHistory[];
}

// Insurance
export enum InsuranceType {
    LIFE = 'Life Insurance',
    HEALTH = 'Health Insurance',
    VEHICLE = 'Vehicle Insurance',
    HOME = 'Home Insurance',
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

// Loans
export enum LoanType {
    PERSONAL = 'Personal Loan',
    HOME = 'Home Loan',
    CAR = 'Car Loan',
    EDUCATION = 'Education Loan',
}

export interface Loan {
    id: string;
    name: string;
    type: LoanType;
    principal: number;
    outstandingAmount: number;
    interestRate: number; // Annual percentage
    tenure: number; // in years
    emi: number;
    startDate: string; // ISO string
    assetCurrentValue?: number;
}

// Will Creator
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

// Fix: Added missing types for Document Vault feature.
// Document Vault
export enum DocumentType {
    PDF = 'PDF',
    IMAGE = 'Image',
    WORD = 'Word Document',
    OTHER = 'Other',
}

export interface FinancialDocument {
    id: string;
    name: string;
    type: DocumentType;
    uploadDate: string; // ISO string
}
