import React, { useState, useEffect, createContext, useContext, useCallback, ReactNode, useMemo, useRef } from 'react';
import { fetchHistoricalData } from '../services/cryptoApi';
import { PriceDataPoint, WebSocketTradePayload, LiveTrade } from '../types';

type WebSocketStatus = 'connecting' | 'connected' | 'disconnected';

interface PriceContextType {
  currentPrice: number | null;
  historicalData: PriceDataPoint[];
  liveTrades: LiveTrade[];
  wsStatus: WebSocketStatus;
  timeRange: string;
  setTimeRange: (range: string) => void;
  loading: boolean;
  error: string | null;
  openPrice24h: number | null;
  priceChange24h: number | null;
  priceChangePercent24h: number | null;
}

const PriceContext = createContext<PriceContextType | undefined>(undefined);

const MAX_LIVE_TRADES = 20; // Number of trades to show in the live feed

export const PriceProvider = ({ children }: { children: ReactNode }) => {
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [historicalData, setHistoricalData] = useState<PriceDataPoint[]>([]);
  const [timeRange, setTimeRange] = useState<string>('7d');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openPrice24h, setOpenPrice24h] = useState<number | null>(null);
  const [priceChange24h, setPriceChange24h] = useState<number | null>(null);
  const [priceChangePercent24h, setPriceChangePercent24h] = useState<number | null>(null);
  
  // State for live data shared across components
  const [liveTrades, setLiveTrades] = useState<LiveTrade[]>([]);
  const [wsStatus, setWsStatus] = useState<WebSocketStatus>('connecting');

  // Ref to buffer incoming high-frequency trade data for the 1m chart
  const tradesBufferRef = useRef<PriceDataPoint[]>([]);

  const getHistoricalData = useCallback(async (range: string) => {
    setLoading(true);
    setError(null);
    try {
      const formattedData = await fetchHistoricalData(range);
      setHistoricalData(formattedData);
    } catch (err) {
      setError('Failed to fetch historical price data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect to manage the single, persistent WebSocket connection for the app's lifetime.
  // This provides real-time data for the current price and the live trade feed.
  useEffect(() => {
    const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@trade');

    ws.onopen = () => setWsStatus('connected');
    ws.onclose = () => setWsStatus('disconnected');
    ws.onerror = (event) => {
      console.error("Shared WebSocket Error. See browser console for details.", event);
      setWsStatus('disconnected');
    };

    ws.onmessage = (event) => {
      const message: WebSocketTradePayload = JSON.parse(event.data);
      const price = parseFloat(message.p);
      
      // 1. Update current price for all components
      setCurrentPrice(price);
      
      // 2. Add to the 1m chart buffer
      tradesBufferRef.current.push({
        timestamp: message.T,
        price: price,
        isLive: true,
      });

      // 3. Update the live trade feed
      const newTrade: LiveTrade = {
        id: message.t,
        price: price,
        amount: parseFloat(message.q),
        time: message.T,
        isBuyerMaker: message.m,
      };
      setLiveTrades(prev => [newTrade, ...prev.slice(0, MAX_LIVE_TRADES - 1)]);
    };

    return () => {
      ws.close();
    };
  }, []); // Run only once on mount

  // Effect to handle fetching and updating chart data based on the selected timeRange.
  useEffect(() => {
    let dataUpdateInterval: number | undefined;

    if (timeRange === '1m') {
      // For 1m, first get the initial dataset, then start the interval to append live data.
      getHistoricalData('1m');
      
      dataUpdateInterval = window.setInterval(() => {
        if (tradesBufferRef.current.length === 0) return;

        const newTrades = tradesBufferRef.current;
        tradesBufferRef.current = []; // Clear buffer for next batch

        setHistoricalData(prevData => {
          const combinedData = [...prevData, ...newTrades];
          const oneMinuteAgo = Date.now() - 60 * 1000;
          
          // OPTIMIZATION: Instead of filtering the whole array, find the first valid index
          // and slice from there. This is vastly more performant on large arrays.
          const firstValidIndex = combinedData.findIndex(p => p.timestamp >= oneMinuteAgo);
          
          return firstValidIndex === -1 ? [] : combinedData.slice(firstValidIndex);
        });
      }, 500);

    } else {
      // For all other ranges, just fetch the historical data once.
      getHistoricalData(timeRange);
    }

    return () => {
      clearInterval(dataUpdateInterval);
    };
  }, [timeRange, getHistoricalData]);


  // Effect to fetch 24h open price once on mount
  useEffect(() => {
    const fetch24hOpen = async () => {
        try {
            const dailyData = await fetchHistoricalData('1d');
            if(dailyData.length > 0 && dailyData[0].open !== undefined) {
                setOpenPrice24h(dailyData[0].open);
            }
        } catch (err) {
            console.error("Failed to fetch 24h open price:", err);
        }
    };
    fetch24hOpen();
  }, []); // Only run on mount

  // Effect to calculate 24h price change
  useEffect(() => {
    if (currentPrice !== null && openPrice24h !== null) {
      const change = currentPrice - openPrice24h;
      const percentChange = (change / openPrice24h) * 100;
      setPriceChange24h(change);
      setPriceChangePercent24h(percentChange);
    }
  }, [currentPrice, openPrice24h]);


  const value = useMemo(() => ({
    currentPrice,
    historicalData,
    liveTrades,
    wsStatus,
    timeRange,
    setTimeRange,
    loading,
    error,
    openPrice24h,
    priceChange24h,
    priceChangePercent24h,
  }), [currentPrice, historicalData, liveTrades, wsStatus, timeRange, loading, error, openPrice24h, priceChange24h, priceChangePercent24h]);

  return React.createElement(PriceContext.Provider, { value: value }, children);
};

export const useBitcoinPrice = (): PriceContextType => {
  const context = useContext(PriceContext);
  if (context === undefined) {
    throw new Error('useBitcoinPrice must be used within a PriceProvider');
  }
  return context;
};