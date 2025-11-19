import React, { useState, createContext, useContext, useCallback, ReactNode, useMemo, useEffect, useRef } from 'react';
import { Portfolio, Transaction, TransactionType, Loan } from '../types';
import { INITIAL_USD_BALANCE, LOAN_APR, MAX_LOAN_MULTIPLIER } from '../constants';
import { getPortfolio, savePortfolio } from '../services/db';

interface Notification {
  messageKey: string;
  payload?: Record<string, any>;
  type: 'success' | 'error' | 'warning';
}

interface PortfolioContextType {
  portfolio: Portfolio;
  buyBtc: (usdAmount: number, currentPrice: number) => void;
  sellBtc: (btcAmount: number, currentPrice: number) => void;
  takeLoan: (amount: number, periodDays: number) => void;
  repayLoan: () => void;
  notification: Notification | null;
  clearNotification: () => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

// Helper for USD precision (2 decimals)
const roundUsd = (amount: number) => Math.round(amount * 100) / 100;
// Helper for BTC precision (8 decimals)
const roundBtc = (amount: number) => Math.round(amount * 100000000) / 100000000;

export const PortfolioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [portfolio, setPortfolio] = useState<Portfolio>({
    usdBalance: INITIAL_USD_BALANCE,
    btcBalance: 0,
    transactions: [],
    loan: null,
  });
  const [notification, setNotification] = useState<Notification | null>(null);

  const hasLoaded = useRef(false);
  const dueSoonNotified = useRef(false);

