
import React, { useState } from 'react';

interface ProfitCalculatorProps {
  currentPrice: number;
}

const ProfitCalculator: React.FC<ProfitCalculatorProps> = ({ currentPrice }) => {
  const [balance, setBalance] = useState(1000);
  const [risk, setRisk] = useState(1);
  const [rr, setRr] = useState(2);
  const [winRate, setWinRate] = useState(50);
  const [trades, setTrades] = useState(10);

  const calculate = () => {
    const riskAmount = balance * (risk / 100);
    const winAmount = riskAmount * rr;
    const wins = Math.floor(trades * (winRate / 100));
    const losses = trades - wins;
    const net = (wins * winAmount) - (losses * riskAmount);
    return {
      net,
      final: balance + net,
      roi: (net / balance) * 100
    };
  };

  const results = calculate();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl h-full">
      <h4 className="text-[10px] font-black text-slate-400 mb-6 uppercase tracking-[0.2em] flex items-center gap-2">
        <svg className="w-3 h-3 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
        </svg>
        Profit Simulator
      </h4>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Account Balance ($)</label>
            <input 
              type="number" 
              value={balance} 
              onChange={(e) => setBalance(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Risk per Trade (%)</label>
            <input 
              type="number" 
              value={risk} 
              onChange={(e) => setRisk(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Risk Reward (1:X)</label>
            <input 
              type="number" 
              value={rr} 
              onChange={(e) => setRr(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Est. Win Rate (%)</label>
            <input 
              type="number" 
              value={winRate} 
              onChange={(e) => setWinRate(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Estimated Net Profit</span>
            <span className={`text-lg font-black ${results.net >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              ${results.net.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Return on Investment</span>
            <span className={`text-sm font-black ${results.roi >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {results.roi.toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="text-[9px] text-slate-500 italic text-center">
          * Based on {trades} simulated trades. Trading involves risk.
        </div>
      </div>
    </div>
  );
};

export default ProfitCalculator;
