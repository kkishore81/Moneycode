const DB_NAME = 'indianMoney';
const DB_VERSION = 1;
const STORES = {
  TRANSACTIONS: 'transactions',
  INVESTMENTS: 'investments',
  GOALS: 'goals',
  LOANS: 'loans',
  POLICIES: 'policies',
  ASSETS: 'assets',
  BUDGETS: 'budgets',
  RECURRING: 'recurring',
  SYNC_QUEUE: 'syncQueue',
};

let db: IDBDatabase;

export const offlineService = {
  init: async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const database = (event.target as IDBOpenDBRequest).result;

        Object.values(STORES).forEach(store => {
          if (!database.objectStoreNames.contains(store)) {
            const objectStore = database.createObjectStore(store, { keyPath: 'id' });
            objectStore.createIndex('user_id', 'user_id', { unique: false });
            if (store === STORES.SYNC_QUEUE) {
              objectStore.createIndex('synced', 'synced', { unique: false });
            }
          }
        });
      };
    });
  },

  saveTransaction: async (transaction: any): Promise<void> => {
    return offlineService.saveToStore(STORES.TRANSACTIONS, transaction);
  },

  getTransactions: async (userId: string): Promise<any[]> => {
    return offlineService.getFromStore(STORES.TRANSACTIONS, userId);
  },

  deleteTransaction: async (transactionId: string): Promise<void> => {
    return offlineService.deleteFromStore(STORES.TRANSACTIONS, transactionId);
  },

  saveInvestment: async (investment: any): Promise<void> => {
    return offlineService.saveToStore(STORES.INVESTMENTS, investment);
  },

  getInvestments: async (userId: string): Promise<any[]> => {
    return offlineService.getFromStore(STORES.INVESTMENTS, userId);
  },

  deleteInvestment: async (investmentId: string): Promise<void> => {
    return offlineService.deleteFromStore(STORES.INVESTMENTS, investmentId);
  },

  saveToStore: async (storeName: string, data: any): Promise<void> => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  },

  getFromStore: async (storeName: string, userId: string): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index('user_id');
      const request = index.getAll(userId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  },

  deleteFromStore: async (storeName: string, id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  },

  clearStore: async (storeName: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  },

  addToSyncQueue: async (action: string, data: any): Promise<void> => {
    const syncItem = {
      id: `${Date.now()}-${Math.random()}`,
      action,
      data,
      synced: false,
      timestamp: new Date().toISOString(),
    };
    return offlineService.saveToStore(STORES.SYNC_QUEUE, syncItem);
  },

  getPendingSyncItems: async (): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.SYNC_QUEUE], 'readonly');
      const store = transaction.objectStore(STORES.SYNC_QUEUE);
      const index = store.index('synced');
      const request = index.getAll(false);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  },

  markAsSynced: async (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.SYNC_QUEUE], 'readwrite');
      const store = transaction.objectStore(STORES.SYNC_QUEUE);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const item = request.result;
        if (item) {
          item.synced = true;
          const updateRequest = store.put(item);
          updateRequest.onerror = () => reject(updateRequest.error);
          updateRequest.onsuccess = () => resolve();
        } else {
          resolve();
        }
      };
    });
  },
};