  // Load data from IndexedDB on initial component mount.
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedPortfolio = await getPortfolio();
        if (savedPortfolio) {
          setPortfolio(savedPortfolio);
        }
      } catch (error) {
        console.error("Failed to load portfolio from IndexedDB:", error);
      } finally {
        hasLoaded.current = true;
      }
    };

    loadData();
  }, []);

  // Save portfolio to IndexedDB whenever it changes.
  useEffect(() => {
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

    // Use precise math for checking balance
    const safeUsdAmount = roundUsd(usdAmount);

    setPortfolio(prev => {
      // Floating point safety check
      if (roundUsd(prev.usdBalance) < safeUsdAmount) {
        setNotification({ messageKey: 'notifications.insufficientUsd', type: 'error' });
        return prev;
      }

      const btcToBuy = roundBtc(safeUsdAmount / currentPrice);

      const newTransaction: Transaction = {
        id: new Date().toISOString() + Math.random(),
        type: TransactionType.BUY,
        date: new Date(),
        btcAmount: btcToBuy,
        usdAmount: safeUsdAmount,
        priceAtTransaction: currentPrice,
      };

      setNotification({
        messageKey: 'notifications.buySuccess',
        payload: { amount: btcToBuy.toFixed(8), currency: 'BTC' },
        type: 'success',
      });

      return {
        ...prev,
        usdBalance: roundUsd(prev.usdBalance - safeUsdAmount),
        btcBalance: roundBtc(prev.btcBalance + btcToBuy),
        transactions: [newTransaction, ...prev.transactions],
      };
    });
  }, []);

  const sellBtc = useCallback((btcAmount: number, currentPrice: number) => {
    if (btcAmount <= 0) return;

    const safeBtcAmount = roundBtc(btcAmount);

    setPortfolio(prev => {
      if (roundBtc(prev.btcBalance) < safeBtcAmount) {
        setNotification({ messageKey: 'notifications.insufficientBtc', type: 'error' });
        return prev;
      }

      const usdToGain = roundUsd(safeBtcAmount * currentPrice);

      const newTransaction: Transaction = {
        id: new Date().toISOString() + Math.random(),
        type: TransactionType.SELL,
        date: new Date(),
        btcAmount: safeBtcAmount,
        usdAmount: usdToGain,
        priceAtTransaction: currentPrice,
      };

      setNotification({
        messageKey: 'notifications.sellSuccess',
        payload: { amount: safeBtcAmount.toFixed(8), currency: 'BTC' },
        type: 'success',
      });

      return {
        ...prev,
        btcBalance: roundBtc(prev.btcBalance - safeBtcAmount),
        usdBalance: roundUsd(prev.usdBalance + usdToGain),
        transactions: [newTransaction, ...prev.transactions],
      };
    });
  }, []);
  
  const takeLoan = useCallback((amount: number, periodDays: number) => {
    setPortfolio(prev => {
        if (prev.loan) {
            setNotification({ messageKey: 'bank.notifications.loanExists', type: 'error' });
            return prev;
        }

        const ownedUsd = roundUsd(prev.usdBalance);
        const maxLoan = roundUsd(ownedUsd * MAX_LOAN_MULTIPLIER);
        const safeAmount = roundUsd(amount);

        // Allow a small epsilon for float comparison error on max check
        if (safeAmount <= 0 || safeAmount > (maxLoan + 0.01)) {
            setNotification({ messageKey: 'bank.notifications.loanTooHigh', type: 'error' });
            return prev;
        }

        const loanDate = new Date();
        const dueDate = new Date(loanDate);
        dueDate.setDate(dueDate.getDate() + periodDays);

        const newLoan: Loan = {
            principal: safeAmount,
            interestRate: LOAN_APR,
            loanDate,
            dueDate,
            repaymentPeriodDays: periodDays,
        };

        setNotification({
            messageKey: 'bank.notifications.loanTaken',
            payload: { amount: safeAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) },
            type: 'success',
        });

        return {
            ...prev,
            usdBalance: roundUsd(prev.usdBalance + safeAmount),
            loan: newLoan,
        };
    });
  }, []);

  const repayLoan = useCallback(() => {
    setPortfolio(prev => {
        if (!prev.loan) return prev;

        const daysPassed = (new Date().getTime() - prev.loan.loanDate.getTime()) / (1000 * 3600 * 24);
        const yearsPassed = daysPassed / 365;
        const interest = prev.loan.principal * prev.loan.interestRate * yearsPassed;
        
        // Calculate total and round strictly to cents
        const totalRepayment = roundUsd(prev.loan.principal + interest);

        // Comparison with slight epsilon tolerance for floating point oddities
        if (roundUsd(prev.usdBalance) < totalRepayment) {
            setNotification({ messageKey: 'bank.notifications.repayInsufficientFunds', type: 'error' });
            return prev;
        }

        setNotification({
            messageKey: 'bank.notifications.loanRepaid',
            type: 'success',
        });

        return {
            ...prev,
            usdBalance: roundUsd(prev.usdBalance - totalRepayment),
            loan: null,
        };
    });
  }, []);
  
  const applyLoanPenalty = useCallback(() => {
    setPortfolio(prev => {
        if (!prev.loan) return prev;

        const years = prev.loan.repaymentPeriodDays / 365;
        const interest = prev.loan.principal * prev.loan.interestRate * years;
        let totalDueAtTerm = prev.loan.principal + interest;
        
        totalDueAtTerm = roundUsd(totalDueAtTerm);
        const penaltyAmount = roundUsd(totalDueAtTerm * 1.25);

        setNotification({
            messageKey: 'bank.notifications.loanOverduePenalty',
            payload: { amount: penaltyAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) },
            type: 'error',
        });

        return {
            ...prev,
            usdBalance: roundUsd(prev.usdBalance - penaltyAmount),
            loan: null,
        };
    });
  }, []);

  // Effect for checking loan status
  useEffect(() => {
    if (!portfolio.loan) {
        dueSoonNotified.current = false;
        return;
    }

    const checkLoanStatus = () => {
        const loan = portfolio.loan;
        if (!loan) return;

        const now = new Date();
        const dueDate = loan.dueDate;

        // Check if overdue
        if (now > dueDate) {
            applyLoanPenalty();
            return;
        }

        // Check for reminder (due in less than 24 hours)
        const timeUntilDue = dueDate.getTime() - now.getTime();
        const oneDayInMillis = 24 * 60 * 60 * 1000;

        if (timeUntilDue > 0 && timeUntilDue < oneDayInMillis && !dueSoonNotified.current) {
            dueSoonNotified.current = true;
            setNotification({
                messageKey: 'bank.notifications.loanDueSoon',
                type: 'warning',
            });
        }
    };
    
    checkLoanStatus();
    const intervalId = setInterval(checkLoanStatus, 60 * 1000);

    return () => {
        clearInterval(intervalId);
    };
  }, [portfolio.loan, applyLoanPenalty]);


  const value = useMemo(() => ({ portfolio, buyBtc, sellBtc, takeLoan, repayLoan, notification, clearNotification }), [portfolio, buyBtc, sellBtc, takeLoan, repayLoan, notification, clearNotification]);

  return React.createElement(PortfolioContext.Provider, { value: value }, children);
};

export const usePortfolio = (): PortfolioContextType => {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};