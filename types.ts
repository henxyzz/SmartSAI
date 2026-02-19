
export enum SignalType {
  STRONG_BUY = 'STRONG BUY',
  BUY = 'BUY',
  NEUTRAL = 'NEUTRAL',
  SELL = 'SELL',
  STRONG_SELL = 'STRONG SELL'
}

export enum MarketTrend {
  BULLISH = 'Bullish',
  BEARISH = 'Bearish',
  SIDEWAYS = 'Sideways'
}

export interface Candlestick {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TradingSignal {
  id: string;
  pair: string;
  timeframe: string;
  signal: SignalType;
  confidence: number;
  entry: number;
  stopLoss: number;
  takeProfit: number;
  trend: MarketTrend;
  timestamp: number;
  isBreakout: boolean;
  levels: {
    support: number;
    resistance: number;
  };
  indicators: {
    rsi: number;
    ema9: number;
    ema21: number;
    ema50: number;
    ema200: number;
    macd: {
      macd: number;
      signal: number;
      histogram: number;
    };
  };
}

export interface AppSettings {
  riskPercentage: number;
  rrRatio: number;
  timezone: string;
  scalpingMode: boolean;
  breakoutSensitivity: number;
}

export interface BacktestResult {
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  netProfit: number;
  equityCurve: number[];
}

export const SUPPORTED_PAIRS = [
  { symbol: 'XAUUSD', category: 'Commodities' },
  { symbol: 'BTCUSD', category: 'Crypto' },
  { symbol: 'ETHUSD', category: 'Crypto' },
  { symbol: 'SOLUSD', category: 'Crypto' },
  { symbol: 'EURUSD', category: 'Forex' },
  { symbol: 'GBPUSD', category: 'Forex' },
  { symbol: 'USDJPY', category: 'Forex' },
  { symbol: 'AUDUSD', category: 'Forex' },
  { symbol: 'US30', category: 'Indices' },
  { symbol: 'NAS100', category: 'Indices' },
  { symbol: 'GER40', category: 'Indices' },
  { symbol: 'XTIUSD', category: 'Commodities' },
];

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  text: string;
  image?: string;
  video?: string;
  taggedUser?: string;
  timestamp: number;
}
