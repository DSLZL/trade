"use client";

import React, { useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/Dialog';
import { Transaction, TransactionType } from '../types';
import { useTranslation } from 'react-i18next';

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

const DetailRow: React.FC<{ label: string; value: string | number; className?: string }> = ({ label, value, className = '' }) => (
  <div className="flex justify-between py-3 border-b">
    <span className="text-muted-foreground">{label}</span>
    <span className={`font-semibold text-foreground ${className}`}>{value}</span>
  </div>
);

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({ isOpen, onClose, transaction }) => {
  const { t } = useTranslation();

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      onClose();
    }
  }, [onClose]);

  if (!transaction) return null;

  const isBuy = transaction.type === TransactionType.BUY;
  const typeClassName = isBuy ? 'text-brand-green' : 'text-brand-red';
  const typeString = isBuy ? t('common.buy') : t('common.sell');

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('transactionDetailModal.title')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-1 text-sm">
          <DetailRow label={t('transactionDetailModal.id')} value={transaction.id.substring(0, 18) + '...'} />
          <DetailRow label={t('transactionDetailModal.type')} value={typeString} className={typeClassName} />
          <DetailRow label={t('transactionDetailModal.date')} value={transaction.date.toLocaleDateString()} />
          <DetailRow label={t('transactionDetailModal.time')} value={transaction.date.toLocaleTimeString()} />
          <DetailRow label={t('transactionDetailModal.pricePerBtc')} value={`$${transaction.priceAtTransaction.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} />
          <DetailRow label={t('transactionDetailModal.btcAmount')} value={`${transaction.btcAmount.toFixed(8)} BTC`} />
          <DetailRow label={t('transactionDetailModal.totalUsdValue')} value={`$${transaction.usdAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDetailModal;
