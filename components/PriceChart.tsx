import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useBitcoinPrice } from '../hooks/useBitcoinPrice';
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
        <div className="flex justify-between items-center pt-2 mt-2 border-t border-zinc-700">
          <span className="text-zinc-400 text-xs">{t('priceChange.hours')} {t('priceChart.tooltip.change')}:</span>
          <div className={`font-mono font-semibold ${changeColor} text-right`}>
            <div>{`${sign}${change.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`}</div>
            <div className="text-xs opacity-80">({`${sign}${percentChange.toFixed(2)}%`})</div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-zinc-900/90 backdrop-blur-md text-zinc-100 p-3 rounded-lg border border-zinc-700 shadow-xl text-sm w-64 ring-1 ring-white/10">
        <p className="font-bold mb-2 text-zinc-300 border-b border-zinc-700 pb-1">{new Date(label).toLocaleString()}</p>
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <span className="text-zinc-400">{t('priceChart.tooltip.price')}:</span>
            <span className="font-mono font-semibold text-brand-blue">{`$${currentData.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</span>
          </div>
          {currentData.high && (
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500">{t('priceChart.tooltip.high')}:</span>
              <span className="font-mono">{`$${currentData.high.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</span>
            </div>
          )}
          {currentData.low && (
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500">{t('priceChart.tooltip.low')}:</span>
              <span className="font-mono">{`$${currentData.low.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</span>
            </div>
          )}
           {currentData.volume && (
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500">{t('priceChart.tooltip.volume')}:</span>
              <span className="font-mono">{`${currentData.volume.toFixed(3)} BTC`}</span>
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

  const lineType = timeRange === '1m' ? 'step' : 'linear';

  const formatXAxisTick = (tick: number) => {
    const date = new Date(tick);
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
  
  return (
    <div className="p-4">
      <div className="flex flex-wrap justify-end items-center mb-4 gap-2">
          {timeRanges.map(range => (
              <button 
                  key={range.id} 
                  onClick={() => setTimeRange(range.id)}
                  className={cn(
                      "text-xs font-medium px-3 py-1 rounded-md transition-all",
                      timeRange === range.id 
                        ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20" 
                        : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                  )}
              >
                  {range.label}
              </button>
          ))}
      </div>
      
      {/* Main Chart */}
      <div className="w-full h-[240px] md:h-[300px]">
        {loading ? (
          <div className="flex justify-center items-center h-full text-zinc-500 text-sm animate-pulse">{t('priceChart.loading')}</div>
        ) : error ? (
          <div className="flex justify-center items-center h-full text-brand-red text-sm">{error}</div>
        ) : (
          <ResponsiveContainer>
            <AreaChart data={historicalData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis 
                dataKey="timestamp" 
                type="number"
                domain={['dataMin', 'dataMax']}
                tickFormatter={formatXAxisTick}
                stroke="#52525b"
                tick={{fontSize: 11}}
                tickLine={false}
                axisLine={false}
                minTickGap={30}
              />
              <YAxis 
                tickFormatter={(price) => `$${price.toLocaleString()}`}
                stroke="#52525b"
                domain={['auto', 'auto']}
                tick={{fontSize: 11}}
                tickLine={false}
                axisLine={false}
                width={65}
              />
              <Tooltip 
                content={<CustomTooltip />} 
                cursor={{ stroke: '#52525b', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area 
                isAnimationActive={false}
                type={lineType} 
                dataKey="price" 
                stroke="#3b82f6" 
                strokeWidth={2} 
                fill="url(#chartGradient)"
                activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default PriceChart;