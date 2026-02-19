
import { Candlestick } from '../types';

export const generateHistoricalData = (count: number, startPrice: number = 2000): Candlestick[] => {
  const data: Candlestick[] = [];
  let currentPrice = startPrice;
  const now = Math.floor(Date.now() / 1000);
  
  for (let i = count; i >= 0; i--) {
    const volatility = currentPrice * 0.002;
    const open = currentPrice + (Math.random() - 0.5) * volatility;
    const high = open + Math.random() * volatility;
    const low = open - Math.random() * volatility;
    const close = (high + low) / 2 + (Math.random() - 0.5) * (volatility / 2);
    const volume = Math.random() * 1000;
    
    data.push({
      time: now - i * 300, // 5m intervals
      open,
      high,
      low,
      close,
      volume
    });
    currentPrice = close;
  }
  return data;
};

export const getNextCandle = (lastCandle: Candlestick): Candlestick => {
  const volatility = lastCandle.close * 0.0005;
  const open = lastCandle.close;
  const high = open + Math.random() * volatility;
  const low = open - Math.random() * volatility;
  const close = (high + low) / 2 + (Math.random() - 0.5) * (volatility / 2);
  
  return {
    time: lastCandle.time + 300,
    open,
    high,
    low,
    close,
    volume: Math.random() * 1000
  };
};
