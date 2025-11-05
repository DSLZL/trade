
import React from 'react';
import { usePortfolio } from '../hooks/usePortfolio';
import { useBitcoinPrice } from '../hooks/useBitcoinPrice';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { useTranslation } from 'react-i18next';
import { Tooltip } from './ui/Tooltip';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { portfolio } = usePortfolio();
  const { currentPrice } = useBitcoinPrice();

  const totalValue = currentPrice 
    ? portfolio.usdBalance + portfolio.btcBalance * currentPrice
    : portfolio.usdBalance;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };
  
  const formatBTC = (value: number) => {
     return value.toFixed(8);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('dashboard.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <Tooltip text={t('dashboard.tooltips.totalValue')}>
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">{t('dashboard.totalValue')}</p>
              <p className="text-2xl font-bold text-primary">
                {currentPrice ? formatCurrency(totalValue) : t('dashboard.loading')}
              </p>
            </div>
          </Tooltip>
          <Tooltip text={t('dashboard.tooltips.usdBalance')}>
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">{t('dashboard.usdBalance')}</p>
              <p className="text-2xl font-bold">
                {formatCurrency(portfolio.usdBalance)}
              </p>
            </div>
          </Tooltip>
          <Tooltip text={t('dashboard.tooltips.btcHoldings')}>
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">{t('dashboard.btcHoldings')}</p>
              <p className="text-2xl font-bold">
                {formatBTC(portfolio.btcBalance)} BTC
              </p>
            </div>
          </Tooltip>
        </div>
      </CardContent>
    </Card>
  );
};

export default Dashboard;
