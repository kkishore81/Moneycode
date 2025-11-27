import { createClient } from '@supabase/supabase-js';
import { Transaction, Investment, Goal, InsurancePolicy, Loan, OtherAsset, Budgets, RecurringTransaction } from '../types.ts';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const mapDbToTransaction = (row: any): Transaction => ({
  id: row.id,
  date: row.date,
  amount: Number(row.amount),
  description: row.description,
  type: row.type,
  category: row.category,
  investmentId: row.investment_id,
  recurringTransactionId: row.recurring_transaction_id,
});

const mapDbToInvestment = (row: any): Investment => ({
  id: row.id,
  name: row.name,
  type: row.type,
  currentValue: Number(row.current_value),
  goalId: row.goal_id,
  startDate: row.start_date,
  interestRate: row.interest_rate ? Number(row.interest_rate) : undefined,
  monthlyInvestment: row.monthly_investment ? Number(row.monthly_investment) : undefined,
});

const mapDbToGoal = (row: any): Goal => ({
  id: row.id,
  name: row.name,
  targetAmount: Number(row.target_amount),
  currentAmount: 0,
  deadline: row.deadline,
});

const mapDbToLoan = (row: any): Loan => ({
  id: row.id,
  name: row.name,
  type: row.type,
  principal: Number(row.principal),
  outstandingAmount: Number(row.outstanding_amount),
  interestRate: Number(row.interest_rate),
  tenure: Number(row.tenure),
  emi: Number(row.emi),
  startDate: row.start_date,
  assetCurrentValue: row.asset_current_value ? Number(row.asset_current_value) : undefined,
  status: row.status,
});

const mapDbToPolicy = (row: any): InsurancePolicy => ({
  id: row.id,
  policyName: row.policy_name,
  type: row.type,
  sumAssured: Number(row.sum_assured),
  premiumAmount: Number(row.premium_amount),
  premiumDueDate: row.premium_due_date,
  issueDate: row.issue_date,
  expiryDate: row.expiry_date,
});

const mapDbToAsset = (row: any): OtherAsset => ({
  id: row.id,
  name: row.name,
  value: Number(row.value),
});

const mapDbToRecurringTransaction = (row: any): RecurringTransaction => ({
  id: row.id,
  name: row.name,
  amount: Number(row.amount),
  type: row.type,
  category: row.category,
  frequency: row.frequency,
  startDate: row.start_date,
  nextDueDate: row.next_due_date,
});

