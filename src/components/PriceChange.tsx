"use client";

import React from 'react';
import { useBitcoinPrice } from '../hooks/useBitcoinPrice';
import { useTranslation } from 'react-i18next';

const PriceChange: React.FC = () => {
  const { t } = useTranslation();
  const { priceChange24h, priceChangePercent24h } = useBitcoinPrice();

  if (priceChange24h === null || priceChangePercent24h === null) {
    return <div className="h-5 text-sm text-gray-400 animate-pulse">{t('priceChange.calculating')}</div>;
  }

  const isPositive = priceChange24h >= 0;
  const colorClass = isPositive ? 'text-brand-green' : 'text-brand-red';
  const sign = isPositive ? '+' : '';

  return (
    <div className={`text-sm font-semibold ${colorClass}`}>
      <span>{sign}{priceChange24h.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
      <span className="ml-2">({sign}{priceChangePercent24h.toFixed(2)}%)</span>
      <span className="text-gray-400 text-xs ml-1 font-normal">{t('priceChange.hours')}</span>
    </div>
  );
};

export default PriceChange;
