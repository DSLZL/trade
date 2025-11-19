import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { useBitcoinPrice } from '../hooks/useBitcoinPrice';
import { cn } from '../lib/utils';

const LiveTradeFeed: React.FC = () => {
    const { t } = useTranslation();
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
        <Card className="h-full flex flex-col border-zinc-800 bg-zinc-900/50">
            <CardHeader className="py-4 border-b border-zinc-800/50">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-base">{t('liveTradeFeed.title')}</CardTitle>
                    <div className="flex items-center space-x-2 px-2 py-1 rounded-full bg-zinc-950 border border-zinc-800">
                        <span className={cn(
                            'h-2 w-2 rounded-full shadow-[0_0_8px]', 
                            { 
                                'bg-brand-green shadow-brand-green/50': isConnected, 
                                'bg-brand-red shadow-brand-red/50': !isConnected,
                                'bg-yellow-500 shadow-yellow-500/50 animate-pulse': wsStatus === 'connecting'
                            }
                        )}></span>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{t(statusTextKey)}</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 flex flex-col min-h-[400px]">
                 <div className="grid grid-cols-3 gap-2 px-4 py-2 text-xs font-semibold text-muted-foreground bg-zinc-950/30 uppercase tracking-wider">
                    <span className="text-left">{t('liveTradeFeed.price')}</span>
                    <span className="text-right">{t('liveTradeFeed.amount')}</span>
                    <span className="text-right">{t('liveTradeFeed.time')}</span>
                </div>
                <div className="flex-1 overflow-y-auto px-2 custom-scrollbar">
                    {liveTrades.length === 0 && isConnected ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-2 opacity-50">
                             <div className="w-6 h-6 border-2 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
                             <p className="text-xs">{t('common.waitingForTrades')}</p>
                        </div>
                    ) : liveTrades.length === 0 && !isConnected ? (
                         <p className="text-muted-foreground text-center py-8 text-sm">{t('common.connecting')}</p>
                    ) : (
                        <div className="py-2 space-y-0.5">
                            {liveTrades.map(trade => {
                                const isBuy = !trade.isBuyerMaker;
                                const textColor = isBuy ? 'text-brand-green' : 'text-brand-red';
                                
                                return (
                                    <div key={trade.id} className="grid grid-cols-3 gap-2 px-2 py-1.5 text-xs font-mono rounded hover:bg-zinc-800/50 transition-colors">
                                        <span className={cn('text-left font-semibold', textColor)}>
                                            {trade.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                        <span className="text-right text-zinc-300">
                                            {trade.amount.toFixed(5)}
                                        </span>
                                        <span className="text-right text-zinc-500">
                                            {formatTime(trade.time)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default LiveTradeFeed;