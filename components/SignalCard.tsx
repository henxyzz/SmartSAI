import React, { useState, useEffect } from 'react';
import { TradingSignal, SignalType } from '../types.ts';
import { translations, Language } from '../translations.ts';

interface SignalCardProps {
  signal: TradingSignal;
  timezone: string;
  lang: Language;
  onViewChart?: () => void;
  onRunNeural?: () => void;
}

const SignalCard: React.FC<SignalCardProps> = ({ signal, timezone, lang, onViewChart, onRunNeural }) => {
  const t = translations[lang];
  const isBuy = signal.signal.includes('BUY');
  const isNeutral = signal.signal === SignalType.NEUTRAL;
  
  const bgColor = isNeutral 
    ? 'bg-slate-900/60 border-slate-800' 
    : isBuy 
      ? 'bg-emerald-950/20 border-emerald-500/30' 
      : 'bg-rose-950/20 border-rose-500/30';
  
  const textColor = isNeutral ? 'text-slate-500' : isBuy ? 'text-emerald-400' : 'text-rose-400';
  const glowClass = isNeutral ? '' : isBuy ? 'shadow-[0_0_50px_rgba(16,185,129,0.1)]' : 'shadow-[0_0_50px_rgba(244,63,94,0.1)]';

  const getEmaColor = (emaVal: number) => {
    if (isBuy) return emaVal < signal.entry ? 'text-emerald-400' : 'text-slate-400';
    return emaVal > signal.entry ? 'text-rose-400' : 'text-slate-400';
  };

  return (
    <div className={`p-8 rounded-[48px] border ${bgColor} transition-all duration-700 ${glowClass} relative overflow-hidden backdrop-blur-3xl shadow-2xl group animate-in zoom-in duration-500`}>
      {/* Neural Background Pattern */}
      <div className="absolute inset-0 scifi-grid opacity-[0.03] pointer-events-none"></div>
      
      {/* Asset Watermark */}
      <div className="absolute -right-6 -bottom-6 text-[120px] font-black text-white/[0.02] pointer-events-none select-none tracking-tighter italic">
        {signal.pair.split('USD')[0]}
      </div>

      <div className="relative z-10">
        {/* Top Meta Bar */}
        <div className="flex justify-between items-start mb-8">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isNeutral ? 'bg-slate-600' : isBuy ? 'bg-emerald-500 shadow-[0_0_12px_#10b981]' : 'bg-rose-500 shadow-[0_0_12px_#f43f5e]'} animate-pulse`}></span>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] font-orbitron">{signal.pair} • {signal.timeframe}</span>
            </div>
            
            {signal.isBreakout && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/20 border border-indigo-500/40 rounded-full animate-pulse shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                <svg className="w-3.5 h-3.5 text-indigo-400" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest font-mono">BREAKOUT CONFIRMED</span>
              </div>
            )}

            <h2 className={`text-5xl font-black tracking-tighter ${textColor} uppercase leading-none pt-2`}>
              {signal.signal}
            </h2>
          </div>
          
          <div className="text-right">
            <div className="bg-slate-950/60 border border-white/5 rounded-3xl p-4 flex flex-col items-end shadow-inner">
               <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1.5 opacity-60">Neural Logic</span>
               <div className={`text-3xl font-black ${textColor} font-mono leading-none flex items-baseline gap-0.5`}>
                 {signal.confidence}<span className="text-xs">%</span>
               </div>
               <div className="w-24 h-1.5 bg-slate-800/50 rounded-full mt-3 overflow-hidden">
                 <div 
                   className={`h-full transition-all duration-[1500ms] ease-out ${isBuy ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                   style={{ width: `${signal.confidence}%` }}
                 ></div>
               </div>
            </div>
          </div>
        </div>

        {/* Execution Levels */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-5 rounded-[28px] bg-slate-950/60 border border-white/5 flex flex-col items-center justify-center group/lvl hover:border-indigo-500/30 transition-all">
            <span className="text-[8px] text-slate-500 uppercase font-black mb-2 tracking-widest">Entry Target</span>
            <span className="text-sm font-mono font-bold text-white group-hover/lvl:text-indigo-400 transition-colors">{signal.entry}</span>
          </div>
          <div className="p-5 rounded-[28px] bg-rose-500/5 border border-rose-500/20 flex flex-col items-center justify-center group/lvl hover:border-rose-500/40 transition-all">
            <span className="text-[8px] text-rose-500/60 uppercase font-black mb-2 tracking-widest">Stop Protection</span>
            <span className="text-sm font-mono font-bold text-rose-400 group-hover/lvl:scale-105 transition-transform">{signal.stopLoss}</span>
          </div>
          <div className="p-5 rounded-[28px] bg-emerald-500/5 border border-emerald-500/20 flex flex-col items-center justify-center group/lvl hover:border-emerald-500/40 transition-all">
            <span className="text-[8px] text-emerald-500/60 uppercase font-black mb-2 tracking-widest">Profit Target</span>
            <span className="text-sm font-mono font-bold text-emerald-400 group-hover/lvl:scale-105 transition-transform">{signal.takeProfit}</span>
          </div>
        </div>

        {/* High-Fidelity Technical Matrix */}
        <div className="mb-10 p-6 bg-slate-950/40 border border-slate-800 rounded-[36px] space-y-6 relative group/matrix">
           <div className="absolute top-0 right-0 p-4 opacity-20">
             <svg className="w-16 h-16 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1"><path d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/><path d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/></svg>
           </div>
           
           <div className="flex justify-between items-center px-1">
             <div className="flex items-center gap-3">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em]">Technical Pulse Matrix</span>
             </div>
             <span className="text-[8px] text-slate-600 font-mono tracking-widest">LATEST_SYNC: {new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
           </div>
           
           <div className="grid grid-cols-2 gap-x-8 gap-y-5">
             {/* RSI Block */}
             <div className="flex justify-between items-center border-b border-slate-800/60 pb-3 col-span-2">
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-900 rounded-lg text-indigo-400">
                   <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" strokeWidth="2.5"/></svg>
                 </div>
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">RSI (14)</span>
               </div>
               <div className="flex items-center gap-3">
                 {signal.indicators.rsi > 70 && <span className="text-[8px] font-black text-rose-500 uppercase tracking-tighter">Overbought</span>}
                 {signal.indicators.rsi < 30 && <span className="text-[8px] font-black text-emerald-500 uppercase tracking-tighter">Oversold</span>}
                 <span className={`text-base font-mono font-black ${signal.indicators.rsi > 70 ? 'text-rose-400' : signal.indicators.rsi < 30 ? 'text-emerald-400' : 'text-white'}`}>
                   {signal.indicators.rsi.toFixed(2)}
                 </span>
               </div>
             </div>

             {/* EMA Grid */}
             {[
               { label: 'EMA 9', val: signal.indicators.ema9, icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
               { label: 'EMA 21', val: signal.indicators.ema21, icon: 'M7 12l3-3 3 3 4-4' },
               { label: 'EMA 50', val: signal.indicators.ema50, icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z' },
               { label: 'EMA 200', val: signal.indicators.ema200, icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9' }
             ].map((ema) => (
               <div key={ema.label} className="flex justify-between items-center group/ema">
                 <div className="flex items-center gap-2.5">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest group-hover/ema:text-slate-300 transition-colors">{ema.label}</span>
                 </div>
                 <span className={`text-[12px] font-mono font-bold ${getEmaColor(ema.val)}`}>
                   {ema.val.toFixed(5)}
                 </span>
               </div>
             ))}
           </div>
        </div>

        {/* Call to Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button 
            onClick={onViewChart}
            className={`w-full py-5 rounded-[26px] font-black uppercase tracking-[0.25em] text-[11px] transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95 border-b-4 ${isBuy ? 'bg-emerald-600 border-emerald-800 hover:bg-emerald-500 shadow-emerald-900/40' : 'bg-rose-600 border-rose-800 hover:bg-rose-500 shadow-rose-900/40'} text-white`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="3" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4" /></svg>
            {t.viewChart}
          </button>
          
          <button 
            onClick={onRunNeural}
            className="w-full py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-[26px] text-[11px] font-black uppercase tracking-[0.25em] border border-slate-700 transition-all flex items-center justify-center gap-3 active:scale-95 group/scan shadow-xl"
          >
            <svg className="w-4 h-4 text-indigo-400 group-hover/scan:animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            {t.neuralAnalysis}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignalCard;
