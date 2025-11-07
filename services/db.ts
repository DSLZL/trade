import { Portfolio } from '../types';

const DB_NAME = 'CryptoSimDB';
const DB_VERSION = 1;
const PORTFOLIO_STORE_NAME = 'portfolio';
const PORTFOLIO_KEY = 'main';

let db: IDBDatabase;

function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('Database error:', request.error);
      reject('Error opening database');
    };

    request.onsuccess = (event) => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(PORTFOLIO_STORE_NAME)) {
        db.createObjectStore(PORTFOLIO_STORE_NAME);
      }
    };
  });
}

/**
 * Retrieves the entire portfolio object from IndexedDB.
 */
export async function getPortfolio(): Promise<Portfolio | null> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(PORTFOLIO_STORE_NAME, 'readonly');
        const store = transaction.objectStore(PORTFOLIO_STORE_NAME);
        const request = store.get(PORTFOLIO_KEY);

        request.onsuccess = () => {
            resolve(request.result ? request.result as Portfolio : null);
        };

        request.onerror = () => {
            console.error('Error fetching portfolio:', request.error);
            reject('Error fetching portfolio');
        };
    });
}

/**
 * Saves the entire portfolio object to IndexedDB.
 * @param portfolio The portfolio object to save.
 */
export async function savePortfolio(portfolio: Portfolio): Promise<void> {
    const db = await initDB();
    return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(PORTFOLIO_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(PORTFOLIO_STORE_NAME);
        
        // Create a serializable version of the portfolio, converting Date objects to strings.
        const serializablePortfolio: any = {
            ...portfolio,
            transactions: portfolio.transactions.map(tx => ({
                ...tx,
                date: tx.date.toISOString(), // Convert Date to ISO string for storage
            })),
        };

        if (portfolio.loan) {
            serializablePortfolio.loan = {
                ...portfolio.loan,
                loanDate: portfolio.loan.loanDate.toISOString(),
                dueDate: portfolio.loan.dueDate.toISOString(),
            };
        }


        const request = store.put(serializablePortfolio, PORTFOLIO_KEY);

        request.onsuccess = () => {
            resolve();
        };

        request.onerror = () => {
            console.error('Error saving portfolio:', request.error);
            reject('Error saving portfolio');
        };
    });
}