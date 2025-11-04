


export enum TransactionType {
  BUY = 'BUY',
  SELL = 'SELL',
}

export interface Transaction {
  id: string;
  type: TransactionType;
  date: Date;
  btcAmount: number;
  usdAmount: number;
  priceAtTransaction: number;
}

export interface Portfolio {
  usdBalance: number;
  btcBalance: number;
  transactions: Transaction[];
}

export interface PriceDataPoint {
  timestamp: number;
  price: number; // This is the closing price
  open?: number;
  high?: number;
  low?: number;
  volume?: number;
  isLive?: boolean; // Flag for real-time price ticks
}

// Type for Binance API /ticker/price endpoint response
export interface BinanceTicker {
  symbol: string;
  price: string;
}

// Type for Binance API /trades endpoint response
export interface BinanceTrade {
  id: number;
  price: string;
  qty: string;
  quoteQty: string;
  time: number;
  isBuyerMaker: boolean;
  isBestMatch: boolean;
}

// Type for a single data point from Binance API /klines endpoint
// Format: [ OpenTime, Open, High, Low, Close, Volume, ... ]
export type BinanceKline = [
  number, // Open time
  string, // Open
  string, // High
  string, // Low
  string, // Close
  string, // Volume
  number, // Close time
  string, // Quote asset volume
  number, // Number of trades
  string, // Taker buy base asset volume
  string, // Taker buy quote asset volume
  string  // Ignore
];
