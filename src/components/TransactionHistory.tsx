"use client";

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { usePortfolio } from '../hooks/usePortfolio';
import { Transaction, TransactionType } from '../types';
import TransactionDetailModal from './TransactionDetailModal';
import { useTranslation } from 'react-i18next';

const TransactionRow: React.FC<{ tx: Transaction; onClick: () => void }> = ({ tx, onClick }) => {
  const { t } = useTranslation();
  const isBuy = tx.type === TransactionType.BUY;
  return (
    <div 
      onClick={onClick}
      className="grid grid-cols-3 gap-2 py-3 border-b border-border text-sm cursor-pointer hover:bg-accent transition-colors duration-150"
    >
      <div>
        <span className={`font-semibold ${isBuy ? 'text-brand-green' : 'text-brand-red'}`}>
          {isBuy ? t('common.buy') : t('common.sell')}
        </span>
        <p className="text-muted-foreground">{tx.date.toLocaleTimeString()}</p>
      </div>
      <div className="text-right">
        <p className="font-mono">{tx.btcAmount.toFixed(6)} BTC</p>
        <p className="text-muted-foreground">@ ${tx.priceAtTransaction.toLocaleString()}</p>
      </div>
      <div className="text-right font-semibold font-mono">
        ${tx.usdAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
    </div>
  );
};

const TransactionHistory: React.FC = () => {
  const { t } = useTranslation();
  const { portfolio } = usePortfolio();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const handleRowClick = useCallback((tx: Transaction) => {
    setSelectedTransaction(tx);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedTransaction(null);
  }, []);

  return (
    <>
      <Card>
        <CardHeader>
            <CardTitle>{t('transactionHistory.title')}</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="max-h-[600px] lg:max-h-[calc(100vh-200px)] overflow-y-auto pr-2 -mr-2">
              {portfolio.transactions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">{t('transactionHistory.noTransactions')}</p>
              ) : (
                <div>
                  <div className="grid grid-cols-3 gap-2 pb-2 text-xs text-muted-foreground font-bold uppercase">
                    <span>{t('transactionHistory.type')}</span>
                    <span className="text-right">{t('transactionHistory.amount')}</span>
                    <span className="text-right">{t('transactionHistory.value')}</span>
                  </div>
                  {portfolio.transactions.map(tx => (
                    <TransactionRow key={tx.id} tx={tx} onClick={() => handleRowClick(tx)} />
                  ))}
                </div>
              )}
            </div>
        </CardContent>
      </Card>
      <TransactionDetailModal 
        transaction={selectedTransaction}
        isOpen={!!selectedTransaction}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default TransactionHistory;
