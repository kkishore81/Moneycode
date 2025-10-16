import { collection, doc, getDocs, setDoc, deleteDoc, DocumentData } from 'firebase/firestore';
import { db } from '../firebase';
import { Transaction, Investment, Goal, InsurancePolicy, Loan, OtherAsset, Budgets } from '../types';

// Generic function to fetch a collection for a user
const getCollection = async <T>(userId: string, collectionName: string): Promise<T[]> => {
    try {
        const querySnapshot = await getDocs(collection(db, 'users', userId, collectionName));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
    } catch (e) {
        console.warn(`[Firestore Preview] Could not fetch collection '${collectionName}'. Returning empty array.`, e);
        return [];
    }
};

// Generic function to save a document, handling both new and existing items
const saveDocument = async (userId: string, collectionName: string, data: { [key: string]: any; id?: string }) => {
    try {
        const { id, ...rest } = data;
        const docRef = id ? doc(db, 'users', userId, collectionName, id) : doc(collection(db, 'users', userId, collectionName));
        await setDoc(docRef, rest, { merge: true });
        return docRef.id; // Return the document ID
    } catch (e) {
        console.warn(`[Firestore Preview] Could not save document in '${collectionName}'. Operation is mocked.`, e);
        // For preview, return a mock ID for optimistic UI to work
        return data.id || `temp-id-${Date.now()}`;
    }
};

// Generic function to delete a document
const deleteDocument = (userId: string, collectionName: string, docId: string) => {
    try {
        return deleteDoc(doc(db, 'users', userId, collectionName, docId));
    } catch (e) {
        console.warn(`[Firestore Preview] Could not delete document in '${collectionName}'. Operation is mocked.`, e);
        return Promise.resolve();
    }
};

export const firestoreService = {
    // Fetch all user data in one go
    getUserData: async (userId: string) => {
        const [transactions, investments, goals, loans, insurancePolicies, otherAssets, budgets] = await Promise.all([
            getCollection<Transaction>(userId, 'transactions'),
            getCollection<Investment>(userId, 'investments'),
            getCollection<Goal>(userId, 'goals'),
            getCollection<Loan>(userId, 'loans'),
            getCollection<InsurancePolicy>(userId, 'insurancePolicies'),
            getCollection<OtherAsset>(userId, 'otherAssets'),
            getCollection<DocumentData>(userId, 'budgets'), // Budgets are stored in a single doc
        ]);

        const budgetsData: Budgets = budgets.length > 0 ? (budgets[0] as Budgets) : {};

        return { transactions, investments, goals, loans, insurancePolicies, otherAssets, budgets: budgetsData };
    },

    // Transaction operations
    saveTransaction: (userId: string, transaction: Omit<Transaction, 'id'> | Transaction) => saveDocument(userId, 'transactions', transaction),
    deleteTransaction: (userId: string, transactionId: string) => deleteDocument(userId, 'transactions', transactionId),

    // Investment operations
    saveInvestment: (userId: string, investment: Omit<Investment, 'id'> | Investment) => saveDocument(userId, 'investments', investment),
    deleteInvestment: (userId: string, investmentId: string) => deleteDocument(userId, 'investments', investmentId),

    // Asset operations
    saveAsset: (userId: string, asset: Omit<OtherAsset, 'id'> | OtherAsset) => saveDocument(userId, 'otherAssets', asset),
    deleteAsset: (userId: string, assetId: string) => deleteDocument(userId, 'otherAssets', assetId),

    // Budget operations
    saveBudget: (userId: string, budgets: Budgets) => {
        try {
            return setDoc(doc(db, 'users', userId, 'budgets', 'main'), budgets)
        } catch (e) {
            console.warn(`[Firestore Preview] Could not save budget. Operation is mocked.`, e);
            return Promise.resolve();
        }
    },

    // Goal operations
    saveGoal: (userId: string, goal: Omit<Goal, 'id' | 'currentAmount'> | Goal) => saveDocument(userId, 'goals', goal),
    deleteGoal: (userId: string, goalId: string) => deleteDocument(userId, 'goals', goalId),

    // Policy operations
    savePolicy: (userId: string, policy: Omit<InsurancePolicy, 'id'> | InsurancePolicy) => saveDocument(userId, 'insurancePolicies', policy),
    deletePolicy: (userId: string, policyId: string) => deleteDocument(userId, 'insurancePolicies', policyId),

    // Loan operations
    saveLoan: (userId: string, loan: Omit<Loan, 'id'> | Loan) => saveDocument(userId, 'loans', loan),
    deleteLoan: (userId: string, loanId: string) => deleteDocument(userId, 'loans', loanId),
};