export const supabaseService = {
  // Get all user data
  getUserData: async (userId: string) => {
    try {
      const [
        { data: transactions },
        { data: investments },
        { data: goals },
        { data: loans },
        { data: insurancePolicies },
        { data: otherAssets },
        { data: budgetsRows },
        { data: recurringTransactions },
      ] = await Promise.all([
        supabase.from('transactions').select('*').eq('user_id', userId),
        supabase.from('investments').select('*').eq('user_id', userId),
        supabase.from('goals').select('*').eq('user_id', userId),
        supabase.from('loans').select('*').eq('user_id', userId),
        supabase.from('insurance_policies').select('*').eq('user_id', userId),
        supabase.from('other_assets').select('*').eq('user_id', userId),
        supabase.from('budgets').select('*').eq('user_id', userId),
        supabase.from('recurring_transactions').select('*').eq('user_id', userId),
      ]);

      const budgets: Budgets = budgetsRows && budgetsRows.length > 0 ? budgetsRows[0].budget_data : {};

      return {
        transactions: (transactions || []).map(mapDbToTransaction),
        investments: (investments || []).map(mapDbToInvestment),
        goals: (goals || []).map(mapDbToGoal),
        loans: (loans || []).map(mapDbToLoan),
        insurancePolicies: (insurancePolicies || []).map(mapDbToPolicy),
        otherAssets: (otherAssets || []).map(mapDbToAsset),
        budgets,
        recurringTransactions: (recurringTransactions || []).map(mapDbToRecurringTransaction),
      };
    } catch (e) {
      console.error('Error fetching user data:', e);
      return {
        transactions: [],
        investments: [],
        goals: [],
        loans: [],
        insurancePolicies: [],
        otherAssets: [],
        budgets: {},
        recurringTransactions: [],
      };
    }
  },

  // Transaction operations
  saveTransaction: async (userId: string, transaction: Omit<Transaction, 'id'> | Transaction) => {
    try {
      const data = {
        user_id: userId,
        date: transaction.date,
        amount: transaction.amount,
        description: transaction.description,
        type: transaction.type,
        category: transaction.category,
        investment_id: transaction.investmentId,
        recurring_transaction_id: transaction.recurringTransactionId,
      };

      if ('id' in transaction) {
        const { error } = await supabase.from('transactions').update(data).eq('id', transaction.id);
        if (error) throw error;
        return transaction.id;
      } else {
        const { data: result, error } = await supabase.from('transactions').insert([data]).select('id');
        if (error) throw error;
        return result?.[0]?.id || `temp-${Date.now()}`;
      }
    } catch (e) {
      console.error('Error saving transaction:', e);
      return 'id' in transaction ? transaction.id : `temp-${Date.now()}`;
    }
  },

  deleteTransaction: async (userId: string, transactionId: string) => {
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', transactionId).eq('user_id', userId);
      if (error) throw error;
    } catch (e) {
      console.error('Error deleting transaction:', e);
    }
  },

  // Recurring transaction operations
  saveRecurringTransaction: async (userId: string, transaction: Omit<RecurringTransaction, 'id'> | RecurringTransaction) => {
    try {
      const data = {
        user_id: userId,
        name: transaction.name,
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        frequency: transaction.frequency,
        start_date: transaction.startDate,
        next_due_date: transaction.nextDueDate,
      };

      if ('id' in transaction) {
        const { error } = await supabase.from('recurring_transactions').update(data).eq('id', transaction.id);
        if (error) throw error;
        return transaction.id;
      } else {
        const { data: result, error } = await supabase.from('recurring_transactions').insert([data]).select('id');
        if (error) throw error;
        return result?.[0]?.id || `temp-${Date.now()}`;
      }
    } catch (e) {
      console.error('Error saving recurring transaction:', e);
      return 'id' in transaction ? transaction.id : `temp-${Date.now()}`;
    }
  },

  deleteRecurringTransaction: async (userId: string, transactionId: string) => {
    try {
      const { error } = await supabase.from('recurring_transactions').delete().eq('id', transactionId).eq('user_id', userId);
      if (error) throw error;
    } catch (e) {
      console.error('Error deleting recurring transaction:', e);
    }
  },

  // Investment operations
  saveInvestment: async (userId: string, investment: Omit<Investment, 'id'> | Investment) => {
    try {
      const data = {
        user_id: userId,
        name: investment.name,
        type: investment.type,
        current_value: investment.currentValue,
        goal_id: investment.goalId,
        start_date: investment.startDate,
        interest_rate: investment.interestRate,
        monthly_investment: investment.monthlyInvestment,
      };

      if ('id' in investment) {
        const { error } = await supabase.from('investments').update(data).eq('id', investment.id);
        if (error) throw error;
        return investment.id;
      } else {
        const { data: result, error } = await supabase.from('investments').insert([data]).select('id');
        if (error) throw error;
        return result?.[0]?.id || `temp-${Date.now()}`;
      }
    } catch (e) {
      console.error('Error saving investment:', e);
      return 'id' in investment ? investment.id : `temp-${Date.now()}`;
    }
  },

  deleteInvestment: async (userId: string, investmentId: string) => {
    try {
      const { error } = await supabase.from('investments').delete().eq('id', investmentId).eq('user_id', userId);
      if (error) throw error;
    } catch (e) {
      console.error('Error deleting investment:', e);
    }
  },

  // Asset operations
  saveAsset: async (userId: string, asset: Omit<OtherAsset, 'id'> | OtherAsset) => {
    try {
      const data = {
        user_id: userId,
        name: asset.name,
        value: asset.value,
      };

      if ('id' in asset) {
        const { error } = await supabase.from('other_assets').update(data).eq('id', asset.id);
        if (error) throw error;
        return asset.id;
      } else {
        const { data: result, error } = await supabase.from('other_assets').insert([data]).select('id');
        if (error) throw error;
        return result?.[0]?.id || `temp-${Date.now()}`;
      }
    } catch (e) {
      console.error('Error saving asset:', e);
      return 'id' in asset ? asset.id : `temp-${Date.now()}`;
    }
  },

  deleteAsset: async (userId: string, assetId: string) => {
    try {
      const { error } = await supabase.from('other_assets').delete().eq('id', assetId).eq('user_id', userId);
      if (error) throw error;
    } catch (e) {
      console.error('Error deleting asset:', e);
    }
  },

  // Budget operations
  saveBudget: async (userId: string, budgets: Budgets) => {
    try {
      const data = {
        user_id: userId,
        budget_data: budgets,
      };

      const { error: checkError, data: existing } = await supabase.from('budgets').select('id').eq('user_id', userId).maybeSingle();

      if (existing) {
        const { error } = await supabase.from('budgets').update(data).eq('user_id', userId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('budgets').insert([data]);
        if (error) throw error;
      }
    } catch (e) {
      console.error('Error saving budget:', e);
    }
  },

  // Goal operations
  saveGoal: async (userId: string, goal: Omit<Goal, 'id' | 'currentAmount'> | Goal) => {
    try {
      const data = {
        user_id: userId,
        name: goal.name,
        target_amount: goal.targetAmount,
        deadline: goal.deadline,
      };

      if ('id' in goal) {
        const { error } = await supabase.from('goals').update(data).eq('id', goal.id);
        if (error) throw error;
        return goal.id;
      } else {
        const { data: result, error } = await supabase.from('goals').insert([data]).select('id');
        if (error) throw error;
        return result?.[0]?.id || `temp-${Date.now()}`;
      }
    } catch (e) {
      console.error('Error saving goal:', e);
      return 'id' in goal ? goal.id : `temp-${Date.now()}`;
    }
  },

  deleteGoal: async (userId: string, goalId: string) => {
    try {
      const { error } = await supabase.from('goals').delete().eq('id', goalId).eq('user_id', userId);
      if (error) throw error;
    } catch (e) {
      console.error('Error deleting goal:', e);
    }
  },

  // Policy operations
  savePolicy: async (userId: string, policy: Omit<InsurancePolicy, 'id'> | InsurancePolicy) => {
    try {
      const data = {
        user_id: userId,
        policy_name: policy.policyName,
        type: policy.type,
        sum_assured: policy.sumAssured,
        premium_amount: policy.premiumAmount,
        premium_due_date: policy.premiumDueDate,
        issue_date: policy.issueDate,
        expiry_date: policy.expiryDate,
      };

      if ('id' in policy) {
        const { error } = await supabase.from('insurance_policies').update(data).eq('id', policy.id);
        if (error) throw error;
        return policy.id;
      } else {
        const { data: result, error } = await supabase.from('insurance_policies').insert([data]).select('id');
        if (error) throw error;
        return result?.[0]?.id || `temp-${Date.now()}`;
      }
    } catch (e) {
      console.error('Error saving policy:', e);
      return 'id' in policy ? policy.id : `temp-${Date.now()}`;
    }
  },

  deletePolicy: async (userId: string, policyId: string) => {
    try {
      const { error } = await supabase.from('insurance_policies').delete().eq('id', policyId).eq('user_id', userId);
      if (error) throw error;
    } catch (e) {
      console.error('Error deleting policy:', e);
    }
  },

  // Loan operations
  saveLoan: async (userId: string, loan: Omit<Loan, 'id'> | Loan) => {
    try {
      const data = {
        user_id: userId,
        name: loan.name,
        type: loan.type,
        principal: loan.principal,
        outstanding_amount: loan.outstandingAmount,
        interest_rate: loan.interestRate,
        tenure: loan.tenure,
        emi: loan.emi,
        start_date: loan.startDate,
        asset_current_value: loan.assetCurrentValue,
        status: loan.status,
      };

      if ('id' in loan) {
        const { error } = await supabase.from('loans').update(data).eq('id', loan.id);
        if (error) throw error;
        return loan.id;
      } else {
        const { data: result, error } = await supabase.from('loans').insert([data]).select('id');
        if (error) throw error;
        return result?.[0]?.id || `temp-${Date.now()}`;
      }
    } catch (e) {
      console.error('Error saving loan:', e);
      return 'id' in loan ? loan.id : `temp-${Date.now()}`;
    }
  },

  deleteLoan: async (userId: string, loanId: string) => {
    try {
      const { error } = await supabase.from('loans').delete().eq('id', loanId).eq('user_id', userId);
      if (error) throw error;
    } catch (e) {
      console.error('Error deleting loan:', e);
    }
  },
};
