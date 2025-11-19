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
    amount: number;
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
    setTradeDetails(null); 
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
        <div className="space-y-6 mt-6">
        <div className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground">
                {t('tradePanel.amountIn', { currency: mode === 'buy' ? 'USD' : 'BTC' })}
            </label>
            <div className="relative">
            <Tooltip text={t('tradePanel.tooltips.amountInput')} position="bottom" wrapperClassName="w-full">
              <Input 
                type="text"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0.00"
                className="pr-16 h-12 text-lg bg-zinc-950/50 border-zinc-800 focus:border-brand-blue/50 focus:ring-brand-blue/20"
              />
            </Tooltip>
            <Tooltip text={t('tradePanel.tooltips.max')} position="left">
              <Button
                onClick={handleMaxClick}
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 text-xs font-bold text-brand-blue hover:text-brand-blue/80 hover:bg-brand-blue/10"
              >
                {t('tradePanel.max')}
              </Button>
            </Tooltip>
            </div>
        </div>
        
        <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                {mode === 'buy' ? t('tradePanel.youWillGet') : t('tradePanel.youWillReceive')}
            </p>
            <p className="text-2xl font-bold tracking-tight text-foreground">
                {formatCalculatedValue(calculatedValue)}
            </p>
        </div>

        <Tooltip text={tradeTooltipText} wrapperClassName="w-full">
            <span className="block w-full">
                <Button
                    onClick={initiateTrade}
                    className={cn(
                        "w-full h-12 text-lg font-semibold shadow-lg transition-all duration-200",
                        mode === 'buy' && !insufficientFunds && "bg-brand-green hover:bg-brand-green/90 shadow-brand-green/20",
                        mode === 'sell' && !insufficientFunds && "bg-brand-red hover:bg-brand-red/90 shadow-brand-red/20",
                        insufficientFunds && "opacity-50 cursor-not-allowed bg-zinc-800 text-zinc-400 hover:bg-zinc-800"
                    )}
                    disabled={isTradeDisabled}
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
                <div className="space-y-4 py-2">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                        <span className="text-sm text-muted-foreground">{t('tradePanel.confirmation.action')}</span>
                        <span className={`font-bold text-lg ${isBuy ? 'text-brand-green' : 'text-brand-red'}`}>
                          {isBuy ? t('common.buy') : t('common.sell')}
                        </span>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">{t('tradePanel.confirmation.price')}</span>
                            <span className="font-mono text-foreground">${tradeDetails.price.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">{amountLabel}</span>
                            <span className="font-mono text-foreground">
                                {isBuy
                                    ? tradeDetails.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
                                    : `${tradeDetails.amount.toFixed(8)} BTC`
                                }
                            </span>
                        </div>
                        <div className="h-px bg-border my-2"></div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">{totalLabel}</span>
                            <span className="font-mono font-bold text-xl text-brand-blue">
                                {isBuy
                                    ? `${tradeDetails.calculatedValue.toFixed(8)} BTC`
                                    : tradeDetails.calculatedValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
                                }
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                    <Button variant="outline" onClick={() => setTradeDetails(null)}>
                        {t('common.cancel')}
                    </Button>
                    <Button onClick={confirmTrade} className={isBuy ? 'bg-brand-green hover:bg-brand-green/90' : 'bg-brand-red hover:bg-brand-red/90'}>
                        {t('common.confirm')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
  }

  return (
    <>
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
              <div>
                  <CardTitle className="text-2xl">{t('tradePanel.title')}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">BTC / USDT</p>
              </div>
              <div className="text-right">
                  <p className="text-2xl font-bold tracking-tight text-foreground">
                    {currentPrice ? `$${currentPrice.toLocaleString()}` : <span className="animate-pulse">---</span>}
                  </p>
                  <PriceChange />
              </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 rounded-lg overflow-hidden bg-zinc-950/30 border border-zinc-800/50 p-1">
             {/* Chart Container with subtle inset look */}
              <PriceChart />
          </div>
          
          <Tabs defaultValue="buy" onValueChange={(value) => { setActiveTab(value); setAmount(''); }} className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-zinc-950/50 border border-zinc-800 rounded-lg">
              <TabsTrigger 
                  value="buy"
                  className="rounded-md data-[state=active]:bg-brand-green data-[state=active]:text-white transition-all"
              >
                  {t('tradePanel.buyTab')}
              </TabsTrigger>
              <TabsTrigger 
                  value="sell"
                  className="rounded-md data-[state=active]:bg-brand-red data-[state=active]:text-white transition-all"
              >
                  {t('tradePanel.sellTab')}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="buy" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              {renderTradeForm('buy')}
            </TabsContent>
            <TabsContent value="sell" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              {renderTradeForm('sell')}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      {renderConfirmationModal()}
    </>
  );
};

export default TradePanel;