import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useBitcoinPrice } from '../hooks/useBitcoinPrice';
import Button from './ui/Button';
import { useTranslation } from 'react-i18next';
import { PriceDataPoint } from '../types';
import { cn } from '../lib/utils';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: number;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  const { t } = useTranslation();
  const { openPrice24h } = useBitcoinPrice();

  if (active && payload && payload.length && label) {
    const currentData = payload[0].payload as PriceDataPoint;
    
    let changeElements = null;
    if (openPrice24h !== null) {
      const change = currentData.price - openPrice24h;
      const percentChange = (change / openPrice24h) * 100;
      
      const isPositive = change >= 0;
      const changeColor = isPositive ? 'text-brand-green' : 'text-brand-red';
      const sign = isPositive ? '+' : '';

      changeElements = (
        <div className="flex justify-between items-center pt-1 mt-1 border-t border-border">
          <span className="text-muted-foreground">{t('priceChange.hours')} {t('priceChart.tooltip.change')}:</span>
          <div className={`font-semibold ${changeColor} text-right`}>
            <div>{`${sign}${change.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`}</div>
            <div className="text-xs">({`${sign}${percentChange.toFixed(2)}%`})</div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-popover text-popover-foreground p-3 rounded-lg border border-border shadow-lg text-sm w-56">
        <p className="font-bold mb-2">{new Date(label).toLocaleString()}</p>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('priceChart.tooltip.price')}:</span>
            <span className="font-semibold">{`$${currentData.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</span>
          </div>
          {currentData.open && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('priceChart.tooltip.open')}:</span>
              <span className="font-semibold">{`$${currentData.open.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</span>
            </div>
          )}
          {currentData.high && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('priceChart.tooltip.high')}:</span>
              <span className="font-semibold">{`$${currentData.high.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</span>
            </div>
          )}
          {currentData.low && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('priceChart.tooltip.low')}:</span>
              <span className="font-semibold">{`$${currentData.low.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</span>
            </div>
          )}
           {currentData.volume && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('priceChart.tooltip.volume')}:</span>
              <span className="font-semibold">{`${currentData.volume.toFixed(3)} BTC`}</span>
            </div>
          )}
          {changeElements}
        </div>
      </div>
    );
  }
  return null;
};

const PriceChart: React.FC = () => {
  const { t } = useTranslation();
  const { historicalData, loading, error, timeRange, setTimeRange } = useBitcoinPrice();

  // For high-frequency data (1m), a 'step' chart provides a more accurate,
  // raw visualization. For lower-frequency k-lines, 'linear' shows trends better.
  const lineType = timeRange === '1m' ? 'step' : 'linear';

  const formatXAxisTick = (tick: number) => {
    const date = new Date(tick);
    // For the 1m real-time chart, showing seconds is crucial to differentiate
    // between the high-frequency data points.
    if (timeRange === '1m') {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    if (['30m', '1h', '12h', '1d'].includes(timeRange)) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString();
  };

  const timeRanges = [
    { label: '1m', id: '1m' },
    { label: '30m', id: '30m' },
    { label: '1H', id: '1h' },
    { label: '12H', id: '12h' },
    { label: '1D', id: '1d' },
    { label: '7D', id: '7d' },
    { label: '1M', id: '30d' },
  ];
  
  if (loading) return <div className="flex justify-center items-center h-96 text-gray-400">{t('priceChart.loading')}</div>;
  if (error) return <div className="flex justify-center items-center h-96 text-red-500">{error}</div>;

  return (
    <div>
      <div className="flex flex-wrap justify-end items-center mb-4 px-4 md:px-6">
        <div className="w-full sm:w-auto flex flex-wrap justify-center sm:justify-end gap-2 mt-2 sm:mt-0">
            {timeRanges.map(range => (
                <Button 
                    key={range.id} 
                    onClick={() => setTimeRange(range.id)}
                    variant='secondary'
                    className={cn(
                        "text-sm px-3 py-1",
                        {
                          "bg-transparent border border-primary": timeRange === range.id,
                        }
                    )}
                >
                    {range.label}
                </Button>
            ))}
        </div>
      </div>
      
      {/* Main Chart */}
      <div className="w-full h-[220px] md:h-[280px]">
        <ResponsiveContainer>
          <AreaChart data={historicalData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--brand-blue-hsl))" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="hsl(var(--brand-blue-hsl))" stopOpacity={0}/>
                </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="timestamp" 
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={formatXAxisTick}
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis 
              tickFormatter={(price) => `$${price.toLocaleString()}`}
              stroke="hsl(var(--muted-foreground))"
              domain={['auto', 'auto']}
              width={80} // Give Y-Axis ample space
            />
            <Tooltip 
              content={<CustomTooltip />} 
              isAnimationActive={false}
            />
            <Area 
              isAnimationActive={false}
              type={lineType} 
              dataKey="price" 
              stroke="hsl(var(--brand-blue-hsl))" 
              strokeWidth={2} 
              fill="url(#chartGradient)"
              dot={false}
              activeDot={{ r: 5, strokeWidth: 1, fill: 'hsl(var(--brand-blue-hsl))', stroke: 'hsl(var(--foreground))' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};

export default PriceChart;
