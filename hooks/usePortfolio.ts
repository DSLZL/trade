import React, { useState, createContext, useContext, useCallback, ReactNode, useMemo, useEffect, useRef } from 'react';
import { Portfolio, Transaction, TransactionType } from '../types';
import { INITIAL_USD_BALANCE } from '../constants';
import { getPortfolio, savePortfolio } from '../services/db';

interface Notification {
  messageKey: string;
  // Fix: Changed payload type from `object` to `Record<string, any>`.
  // The `i18next` `t` function requires an object with a string index signature for interpolation.
  // The generic `object` type does not have this, which was causing a TypeScript error.
  payload?: Record<string, any>;
  type: 'success' | 'error';
}

interface PortfolioContextType {
  portfolio: Portfolio;
  buyBtc: (usdAmount: number, currentPrice: number) => void;
  sellBtc: (btcAmount: number, currentPrice: number) => void;
  notification: Notification | null;
  clearNotification: () => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

// FIX: Changed component signature to use React.FC to fix typing issue in App.tsx
export const PortfolioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [portfolio, setPortfolio] = useState<Portfolio>({
    usdBalance: INITIAL_USD_BALANCE,
    btcBalance: 0,
    transactions: [],
  });
  const [notification, setNotification] = useState<Notification | null>(null);

  const hasLoaded = useRef(false);

  // Load data from IndexedDB on initial component mount.
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedPortfolio = await getPortfolio();
        if (savedPortfolio) {
          // Data from IndexedDB is plain JSON, so Date objects need to be reconstructed.
          savedPortfolio.transactions = savedPortfolio.transactions.map(tx => ({
            ...tx,
            date: new Date((tx.date as unknown) as string),
          }));
          setPortfolio(savedPortfolio);
        }
        // If no saved portfolio, the default initial state will be used and subsequently saved.
      } catch (error) {
        console.error("Failed to load portfolio from IndexedDB:", error);
      } finally {
        hasLoaded.current = true;
      }
    };

    loadData();
  }, []); // Empty dependency array ensures this runs only once.

  // Save portfolio to IndexedDB whenever it changes.
  useEffect(() => {
    // Do not save the initial default state before attempting to load from the DB.
    // The `hasLoaded` ref ensures we only start persisting after the load attempt is complete.
    if (!hasLoaded.current) {
      return;
    }

    savePortfolio(portfolio).catch(error => {
      console.error("Failed to save portfolio to IndexedDB:", error);
    });
  }, [portfolio]);

  const clearNotification = useCallback(() => {
    setNotification(null);
  }, []);

  const buyBtc = useCallback((usdAmount: number, currentPrice: number) => {
    if (usdAmount <= 0) return;

    const btcToBuy = usdAmount / currentPrice;
    setPortfolio(prev => {
      if (prev.usdBalance < usdAmount) {
        setNotification({ messageKey: 'notifications.insufficientUsd', type: 'error' });
        return prev;
      }

      const newTransaction: Transaction = {
        id: new Date().toISOString() + Math.random(),
        type: TransactionType.BUY,
        date: new Date(),
        btcAmount: btcToBuy,
        usdAmount,
        priceAtTransaction: currentPrice,
      };

      setNotification({
        messageKey: 'notifications.buySuccess',
        payload: { amount: btcToBuy.toFixed(8), currency: 'BTC' },
        type: 'success',
      });

      return {
        ...prev,
        usdBalance: prev.usdBalance - usdAmount,
        btcBalance: prev.btcBalance + btcToBuy,
        transactions: [newTransaction, ...prev.transactions],
      };
    });
  }, []);

  const sellBtc = useCallback((btcAmount: number, currentPrice: number) => {
    if (btcAmount <= 0) return;

    const usdToGain = btcAmount * currentPrice;
    setPortfolio(prev => {
      if (prev.btcBalance < btcAmount) {
        setNotification({ messageKey: 'notifications.insufficientBtc', type: 'error' });
        return prev;
      }

      const newTransaction: Transaction = {
        id: new Date().toISOString() + Math.random(),
        type: TransactionType.SELL,
        date: new Date(),
        btcAmount,
        usdAmount: usdToGain,
        priceAtTransaction: currentPrice,
      };

      setNotification({
        messageKey: 'notifications.sellSuccess',
        payload: { amount: btcAmount.toFixed(8), currency: 'BTC' },
        type: 'success',
      });

      return {
        ...prev,
        btcBalance: prev.btcBalance - btcAmount,
        usdBalance: prev.usdBalance + usdToGain,
        transactions: [newTransaction, ...prev.transactions],
      };
    });
  }, []);

  const value = useMemo(() => ({ portfolio, buyBtc, sellBtc, notification, clearNotification }), [portfolio, buyBtc, sellBtc, notification, clearNotification]);

  // Note: Using React.createElement is necessary here because this is a .ts file,
  // not a .tsx file, and therefore does not support JSX syntax.
  return React.createElement(PortfolioContext.Provider, { value: value }, children);
};

export const usePortfolio = (): PortfolioContextType => {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};
