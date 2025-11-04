"use client";

import React, { useState, createContext, useContext, useCallback, ReactNode, useMemo, useEffect, useRef } from 'react';
import { Portfolio, Transaction, TransactionType } from '../types';
import { INITIAL_USD_BALANCE } from '../constants';
import { getPortfolio, savePortfolio } from '../services/db';

interface PortfolioContextType {
  portfolio: Portfolio;
  buyBtc: (usdAmount: number, currentPrice: number) => void;
  sellBtc: (btcAmount: number, currentPrice: number) => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider = ({ children }: { children: ReactNode }) => {
  const [portfolio, setPortfolio] = useState<Portfolio>({
    usdBalance: INITIAL_USD_BALANCE,
    btcBalance: 0,
    transactions: [],
  });

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


  const buyBtc = useCallback((usdAmount: number, currentPrice: number) => {
    if (usdAmount <= 0) return;

    const btcToBuy = usdAmount / currentPrice;
    setPortfolio(prev => {
      if (prev.usdBalance < usdAmount) {
        console.error("Attempted to buy with insufficient USD balance.");
        return prev; // Return previous state if funds are insufficient
      }

      const newTransaction: Transaction = {
        id: new Date().toISOString() + Math.random(),
        type: TransactionType.BUY,
        date: new Date(),
        btcAmount: btcToBuy,
        usdAmount,
        priceAtTransaction: currentPrice,
      };

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
        console.error("Attempted to sell with insufficient BTC balance.");
        return prev; // Return previous state if funds are insufficient
      }

      const newTransaction: Transaction = {
        id: new Date().toISOString() + Math.random(),
        type: TransactionType.SELL,
        date: new Date(),
        btcAmount,
        usdAmount: usdToGain,
        priceAtTransaction: currentPrice,
      };

      return {
        ...prev,
        btcBalance: prev.btcBalance - btcAmount,
        usdBalance: prev.usdBalance + usdToGain,
        transactions: [newTransaction, ...prev.transactions],
      };
    });
  }, []);

  const value = useMemo(() => ({ portfolio, buyBtc, sellBtc }), [portfolio, buyBtc, sellBtc]);

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
