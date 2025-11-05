

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import Button from './ui/Button';
import { Input } from './ui/Input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/Tabs';
import PriceChart from './PriceChart';
import { useBitcoinPrice } from '../hooks/useBitcoinPrice';
import { usePortfolio } from '../hooks/usePortfolio';
import PriceChange from './PriceChange';
import { useTranslation } from 'react-i18next';
import { Tooltip } from './ui/Tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/Dialog';
import { cn } from '../lib/utils';

interface TradeDetails {
    mode: 'buy' | 'sell';
    // For 'buy', amount is USD. For 'sell', amount is BTC.
    amount: number;
    // The calculated counterpart value.
    calculatedValue: number;
    price: number;
}

const TradePanel: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('buy');
  const [amount, setAmount] = useState('');
  const [tradeDetails, setTradeDetails] = useState<TradeDetails | null>(null);
  const { currentPrice } = useBitcoinPrice();
  const { portfolio, buyBtc, sellBtc } = usePortfolio();

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const initiateTrade = () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0 || !currentPrice) return;

    setTradeDetails({
      mode: activeTab as 'buy' | 'sell',
      amount: numericAmount,
      calculatedValue: calculatedValue,
      price: currentPrice
    });
  };

  const confirmTrade = () => {
    if (!tradeDetails) return;
    
    if (tradeDetails.mode === 'buy') {
      buyBtc(tradeDetails.amount, tradeDetails.price);
    } else {
      sellBtc(tradeDetails.amount, tradeDetails.price);
    }
    setAmount('');
    setTradeDetails(null); // Close modal
  };
  
  const handleMaxClick = () => {
    if (activeTab === 'buy') {
      setAmount(portfolio.usdBalance.toFixed(2));
    } else {
      setAmount(portfolio.btcBalance.toFixed(8));
    }
  };

  const calculatedValue = currentPrice && amount ? (activeTab === 'buy' ? parseFloat(amount) / currentPrice : parseFloat(amount) * currentPrice) : 0;
  
  const insufficientFunds = activeTab === 'buy' 
    ? (amount ? parseFloat(amount) > portfolio.usdBalance : false)
    : (amount ? parseFloat(amount) > portfolio.btcBalance : false);

  const isTradeDisabled = !amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0 || insufficientFunds || !currentPrice;

  const formatCalculatedValue = (value: number) => {
    if (activeTab === 'buy') {
      return `${value.toLocaleString(undefined, { minimumFractionDigits: 8, maximumFractionDigits: 8 })} BTC`;
    }
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };
  
  const renderTradeForm = (mode: 'buy' | 'sell') => {
    const tradeTooltipText = isTradeDisabled
        ? t('tradePanel.tooltips.tradeDisabled')
        : (mode === 'buy' ? t('tradePanel.tooltips.buyConfirm') : t('tradePanel.tooltips.sellConfirm'));

    return (
        <div className="space-y-4 pt-4">
        <div className="space-y-2">
            <label className="text-sm font-medium leading-none">
                {t('tradePanel.amountIn', { currency: mode === 'buy' ? 'USD' : 'BTC' })}
            </label>
            <div className="relative">
            <Tooltip text={t('tradePanel.tooltips.amountInput')} position="bottom" wrapperClassName="w-full">
              <Input 
                type="text"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0.00"
              />
            </Tooltip>
            <Tooltip text={t('tradePanel.tooltips.max')} position="left">
              <Button
                onClick={handleMaxClick}
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7"
              >
                {t('tradePanel.max')}
              </Button>
            </Tooltip>
            </div>
        </div>
        <div className="space-y-1 rounded-lg border border-border/50 bg-background/50 py-4 text-center transition-all duration-300">
            <p className="text-sm text-muted-foreground">
            {mode === 'buy' ? t('tradePanel.youWillGet') : t('tradePanel.youWillReceive')}:
            </p>
            <p className="text-2xl font-bold text-primary">
            {formatCalculatedValue(calculatedValue)}
            </p>
        </div>
        <Tooltip text={tradeTooltipText} wrapperClassName="w-full">
            <span className="block w-full"> {/* Wrapper needed for tooltip on disabled button */}
                <Button
                    onClick={initiateTrade}
                    className={cn(
                        "w-full text-lg transition-transform duration-200 ease-in-out hover:scale-[1.02] active:scale-[0.98]",
                        // Override background colors for a clear buy/sell indication
                        mode === 'buy' && !insufficientFunds && "bg-brand-green text-white hover:bg-brand-green/90",
                        mode === 'sell' && !insufficientFunds && "bg-brand-red text-white hover:bg-brand-red/90"
                    )}
                    disabled={isTradeDisabled}
                    // We set a base variant, which gets overridden by className for buy/sell actions
                    variant={insufficientFunds ? "secondary" : "default"}
                >
                    {insufficientFunds ? t('tradePanel.insufficientFunds') : (mode === 'buy' ? t('tradePanel.buyBtc') : t('tradePanel.sellBtc'))}
                </Button>
            </span>
        </Tooltip>
        </div>
    );
  }
  
  const renderConfirmationModal = () => {
    if (!tradeDetails) return null;
    
    const isBuy = tradeDetails.mode === 'buy';
    const amountLabel = isBuy ? t('tradePanel.amountIn', { currency: 'USD' }) : t('tradePanel.amountIn', { currency: 'BTC' });
    const totalLabel = isBuy ? t('tradePanel.youWillGet') : t('tradePanel.youWillReceive');
    
    return (
        <Dialog open={!!tradeDetails} onOpenChange={(isOpen) => !isOpen && setTradeDetails(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('tradePanel.confirmation.title')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">{t('tradePanel.confirmation.action')}</span>
                        <span className={`font-bold text-lg ${isBuy ? 'text-brand-green' : 'text-brand-red'}`}>
                          {isBuy ? t('common.buy') : t('common.sell')}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">{t('tradePanel.confirmation.price')}</span>
                        <span className="font-mono">${tradeDetails.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center border-t pt-4">
                        <span className="text-muted-foreground">{amountLabel}</span>
                        <span className="font-mono font-bold text-lg">
                            {isBuy
                                ? tradeDetails.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
                                : `${tradeDetails.amount.toFixed(8)} BTC`
                            }
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">{totalLabel}</span>
                        <span className="font-mono font-bold text-lg">
                            {isBuy
                                ? `${tradeDetails.calculatedValue.toFixed(8)} BTC`
                                : tradeDetails.calculatedValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
                            }
                        </span>
                    </div>
                </div>
                <div className="flex justify-end gap-4 pt-4">
                    <Button variant="outline" onClick={() => setTradeDetails(null)}>
                        {t('common.cancel')}
                    </Button>
                    <Button onClick={confirmTrade} variant={isBuy ? 'default' : 'destructive'}>
                        {t('common.confirm')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
              <CardTitle>{t('tradePanel.title')}</CardTitle>
              <div className="text-right">
                  <p className="text-sm text-muted-foreground">{t('tradePanel.currentPrice')}</p>
                  <p className="text-2xl font-semibold">{currentPrice ? `$${currentPrice.toLocaleString()}` : t('dashboard.loading')}</p>
                  <PriceChange />
              </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* The negative margin pulls the chart to the edges of the card, overriding the CardContent padding */}
          <div className="-mx-4 md:-mx-6">
              <PriceChart />
          </div>
          <div className="mt-6 border-t pt-6">
            <Tabs defaultValue="buy" onValueChange={(value) => { setActiveTab(value); setAmount(''); }} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger 
                    value="buy"
                    className="data-[state=active]:bg-brand-green/10 data-[state=active]:text-brand-green data-[state=active]:shadow-inner"
                >
                    {t('tradePanel.buyTab')}
                </TabsTrigger>
                <TabsTrigger 
                    value="sell"
                    className="data-[state=active]:bg-brand-red/10 data-[state=active]:text-brand-red data-[state=active]:shadow-inner"
                >
                    {t('tradePanel.sellTab')}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="buy">
                {renderTradeForm('buy')}
              </TabsContent>
              <TabsContent value="sell">
                {renderTradeForm('sell')}
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
      {renderConfirmationModal()}
    </>
  );
};

export default TradePanel;