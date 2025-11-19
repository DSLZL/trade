import React from 'react';
import { usePortfolio } from '../hooks/usePortfolio';
import { useBitcoinPrice } from '../hooks/useBitcoinPrice';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { useTranslation } from 'react-i18next';
import { Tooltip } from './ui/Tooltip';

interface StatCardProps {
    title: string;
    value: React.ReactNode;
    subValue?: string;
    icon: React.ReactNode;
    gradientClass?: string;
    tooltip?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, gradientClass, tooltip }) => (
    <Card className="relative overflow-hidden border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-900/50 transition-all duration-300 group">
        {gradientClass && <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${gradientClass} opacity-10 rounded-bl-full -mr-4 -mt-4 transition-opacity group-hover:opacity-20`} />}
        <CardContent className="p-6">
            <div className="flex justify-between items-start mb-2">
                 <p className="text-sm font-medium text-muted-foreground">{title}</p>
                 <div className="p-2 rounded-lg bg-zinc-800/50 text-zinc-400">
                    {icon}
                 </div>
            </div>
            <Tooltip text={tooltip || ""} position="top">
                 <div className="text-2xl font-bold tracking-tight">
                     {value}
                 </div>
            </Tooltip>
        </CardContent>
    </Card>
);

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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
            title={t('dashboard.totalValue')}
            value={currentPrice ? <span className="text-white">{formatCurrency(totalValue)}</span> : <span className="animate-pulse text-muted-foreground">Loading...</span>}
            tooltip={t('dashboard.tooltips.totalValue')}
            icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            }
            gradientClass="from-brand-blue to-transparent"
        />
        <StatCard 
            title={t('dashboard.usdBalance')}
            value={formatCurrency(portfolio.usdBalance)}
            tooltip={t('dashboard.tooltips.usdBalance')}
             icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            }
            gradientClass="from-brand-green to-transparent"
        />
         <StatCard 
            title={t('dashboard.btcHoldings')}
            value={
                <span>
                    {formatBTC(portfolio.btcBalance)} <span className="text-sm text-muted-foreground font-normal">BTC</span>
                </span>
            }
            tooltip={t('dashboard.tooltips.btcHoldings')}
             icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            }
            gradientClass="from-yellow-500 to-transparent"
        />
    </div>
  );
};

export default Dashboard;