

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

// Type for the live trade feed, shared between the hook and component
export interface LiveTrade {
    id: number;
    price: number;
    amount: number;
    time: number;
    isBuyerMaker: boolean;
}

// Type for Binance API /ticker/price endpoint response
export interface BinanceTicker {
  symbol: string;
  price: string;
}

// Type for Binance API /aggTrades endpoint response
export interface BinanceAggTrade {
  a: number; // Aggregate trade ID
  p: string; // Price
  q: string; // Quantity
  T: number; // Timestamp
  m: boolean; // Is the buyer the market maker?
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

// Type for Binance WebSocket /<symbol>@trade stream payload
export interface WebSocketTradePayload {
  e: string; // Event type
  E: number; // Event time
  s: string; // Symbol
  t: number; // Trade ID
  p: string; // Price
  q: string; // Quantity
  b: number; // Buyer order ID
  a: number; // Seller order ID
  T: number; // Trade time
  m: boolean; // Is the buyer the market maker?
  M: boolean; // Ignore
}