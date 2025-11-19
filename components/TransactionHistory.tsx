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
    <div 
      onClick={onClick}
      className="grid grid-cols-3 gap-2 py-3 px-3 border-b border-zinc-800/50 text-sm cursor-pointer hover:bg-zinc-800/50 transition-colors duration-150 w-full last:border-0"
    >
      <div className="flex flex-col justify-center">
        <span className={cn("font-bold text-xs uppercase px-2 py-0.5 rounded-sm w-fit mb-1", isBuy ? 'bg-brand-green/20 text-brand-green' : 'bg-brand-red/20 text-brand-red')}>
          {isBuy ? t('common.buy') : t('common.sell')}
        </span>
        <p className="text-[10px] text-zinc-500">{tx.date.toLocaleTimeString()}</p>
      </div>
      <div className="text-right flex flex-col justify-center">
        <p className="font-mono text-zinc-200">{tx.btcAmount.toFixed(6)} <span className="text-zinc-500 text-[10px]">BTC</span></p>
        <p className="text-[10px] text-zinc-500">@ ${tx.priceAtTransaction.toLocaleString()}</p>
      </div>
      <div className="text-right flex flex-col justify-center">
         <span className="font-mono font-semibold text-zinc-100">
            ${tx.usdAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
         </span>
      </div>
    </div>
  );
};

const TransactionHistory: React.FC = () => {
  const { t } = useTranslation();
  const { portfolio } = usePortfolio();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

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
      if (filterType !== 'ALL' && tx.type !== filterType) {
        return false;
      }
      
      const txDate = tx.date;
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (txDate < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); 
        if (txDate > end) return false;
      }

      return true;
    });
  }, [portfolio.transactions, filterType, startDate, endDate]);

  const areFiltersActive = filterType !== 'ALL' || startDate !== '' || endDate !== '';

  return (
    <>
      <Card className="h-full flex flex-col border-zinc-800 bg-zinc-900/50">
        <CardHeader className="py-4 border-b border-zinc-800/50">
            <CardTitle className="text-base">{t('transactionHistory.title')}</CardTitle>
            
            <div className="pt-4 mt-2">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                    {(['ALL', 'BUY', 'SELL'] as const).map(type => (
                        <Button 
                            key={type}
                            onClick={() => setFilterType(type)}
                            variant="ghost"
                            size="sm"
                            className={cn("flex-1 text-xs h-7 rounded-md hover:bg-zinc-800 hover:text-white", {
                              'bg-zinc-800 text-white shadow-sm': filterType === type,
                              'text-zinc-400': filterType !== type
                            })}
                        >
                            {t(`transactionHistory.filters.${type.toLowerCase()}`)}
                        </Button>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <Input 
                        type="date" 
                        value={startDate} 
                        onChange={e => setStartDate(e.target.value)} 
                        className="h-8 text-xs bg-zinc-950 border-zinc-800"
                    />
                    <Input 
                        type="date" 
                        value={endDate} 
                        onChange={e => setEndDate(e.target.value)} 
                        className="h-8 text-xs bg-zinc-950 border-zinc-800"
                    />
                </div>
                
                {areFiltersActive && (
                   <Button onClick={handleClearFilters} variant="ghost" size="sm" className="h-6 text-xs text-zinc-400 hover:text-white -mt-1">
                        {t('transactionHistory.filters.clear')}
                    </Button>
                )}
              </div>
            </div>
        </CardHeader>
        <CardContent className="flex-1 p-0 flex flex-col min-h-[300px]">
          {portfolio.transactions.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">{t('transactionHistory.noTransactions')}</div>
          ) : filteredTransactions.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">{t('transactionHistory.noMatch')}</div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="grid grid-cols-3 gap-2 px-4 py-2 text-xs font-semibold text-muted-foreground bg-zinc-950/30 uppercase tracking-wider border-b border-zinc-800/50">
                <span>{t('transactionHistory.type')}</span>
                <span className="text-right">{t('transactionHistory.amount')}</span>
                <span className="text-right">{t('transactionHistory.value')}</span>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {filteredTransactions.map(tx => (
                    <TransactionRow key={tx.id} tx={tx} onClick={() => handleRowClick(tx)} />
                  ))}
              </div>
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