

import { API_BASE_URL, BITCOIN_ID } from '../constants';
import { BinanceTicker, BinanceKline, PriceDataPoint, BinanceTrade } from '../types';

export const fetchCurrentPrice = async (): Promise<number> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v3/ticker/price?symbol=${BITCOIN_ID}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data: BinanceTicker = await response.json();
    return parseFloat(data.price);
  } catch (error) {
    console.error("Failed to fetch current price:", error);
    throw error;
  }
};

/**
 * Fetches high-resolution recent trades for the detailed real-time chart.
 */
export const fetchRecentTrades = async (limit: number = 1000): Promise<PriceDataPoint[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v3/trades?symbol=${BITCOIN_ID}&limit=${limit}`);
    if (!response.ok) {
      throw new Error('Network response was not ok for recent trades');
    }
    const data: BinanceTrade[] = await response.json();
    
    // Transform trade data into the PriceDataPoint format
    return data.map(trade => ({
      timestamp: trade.time,
      price: parseFloat(trade.price),
    }));
  } catch (error) {
    console.error("Failed to fetch recent trades:", error);
    throw error;
  }
};


export const fetchHistoricalData = async (range: string = '7d'): Promise<PriceDataPoint[]> => {
  // For the 10m chart, we want high-resolution trade data, not 1-minute klines.
  if (range === '10m') {
    return fetchRecentTrades(1000); // Fetch last 1000 trades for high detail
  }
  
  try {
    let interval = '1d';
    let limit = 1000; // Default max limit

    switch(range) {
      case '30m':
        interval = '1m';
        limit = 30;
        break;
      case '1h':
        interval = '1m';
        limit = 60;
        break;
      case '12h':
        interval = '15m';
        limit = 48; // 12 hours * 4 (15-min intervals per hour)
        break;
      case '1d':
        interval = '1h';
        limit = 24;
        break;
      case '7d':
        interval = '1d';
        limit = 7;
        break;
      case '30d':
        interval = '1d';
        limit = 30;
        break;
      default:
        interval = '1d';
        limit = 7;
    }


    const response = await fetch(`${API_BASE_URL}/api/v3/klines?symbol=${BITCOIN_ID}&interval=${interval}&limit=${limit}`);
    if (!response.ok) {
      throw new Error('Network response was not ok for historical data');
    }
    const data: BinanceKline[] = await response.json();
    
    // Transform data into the PriceDataPoint format used by the charts.
    // kline format: [ OpenTime, Open, High, Low, Close, Volume, ... ]
    return data.map(kline => ({
      timestamp: kline[0], // Binance API time is in ms
      price: parseFloat(kline[4]), // Use the closing price
      open: parseFloat(kline[1]), // Include the opening price
      high: parseFloat(kline[2]),
      low: parseFloat(kline[3]),
      volume: parseFloat(kline[5]),
    }));
  } catch (error)
 {
    console.error("Failed to fetch historical data:", error);
    throw error;
  }
};
