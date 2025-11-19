import { API_BASE_URL, BITCOIN_ID } from '../constants';
import { BinanceTicker, BinanceKline, PriceDataPoint, BinanceAggTrade, Binance24hTicker } from '../types';

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

export const fetch24hTicker = async (): Promise<Binance24hTicker> => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v3/ticker/24hr?symbol=${BITCOIN_ID}`);
        if (!response.ok) {
            throw new Error('Network response was not ok for 24h ticker');
        }
        const data: Binance24hTicker = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch 24h ticker:", error);
        throw error;
    }
};

/**
 * Fetches aggregate trades within a specific time window using the /api/v3/aggTrades endpoint.
 * This provides high-resolution data for the 1-minute chart.
 */
export const fetchTradesForTimeRange = async (startTime: number, endTime: number): Promise<PriceDataPoint[]> => {
    try {
        const url = `${API_BASE_URL}/api/v3/aggTrades?symbol=${BITCOIN_ID}&startTime=${startTime}&endTime=${endTime}&limit=1000`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok for aggregate trades');
        }
        const data: BinanceAggTrade[] = await response.json();
        
        // Transform aggregate trade data into the PriceDataPoint format
        return data.map(trade => ({
            timestamp: trade.T,
            price: parseFloat(trade.p),
        }));
    } catch (error) {
        console.error("Failed to fetch aggregate trades:", error);
        throw error;
    }
};


export const fetchHistoricalData = async (range: string = '7d'): Promise<PriceDataPoint[]> => {
  // For the 1m chart, we want high-resolution trade data for the last 60 seconds.
  if (range === '1m') {
    const endTime = Date.now();
    const startTime = endTime - 60 * 1000;
    return fetchTradesForTimeRange(startTime, endTime);
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
      throw new Error(`Network response was not ok for historical data (${range})`);
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
    // Return empty array instead of crashing the component
    return []; 
  }
};