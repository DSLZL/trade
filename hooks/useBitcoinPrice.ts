import React, { useState, useEffect, createContext, useContext, useCallback, ReactNode, useMemo, useRef } from 'react';
import { fetchHistoricalData, fetch24hTicker } from '../services/cryptoApi';
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
const RECONNECT_DELAY = 3000; // 3 seconds

export const PriceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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

  // Refs
  const tradesBufferRef = useRef<PriceDataPoint[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const timeRangeRef = useRef<string>(timeRange);

  // Sync timeRange state to ref for use in WS callback
  useEffect(() => {
    timeRangeRef.current = timeRange;
  }, [timeRange]);

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

  // WebSocket connection function with auto-reconnect
  const connectWebSocket = useCallback(() => {
    // Close existing connection if any
    if (wsRef.current) {
        wsRef.current.close();
    }

    setWsStatus('connecting');
    const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@trade');
    wsRef.current = ws;

    ws.onopen = () => {
        setWsStatus('connected');
        // Clear any pending reconnect timers
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
    };

    ws.onclose = () => {
        setWsStatus('disconnected');
        // Attempt to reconnect after a delay
        reconnectTimeoutRef.current = window.setTimeout(() => {
            console.log('Attempting to reconnect WebSocket...');
            connectWebSocket();
        }, RECONNECT_DELAY);
    };

    ws.onerror = (event) => {
        console.error("Shared WebSocket Error:", event);
        // onError usually leads to onClose, so handling reconnection in onClose is safer
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketTradePayload = JSON.parse(event.data);
        const price = parseFloat(message.p);
        
        // 1. Update current price for all components
        setCurrentPrice(price);
        
        // 2. Add to the 1m chart buffer ONLY if we are in '1m' mode
        // This prevents memory leaks when viewing other timeframes
        if (timeRangeRef.current === '1m') {
            tradesBufferRef.current.push({
                timestamp: message.T,
                price: price,
                isLive: true,
            });
        } else {
            // Keep buffer empty to save memory
            if (tradesBufferRef.current.length > 0) {
                tradesBufferRef.current = [];
            }
        }

        // 3. Update the live trade feed
        const newTrade: LiveTrade = {
          id: message.t,
          price: price,
          amount: parseFloat(message.q),
          time: message.T,
          isBuyerMaker: message.m,
        };
        setLiveTrades(prev => [newTrade, ...prev.slice(0, MAX_LIVE_TRADES - 1)]);
      } catch (e) {
        console.error("Error parsing WebSocket message", e);
      }
    };
  }, []);

  // Initial connection setup
  useEffect(() => {
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connectWebSocket]);

  // Effect to handle fetching and updating chart data based on the selected timeRange.
  useEffect(() => {
    let dataUpdateInterval: number | undefined;

    if (timeRange === '1m') {
      // Clear buffer when switching to 1m
      tradesBufferRef.current = [];
      // For 1m, first get the initial dataset
      getHistoricalData('1m');
      
      // Start the interval to append live data to the chart
      dataUpdateInterval = window.setInterval(() => {
        if (tradesBufferRef.current.length === 0) return;

        const newTrades = [...tradesBufferRef.current]; // Copy
        tradesBufferRef.current = []; // Clear buffer

        setHistoricalData(prevData => {
          // Optimization: Use concat instead of spread for large arrays
          const combinedData = prevData.concat(newTrades);
          const oneMinuteAgo = Date.now() - 60 * 1000;
          
          const firstValidIndex = combinedData.findIndex(p => p.timestamp >= oneMinuteAgo);
          
          // If all data is old (rare), return empty, else return windowed data
          return firstValidIndex === -1 ? [] : combinedData.slice(firstValidIndex);
        });
      }, 1000); // Update chart every second to reduce render load

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
            const tickerData = await fetch24hTicker();
            setOpenPrice24h(parseFloat(tickerData.openPrice));
        } catch (err) {
            console.error("Failed to fetch 24h open price:", err);
        }
    };
    fetch24hOpen();
  }, []);

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