"use client";

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

const TradePanel: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('buy');
  const [amount, setAmount] = useState('');
  const { currentPrice } = useBitcoinPrice();
  const { portfolio, buyBtc, sellBtc } = usePortfolio();

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleTrade = () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0 || !currentPrice) return;

    if (activeTab === 'buy') {
      buyBtc(numericAmount, currentPrice);
    } else {
      sellBtc(numericAmount, currentPrice);
    }
    setAmount('');
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
  
  const renderTradeForm = (mode: 'buy' | 'sell') => (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none">
            {t('tradePanel.amountIn', { currency: mode === 'buy' ? 'USD' : 'BTC' })}
        </label>
        <div className="relative">
          <Input 
            type="text"
            value={amount}
            onChange={handleAmountChange}
            placeholder="0.00"
          />
          <Button
            onClick={handleMaxClick}
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7"
          >
            {t('tradePanel.max')}
          </Button>
        </div>
      </div>
      <div className="space-y-1 rounded-md border border-border bg-muted/20 py-4 text-center">
        <p className="text-sm text-muted-foreground">
          {mode === 'buy' ? t('tradePanel.youWillGet') : t('tradePanel.youWillReceive')}:
        </p>
        <p className="text-lg font-bold text-foreground">
          {formatCalculatedValue(calculatedValue)}
        </p>
      </div>
      <Button 
        onClick={handleTrade}
        className="w-full text-lg"
        disabled={isTradeDisabled}
        variant={insufficientFunds ? "secondary" : (mode === 'buy' ? 'default' : 'destructive')}
      >
        {insufficientFunds ? t('tradePanel.insufficientFunds') : (mode === 'buy' ? t('tradePanel.buyBtc') : t('tradePanel.sellBtc'))}
      </Button>
    </div>
  );

  return (
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
        <div className="-mx-6">
            <PriceChart />
        </div>
        <div className="mt-6 border-t pt-6">
          <Tabs defaultValue="buy" onValueChange={(value) => { setActiveTab(value); setAmount(''); }} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="buy">{t('tradePanel.buyTab')}</TabsTrigger>
              <TabsTrigger value="sell">{t('tradePanel.sellTab')}</TabsTrigger>
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
  );
};

export default TradePanel;
