"use client";

import React, { useState, useEffect, createContext, useContext, useCallback, ReactNode, useMemo } from 'react';
import { fetchCurrentPrice, fetchHistoricalData } from '../services/cryptoApi';
import { PriceDataPoint } from '../types';

interface PriceContextType {
  currentPrice: number | null;
  historicalData: PriceDataPoint[];
  timeRange: string;
  setTimeRange: (range: string) => void;
  loading: boolean;
  error: string | null;
  openPrice24h: number | null;
  priceChange24h: number | null;
  priceChangePercent24h: number | null;
}

const PriceContext = createContext<PriceContextType | undefined>(undefined);

export const PriceProvider = ({ children }: { children: ReactNode }) => {
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [historicalData, setHistoricalData] = useState<PriceDataPoint[]>([]);
  const [timeRange, setTimeRange] = useState<string>('7d');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openPrice24h, setOpenPrice24h] = useState<number | null>(null);
  const [priceChange24h, setPriceChange24h] = useState<number | null>(null);
  const [priceChangePercent24h, setPriceChangePercent24h] = useState<number | null>(null);

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

  const getCurrentPrice = useCallback(async () => {
    try {
      const price = await fetchCurrentPrice();
      setCurrentPrice(price);
    } catch (err) {
      // Don't overwrite a more critical historical data error with a price poll error.
      if (!historicalData.length) {
        setError('Failed to fetch current price.');
      }
      console.error(err);
    }
  }, [historicalData.length]);

  useEffect(() => {
    const fetchInitialData = async () => {
        await getCurrentPrice();
        await getHistoricalData(timeRange);

        // Fetch 24h data specifically for price change calculation
        try {
            const dailyData = await fetchHistoricalData('1d');
            if(dailyData.length > 0 && dailyData[0].open !== undefined) {
                setOpenPrice24h(dailyData[0].open);
            }
        } catch (err) {
            console.error("Failed to fetch 24h open price:", err);
        }
    };
    
    fetchInitialData();

    // Set up polling for current price. A 2-second interval provides a near
    // real-time feel without hitting API rate limits, which a 1-second
    // interval might risk with a standard REST API.
    const intervalId = setInterval(getCurrentPrice, 2000); // Poll every 2 seconds

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // This effect handles fetching data when the time range changes, and also
    // sets up a periodic refresh for the '10m' real-time chart.
    getHistoricalData(timeRange);

    let intervalId: number | undefined;

    // If the user selects the 10m real-time view, we need to periodically
    // refresh the dense trade data to create a rolling window effect.
    if (timeRange === '10m') {
      // Refresh the historical trade data every 30 seconds.
      intervalId = window.setInterval(() => {
        // We only want to refresh the background data, not show a loading spinner,
        // so we call the fetch function directly without setting the loading state.
        fetchHistoricalData('10m')
          .then(formattedData => {
            // To prevent the live tick from disappearing during a refresh,
            // we find it in the previous state and append it to the new data.
            setHistoricalData(prevData => {
              const liveTick = prevData.find(p => p.isLive);
              return liveTick ? [...formattedData, liveTick] : formattedData;
            });
          })
          .catch(err => {
            // Silently handle the error or show a non-intrusive message
            console.error("Failed to auto-refresh 10m trade data:", err);
          });
      }, 30000); // 30 seconds
    }

    // Cleanup function to clear the interval when the component unmounts
    // or when the timeRange changes, preventing memory leaks and unwanted polling.
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [timeRange, getHistoricalData]);

  useEffect(() => {
    // This effect handles the "live" update for the 10-minute chart.
    // It appends the latest real-time price tick to the historical data.
    if (timeRange === '10m' && currentPrice !== null && historicalData.length > 0) {
        setHistoricalData(prevData => {
            const lastPoint = prevData[prevData.length - 1];
            const newPoint: PriceDataPoint = {
                timestamp: Date.now(),
                price: currentPrice,
                isLive: true,
            };

            // Check if the last point is a live one using our new flag.
            if (lastPoint.isLive) {
                // If the last point was a live one, replace it with the latest price tick.
                // This makes the end of the chart line move up and down in real-time.
                const newData = [...prevData.slice(0, -1), newPoint];
                return newData;
            } else {
                // If the last point was from the API, append the new live point.
                // This starts the real-time drawing of the chart line.
                return [...prevData, newPoint];
            }
        });
    }
    // We intentionally omit historicalData from deps to prevent infinite loops.
    // The functional update to setHistoricalData ensures we have the latest state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPrice, timeRange]);

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
    timeRange,
    setTimeRange,
    loading,
    error,
    openPrice24h,
    priceChange24h,
    priceChangePercent24h,
  }), [currentPrice, historicalData, timeRange, loading, error, openPrice24h, priceChange24h, priceChangePercent24h]);

  return React.createElement(PriceContext.Provider, { value: value }, children);
};

export const useBitcoinPrice = (): PriceContextType => {
  const context = useContext(PriceContext);
  if (context === undefined) {
    throw new Error('useBitcoinPrice must be used within a PriceProvider');
  }
  return context;
};
