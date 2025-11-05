import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { useBitcoinPrice } from '../hooks/useBitcoinPrice';
import { cn } from '../lib/utils';
import { LiveTrade } from '../types';

const LiveTradeFeed: React.FC = () => {
    const { t } = useTranslation();
    // Data now comes from the centralized context, not a local WebSocket.
    const { liveTrades, wsStatus } = useBitcoinPrice();

    const formatTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const isConnected = wsStatus === 'connected';
    
    let statusTextKey: string;
    if (wsStatus === 'connected') {
        statusTextKey = 'common.connected';
    } else if (wsStatus === 'connecting') {
        statusTextKey = 'common.connecting';
    } else {
        statusTextKey = 'common.disconnected';
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>{t('liveTradeFeed.title')}</CardTitle>
                    <div className="flex items-center space-x-2">
                        <span className={cn(
                            'h-2 w-2 rounded-full animate-pulse', 
                            { 
                                'bg-brand-green': isConnected, 
                                'bg-brand-red': !isConnected,
                                'animate-none': wsStatus !== 'connecting' 
                            }
                        )}></span>
                        <span className="text-xs text-muted-foreground">{t(statusTextKey)}</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="max-h-[600px] lg:max-h-[calc(100vh-200px)] overflow-y-auto pr-2 -mr-2">
                    {/* Header Row */}
                    <div className="grid grid-cols-3 gap-2 pb-2 text-xs text-muted-foreground font-bold uppercase sticky top-0 bg-card z-10">
                        <span className="text-left">{t('liveTradeFeed.price')}</span>
                        <span className="text-right">{t('liveTradeFeed.amount')}</span>
                        <span className="text-right">{t('liveTradeFeed.time')}</span>
                    </div>
                    {/* Trade Rows */}
                    <div className="text-sm">
                        {liveTrades.length === 0 && isConnected ? (
                            <p className="text-muted-foreground text-center py-8">{t('common.waitingForTrades')}</p>
                        ) : liveTrades.length === 0 && !isConnected ? (
                             <p className="text-muted-foreground text-center py-8">{t('common.connecting')}</p>
                        ) : (
                            liveTrades.map(trade => {
                                // A "buy" happens when a market buy order hits a limit sell (buyer is not maker)
                                // A "sell" happens when a market sell order hits a limit buy (buyer is maker)
                                const isBuy = !trade.isBuyerMaker;
                                const textColor = isBuy ? 'text-brand-green' : 'text-brand-red';
                                
                                return (
                                    <div key={trade.id} className="grid grid-cols-3 gap-2 py-1 font-mono">
                                        <span className={cn('text-left', textColor)}>
                                            {trade.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                        <span className="text-right">
                                            {trade.amount.toFixed(5)}
                                        </span>
                                        <span className="text-right text-muted-foreground">
                                            {formatTime(trade.time)}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default LiveTradeFeed;