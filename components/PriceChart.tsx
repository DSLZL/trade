import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Brush } from 'recharts';
import { useBitcoinPrice } from '../hooks/useBitcoinPrice';
import Button from './ui/Button';
import { useTranslation } from 'react-i18next';
import { PriceDataPoint } from '../types';
import { cn } from '../../lib/utils';

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

  const [xDomain, setXDomain] = useState<[number | 'dataMin', number | 'dataMax']>(['dataMin', 'dataMax']);
  const [yDomain, setYDomain] = useState<[number | 'auto', number | 'auto']>(['auto', 'auto']);

  // For high-frequency data (1m), a 'step' chart provides a more accurate,
  // raw visualization. For lower-frequency k-lines, 'linear' shows trends better.
  const lineType = timeRange === '1m' ? 'step' : 'linear';

  useEffect(() => {
    resetZoom();
  }, [historicalData]);

  const handleBrushChange = (range: { startIndex?: number; endIndex?: number }) => {
    if (historicalData && range.startIndex !== undefined && range.endIndex !== undefined) {
      const newXDomain: [number, number] = [
        historicalData[range.startIndex].timestamp,
        historicalData[range.endIndex].timestamp
      ];
      setXDomain(newXDomain);
      
      const visibleData = historicalData.slice(range.startIndex, range.endIndex + 1);
      if (visibleData.length > 0) {
        const prices = visibleData.map(d => d.price);
        const minY = Math.min(...prices);
        const maxY = Math.max(...prices);
        const padding = (maxY - minY) * 0.1; // 10% padding
        setYDomain([Math.max(0, minY - padding), maxY + padding]);
      }
    }
  };

  const resetZoom = () => {
    setXDomain(['dataMin', 'dataMax']);
    setYDomain(['auto', 'auto']);
  };

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
  
  const isZoomed = xDomain[0] !== 'dataMin' || xDomain[1] !== 'dataMax';

  if (loading) return <div className="flex justify-center items-center h-96 text-gray-400">{t('priceChart.loading')}</div>;
  if (error) return <div className="flex justify-center items-center h-96 text-red-500">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4 px-6">
        <div>
          {isZoomed && (
            <Button onClick={resetZoom} variant="ghost" className="text-sm px-3 py-1">
              {t('priceChart.resetZoom')}
            </Button>
          )}
        </div>
        <div className="flex justify-end space-x-2">
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
      
      {/* Main Chart (Zoomed View) */}
      <div style={{ width: '100%', height: 280 }}>
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
              domain={xDomain}
              allowDataOverflow
              tickFormatter={formatXAxisTick}
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis 
              tickFormatter={(price) => `$${price.toLocaleString()}`}
              stroke="hsl(var(--muted-foreground))"
              domain={yDomain}
              allowDataOverflow
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

      {/* Context Chart (Brush View) */}
      <div style={{ width: '100%', height: 70, marginTop: '1rem' }}>
        <ResponsiveContainer>
          <AreaChart data={historicalData}>
            <XAxis dataKey="timestamp" tick={false} axisLine={false} hide/>
            <YAxis domain={['dataMin', 'dataMax']} tick={false} axisLine={false} hide/>
            <Area isAnimationActive={false} type={lineType} dataKey='price' stroke='hsl(var(--muted-foreground))' fill='hsl(var(--muted-foreground))' fillOpacity={0.2} dot={false} />
            <Brush
              dataKey="timestamp"
              stroke="hsl(var(--brand-blue-hsl))"
              fill="hsla(var(--brand-blue-hsl), 0.2)"
              startIndex={0}
              endIndex={historicalData.length > 0 ? historicalData.length - 1 : 0}
              onChange={handleBrushChange}
              tickFormatter={formatXAxisTick}
              height={40}
              y={15}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PriceChart;