
import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { usePortfolio } from '../hooks/usePortfolio';
import { Transaction, TransactionType } from '../types';
import TransactionDetailModal from './TransactionDetailModal';
import { useTranslation } from 'react-i18next';
import { Tooltip } from './ui/Tooltip';
import Button from './ui/Button';
import { Input } from './ui/Input';
import { cn } from '../lib/utils';

const TransactionRow: React.FC<{ tx: Transaction; onClick: () => void }> = ({ tx, onClick }) => {
  const { t } = useTranslation();
  const isBuy = tx.type === TransactionType.BUY;
  return (
    <Tooltip text={t('transactionHistory.tooltips.viewDetails')} position="left" wrapperClassName="w-full">
      <div 
        onClick={onClick}
        className="grid grid-cols-3 gap-2 py-2 md:py-3 border-b border-border text-sm cursor-pointer hover:bg-accent transition-colors duration-150 w-full"
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
    </Tooltip>
  );
};

const TransactionHistory: React.FC = () => {
  const { t } = useTranslation();
  const { portfolio } = usePortfolio();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // State for filters
  const [filterType, setFilterType] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const handleRowClick = useCallback((tx: Transaction) => {
    setSelectedTransaction(tx);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedTransaction(null);
  }, []);

  const handleClearFilters = () => {
    setFilterType('ALL');
    setStartDate('');
    setEndDate('');
  };

  const filteredTransactions = useMemo(() => {
    return portfolio.transactions.filter(tx => {
      // Type filter
      if (filterType !== 'ALL' && tx.type !== filterType) {
        return false;
      }
      
      // Date filter
      const txDate = tx.date;
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0); // Compare from the beginning of the selected day
        if (txDate < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Compare until the end of the selected day
        if (txDate > end) return false;
      }

      return true;
    });
  }, [portfolio.transactions, filterType, startDate, endDate]);

  const areFiltersActive = filterType !== 'ALL' || startDate !== '' || endDate !== '';

  return (
    <>
      <Card>
        <CardHeader>
            <CardTitle>{t('transactionHistory.title')}</CardTitle>
            {/* Filter Controls */}
            <div className="pt-4 border-t mt-4">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                {/* Left side filters */}
                <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                  
                  {/* Type Filter */}
                  <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-muted-foreground">{t('transactionHistory.filters.type')}</label>
                      <div className="flex items-center gap-1 bg-muted p-1 rounded-md">
                          {(['ALL', 'BUY', 'SELL'] as const).map(type => (
                              <Button 
                                  key={type}
                                  onClick={() => setFilterType(type)}
                                  variant={filterType === type ? 'default' : 'ghost'}
                                  size="sm"
                                  className={cn("capitalize px-3 h-8", {
                                    'bg-background text-foreground hover:bg-background/90': filterType === type
                                  })}
                              >
                                  {t(`transactionHistory.filters.${type.toLowerCase()}`)}
                              </Button>
                          ))}
                      </div>
                  </div>

                  {/* Date Filters */}
                  <div className="flex items-end gap-2">
                      <div className="flex flex-col gap-2 flex-1 min-w-0">
                          <label htmlFor="start-date" className="text-xs font-semibold text-muted-foreground">{t('transactionHistory.filters.startDate')}</label>
                          <Input id="start-date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                      </div>
                      <div className="flex flex-col gap-2 flex-1 min-w-0">
                          <label htmlFor="end-date" className="text-xs font-semibold text-muted-foreground">{t('transactionHistory.filters.endDate')}</label>
                          <Input id="end-date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                      </div>
                  </div>
                </div>

                {/* Right side clear button */}
                <div className="flex-shrink-0">
                  {areFiltersActive && (
                    <Button onClick={handleClearFilters} variant="ghost" size="sm">
                        {t('transactionHistory.filters.clear')}
                    </Button>
                  )}
                </div>
              </div>
            </div>
        </CardHeader>
        <CardContent>
          {portfolio.transactions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">{t('transactionHistory.noTransactions')}</p>
          ) : filteredTransactions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">{t('transactionHistory.noMatch')}</p>
          ) : (
            <div>
              <div className="grid grid-cols-3 gap-2 pb-2 text-xs text-muted-foreground font-bold uppercase sticky top-0 bg-card z-10 py-2">
                <span>{t('transactionHistory.type')}</span>
                <span className="text-right">{t('transactionHistory.amount')}</span>
                <span className="text-right">{t('transactionHistory.value')}</span>
              </div>
              {filteredTransactions.map(tx => (
                <TransactionRow key={tx.id} tx={tx} onClick={() => handleRowClick(tx)} />
              ))}
            </div>
          )}
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
