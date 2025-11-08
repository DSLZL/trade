import React, { useState, createContext, useContext, useCallback, ReactNode, useMemo, useEffect, useRef } from 'react';
import { Portfolio, Transaction, TransactionType, Loan } from '../types';
import { INITIAL_USD_BALANCE, LOAN_APR, MAX_LOAN_MULTIPLIER } from '../constants';
import { getPortfolio, savePortfolio } from '../services/db';

interface Notification {
  messageKey: string;
  // Fix: Changed payload type from `object` to `Record<string, any>`.
  // The `i18next` `t` function requires an object with a string index signature for interpolation.
  // The generic `object` type does not have this, which was causing a TypeScript error.
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

// FIX: Changed component signature to use React.FC to fix typing issue in App.tsx
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
          // BUG FIX: Date object reconstruction is now handled by the getPortfolio service.
          // This simplifies the hook and improves separation of concerns.
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
  
  const takeLoan = useCallback((amount: number, periodDays: number) => {
    setPortfolio(prev => {
        if (prev.loan) {
            setNotification({ messageKey: 'bank.notifications.loanExists', type: 'error' });
            return prev;
        }

        const ownedUsd = prev.usdBalance;
        const maxLoan = ownedUsd * MAX_LOAN_MULTIPLIER;

        if (amount <= 0 || amount > maxLoan) {
            setNotification({ messageKey: 'bank.notifications.loanTooHigh', type: 'error' });
            return prev;
        }

        const loanDate = new Date();
        const dueDate = new Date(loanDate);
        dueDate.setDate(dueDate.getDate() + periodDays);

        const newLoan: Loan = {
            principal: amount,
            interestRate: LOAN_APR,
            loanDate,
            dueDate,
            repaymentPeriodDays: periodDays,
        };

        setNotification({
            messageKey: 'bank.notifications.loanTaken',
            payload: { amount: amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) },
            type: 'success',
        });

        return {
            ...prev,
            usdBalance: prev.usdBalance + amount,
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
        let totalRepayment = prev.loan.principal + interest;

        // Round to the nearest cent for financial accuracy
        totalRepayment = Math.round(totalRepayment * 100) / 100;

        if (prev.usdBalance < totalRepayment) {
            setNotification({ messageKey: 'bank.notifications.repayInsufficientFunds', type: 'error' });
            return prev;
        }

        setNotification({
            messageKey: 'bank.notifications.loanRepaid',
            type: 'success',
        });

        return {
            ...prev,
            usdBalance: prev.usdBalance - totalRepayment,
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
        
        // Round due amount to the nearest cent first
        totalDueAtTerm = Math.round(totalDueAtTerm * 100) / 100;

        let penaltyAmount = totalDueAtTerm * 1.25;
        // Round the final penalty amount to the nearest cent
        penaltyAmount = Math.round(penaltyAmount * 100) / 100;


        setNotification({
            messageKey: 'bank.notifications.loanOverduePenalty',
            payload: { amount: penaltyAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) },
            type: 'error',
        });

        return {
            ...prev,
            usdBalance: prev.usdBalance - penaltyAmount,
            loan: null,
        };
    });
  }, []);

  // Effect for checking loan status (due date reminders and penalties)
  useEffect(() => {
    if (!portfolio.loan) {
        dueSoonNotified.current = false; // Reset flag when loan is cleared
        return;
    }

    const checkLoanStatus = () => {
        // This function will check the current loan from the component's state.
        // The effect dependency on `portfolio.loan` ensures we always have the latest loan data.
        const loan = portfolio.loan;
        if (!loan) return;

        const now = new Date();
        const dueDate = loan.dueDate;

        // Check if overdue
        if (now > dueDate) {
            applyLoanPenalty(); // This will clear the loan and trigger effect cleanup
            return;
        }

        // Check for reminder (due in less than 24 hours)
        const timeUntilDue = dueDate.getTime() - now.getTime();
        const oneDayInMillis = 24 * 60 * 60 * 1000;

        if (timeUntilDue > 0 && timeUntilDue < oneDayInMillis && !dueSoonNotified.current) {
            dueSoonNotified.current = true; // Set flag to prevent repeated notifications
            setNotification({
                messageKey: 'bank.notifications.loanDueSoon',
                type: 'warning',
            });
        }
    };
    
    // Check status immediately when the loan data changes, then set an interval
    checkLoanStatus();
    const intervalId = setInterval(checkLoanStatus, 60 * 1000); // Check every minute

    // Cleanup function: this runs when the component unmounts or when portfolio.loan changes
    return () => {
        clearInterval(intervalId);
    };
  }, [portfolio.loan, applyLoanPenalty]);


  const value = useMemo(() => ({ portfolio, buyBtc, sellBtc, takeLoan, repayLoan, notification, clearNotification }), [portfolio, buyBtc, sellBtc, takeLoan, repayLoan, notification, clearNotification]);

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