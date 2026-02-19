
import React from 'react';
import { BacktestResult } from '../types';

interface BacktestViewProps {
  result: BacktestResult;
  pair: string;
}

const BacktestView: React.FC<BacktestViewProps> = ({ result, pair }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Backtest Performance Report</h2>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-1">Instrument: {pair} • Last 150 Bars</p>
        </div>
        <div className="flex gap-2">
           <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-lg">Verified Stats</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-800">
        <div className="p-8 text-center">
          <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-2">Win Rate</div>
          <div className="text-4xl font-black text-emerald-400">{result.winRate.toFixed(1)}%</div>
        </div>
        <div className="p-8 text-center">
          <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-2">Total Trades</div>
          <div className="text-4xl font-black text-white">{result.totalTrades}</div>
        </div>
        <div className="p-8 text-center">
          <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-2">Profit Factor</div>
          <div className="text-4xl font-black text-indigo-400">{result.profitFactor.toFixed(2)}</div>
        </div>
        <div className="p-8 text-center">
          <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-2">Net Profit</div>
          <div className="text-4xl font-black text-emerald-400">+${result.netProfit.toFixed(0)}</div>
        </div>
      </div>

      <div className="p-8 bg-slate-950/30">
        <h4 className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-4">Equity Growth Projection</h4>
        <div className="h-48 flex items-end gap-1">
          {result.equityCurve.map((val, i) => {
            const min = Math.min(...result.equityCurve);
            const max = Math.max(...result.equityCurve);
            const height = ((val - min) / (max - min)) * 100;
            return (
              <div 
                key={i} 
                style={{ height: `${Math.max(5, height)}%` }} 
                className="flex-1 bg-indigo-500/40 rounded-t-sm hover:bg-indigo-400 transition-all cursor-pointer relative group"
              >
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[8px] px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  ${val.toFixed(0)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-6 border-t border-slate-800 text-center text-slate-600 text-[10px] uppercase font-bold tracking-[0.3em]">
        Simulation engine strictly follows technical confirmation logic with no hindsight bias.
      </div>
    </div>
  );
};

export default BacktestView;
