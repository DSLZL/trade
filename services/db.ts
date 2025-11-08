import { Portfolio, Transaction, Loan } from '../types';

const DB_NAME = 'CryptoSimDB';
const DB_VERSION = 1;
const PORTFOLIO_STORE_NAME = 'portfolio';
const PORTFOLIO_KEY = 'main';

let db: IDBDatabase;

// This interface represents the raw data structure in IndexedDB, with dates as strings.
// It's used internally to ensure type safety during the deserialization process.
interface StoredPortfolio extends Omit<Portfolio, 'transactions' | 'loan'> {
    transactions: (Omit<Transaction, 'date'> & { date: string })[];
    loan?: (Omit<Loan, 'loanDate' | 'dueDate'> & { loanDate: string, dueDate: string }) | null;
}


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
 * Retrieves the portfolio from IndexedDB and reconstructs Date objects.
 */
export async function getPortfolio(): Promise<Portfolio | null> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(PORTFOLIO_STORE_NAME, 'readonly');
        const store = transaction.objectStore(PORTFOLIO_STORE_NAME);
        const request = store.get(PORTFOLIO_KEY);

        request.onsuccess = () => {
            const savedPortfolio = request.result ? request.result as StoredPortfolio : null;
            
            if (savedPortfolio) {
                // FIX: Resolved a type error where spreading `savedPortfolio` would incorrectly assign string dates to the `loan` property. The object is now reconstructed by destructuring, ensuring `loan.loanDate` and `loan.dueDate` are correctly parsed into Date objects before assignment.
                const { transactions, loan, ...rest } = savedPortfolio;

                const portfolioWithDates: Portfolio = {
                    ...rest,
                    transactions: transactions.map(tx => ({
                        ...tx,
                        date: new Date(tx.date),
                    })),
                    loan: loan ? {
                        ...loan,
                        loanDate: new Date(loan.loanDate),
                        dueDate: new Date(loan.dueDate),
                    } : null,
                };
                resolve(portfolioWithDates);
            } else {
                resolve(null);
            }
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