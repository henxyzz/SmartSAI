
import React, { useState, useMemo } from 'react';
import { TradingSignal, SUPPORTED_PAIRS, SignalType, MarketTrend } from '../types';
import { generateHistoricalData } from '../services/mockDataService';
import { generateSignal } from '../services/tradingLogic';
import { Language, translations } from '../translations';

interface MarketOverviewProps {
  onSelectPair: (pair: string) => void;
  timezone: string;
  rrRatio: number;
  breakoutSensitivity: number;
  lang: Language;
}

const MarketOverview: React.FC<MarketOverviewProps> = ({ onSelectPair, timezone, rrRatio, breakoutSensitivity, lang }) => {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({
    key: 'pair',
    direction: 'asc'
  });

  const t = translations[lang];

  const marketMtfData = useMemo(() => {
    return SUPPORTED_PAIRS.map(pair => {
      let startPrice = 2000;
      if (pair.symbol.includes('BTC')) startPrice = 65000;
      else if (pair.symbol.includes('ETH')) startPrice = 2600;
      else if (pair.symbol.includes('SOL')) startPrice = 145;
      else if (pair.symbol.includes('JPY')) startPrice = 150.50;
      else if (pair.symbol.includes('USD') && !pair.symbol.includes('BTC') && !pair.symbol.includes('XAU')) startPrice = 1.08;
      else if (pair.symbol === 'US30') startPrice = 39000;
      else if (pair.symbol === 'NAS100') startPrice = 18000;

      const candles5m = generateHistoricalData(100, startPrice);
      const signal5m = generateSignal(pair.symbol, '5M', candles5m, rrRatio, false, breakoutSensitivity);
      const signal15m = generateSignal(pair.symbol, '15M', candles5m.slice(0, 80), rrRatio, false, breakoutSensitivity);
      const signal1h = generateSignal(pair.symbol, '1H', candles5m.slice(0, 50), rrRatio, false, breakoutSensitivity);

      return {
        pair: pair.symbol,
        category: pair.category,
        signals: {
          '5M': signal5m,
          '15M': signal15m,
          '1H': signal1h
        },
        avgConfidence: Math.round((signal5m.confidence + signal15m.confidence + signal1h.confidence) / 3)
      };
    });
  }, [rrRatio, breakoutSensitivity]);

  const sortedData = useMemo(() => {
    let sortableItems = [...marketMtfData];
    if (sortConfig !== null) {
      sortableItems.sort((a: any, b: any) => {
        let valA, valB;
        if (sortConfig.key === 'confidence') {
          valA = a.avgConfidence;
          valB = b.avgConfidence;
        } else {
          valA = a[sortConfig.key];
          valB = b[sortConfig.key];
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [marketMtfData, sortConfig]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSignalBadge = (signal: SignalType) => {
    if (signal.includes('BUY')) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (signal.includes('SELL')) return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    return 'text-slate-500 bg-slate-800/50 border-slate-700/50';
  };

  const getTrendIcon = (trend: MarketTrend) => {
    if (trend === MarketTrend.BULLISH) return <span className="text-emerald-500 text-[8px]">▲</span>;
    if (trend === MarketTrend.BEARISH) return <span className="text-rose-500 text-[8px]">▼</span>;
    return <span className="text-slate-600 text-[8px]">■</span>;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-[0.2em]">{lang === 'id' ? 'Pusat Inteligensi Pasar' : 'Market Intelligence Hub'}</h2>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.4em] mt-1">Quantum Cross-Timeframe Analysis</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-950/50 border border-slate-800 text-slate-400 text-[9px] font-black uppercase tracking-widest shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          {lang === 'id' ? 'Pemindaian Aktif' : 'Active Multi-Scan'}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-800/30 text-slate-500 font-bold uppercase text-[9px] tracking-[0.25em] border-b border-slate-800">
              <th className="px-6 py-4 cursor-pointer hover:text-indigo-400 transition-colors" onClick={() => requestSort('pair')}>Pair</th>
              <th className="px-6 py-4 cursor-pointer hover:text-indigo-400 transition-colors" onClick={() => requestSort('category')}>{t.sector}</th>
              <th className="px-4 py-4 text-center">5M Signal</th>
              <th className="px-4 py-4 text-center">15M Signal</th>
              <th className="px-4 py-4 text-center">1H Signal</th>
              <th className="px-6 py-4 cursor-pointer hover:text-indigo-400 transition-colors text-center" onClick={() => requestSort('confidence')}>{t.avgConf}</th>
              <th className="px-6 py-4 text-center">{t.analyze}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {sortedData.map((data) => (
              <tr 
                key={data.pair} 
                className="hover:bg-indigo-600/5 transition-all group cursor-pointer"
                onClick={() => onSelectPair(data.pair)}
              >
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className="font-black text-xs text-slate-200 group-hover:text-indigo-400 transition-colors">{data.pair}</span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className="text-[8px] font-black text-slate-500 uppercase px-2 py-1 rounded-lg bg-slate-950/50 border border-slate-800 tracking-widest">{data.category}</span>
                </td>
                
                <td className="px-4 py-5 text-center">
                  <div className="flex flex-col items-center gap-1.5">
                    <span className={`px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border border-current ${getSignalBadge(data.signals['5M'].signal)}`}>
                      {data.signals['5M'].signal}
                    </span>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(data.signals['5M'].trend)}
                      <span className="text-[7px] text-slate-600 uppercase font-black tracking-widest">{data.signals['5M'].trend}</span>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-5 text-center">
                  <div className="flex flex-col items-center gap-1.5">
                    <span className={`px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border border-current ${getSignalBadge(data.signals['15M'].signal)}`}>
                      {data.signals['15M'].signal}
                    </span>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(data.signals['15M'].trend)}
                      <span className="text-[7px] text-slate-600 uppercase font-black tracking-widest">{data.signals['15M'].trend}</span>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-5 text-center">
                  <div className="flex flex-col items-center gap-1.5">
                    <span className={`px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border border-current ${getSignalBadge(data.signals['1H'].signal)}`}>
                      {data.signals['1H'].signal}
                    </span>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(data.signals['1H'].trend)}
                      <span className="text-[7px] text-slate-600 uppercase font-black tracking-widest">{data.signals['1H'].trend}</span>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-5">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-20 h-1 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className={`h-full transition-all duration-1000 ${data.avgConfidence > 80 ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : data.avgConfidence > 60 ? 'bg-indigo-500 shadow-[0_0_8px_#6366f1]' : 'bg-slate-600'}`} 
                        style={{ width: `${data.avgConfidence}%` }}
                      ></div>
                    </div>
                    <span className="text-[9px] font-mono font-black text-slate-400">{data.avgConfidence}%</span>
                  </div>
                </td>
                
                <td className="px-6 py-5 text-center">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPair(data.pair);
                    }}
                    className="p-2.5 rounded-xl bg-slate-800 text-slate-500 hover:bg-indigo-600 hover:text-white transition-all border border-slate-700 hover:border-indigo-500 active:scale-90 shadow-lg"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 bg-slate-950/20 border-t border-slate-800/40 text-[8px] text-slate-600 font-black uppercase tracking-[0.5em] text-center italic">
        Real-time Matrix Synchronization Active • No Latency Detected
      </div>
    </div>
  );
};

export default MarketOverview;
