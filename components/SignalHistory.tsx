
import React from 'react';
import { TradingSignal } from '../types.ts';
import { translations, Language } from '../translations.ts';

interface SignalHistoryProps {
  history: TradingSignal[];
  timezone: string;
  onClear: () => void;
  lang: Language;
  onDeleteSignal?: (id: string) => void;
  onViewSignal?: (sig: TradingSignal) => void;
}

const SignalHistory: React.FC<SignalHistoryProps> = ({ history, timezone, onClear, lang, onDeleteSignal, onViewSignal }) => {
  const t = translations[lang];
  
  const formatTime = (timestamp: number) => {
    try {
      return new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit', minute: '2-digit',
        timeZone: timezone, hour12: false
      }).format(new Date(timestamp));
    } catch (e) { return new Date(timestamp).toLocaleTimeString(); }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden shadow-xl">
      <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2.5"/></svg>
          </div>
          <h3 className="text-[11px] font-black text-slate-200 uppercase tracking-widest">{t.signalHistory}</h3>
        </div>
        {history.length > 0 && (
          <button 
            onClick={onClear}
            className="px-4 py-2 bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white rounded-xl text-[8px] font-black uppercase tracking-widest transition-all border border-rose-500/20 active:scale-95"
          >
            {t.clearHistory}
          </button>
        )}
      </div>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-sm min-w-[650px]">
          <thead>
            <tr className="bg-slate-800/30 text-slate-500 font-bold uppercase text-[9px] tracking-widest border-b border-slate-800">
              <th className="px-6 py-4 text-center w-20">Focus</th>
              <th className="px-6 py-4">Time</th>
              <th className="px-6 py-4">Asset</th>
              <th className="px-6 py-4">Signal</th>
              <th className="px-6 py-4 text-right">Entry</th>
              <th className="px-6 py-4 text-center">Conf</th>
              <th className="px-6 py-4 text-right w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {history.length > 0 ? (
              history.map((s) => (
                <tr key={s.id} className="hover:bg-indigo-600/5 transition-colors group">
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => onViewSignal?.(s)}
                      className="p-2 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-500 hover:text-white rounded-lg transition-all border border-indigo-500/20 shadow-sm"
                      title="Focus on Chart"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth="3"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeWidth="2.5"/></svg>
                    </button>
                  </td>
                  <td className="px-6 py-4 text-slate-400 font-mono text-[10px]">{formatTime(s.timestamp)}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-200 text-xs">{s.pair}</div>
                    <div className="text-[8px] text-indigo-400 font-bold uppercase tracking-widest">{s.timeframe}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border ${s.signal.includes('BUY') ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' : 'text-rose-400 border-rose-500/20 bg-rose-500/5'}`}>
                      {s.signal}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-slate-300 text-xs">{s.entry}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-[10px] font-black text-slate-500">{s.confidence}%</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {onDeleteSignal && (
                      <button 
                        onClick={() => onDeleteSignal(s.id)}
                        className="p-2 text-slate-700 hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-500/10 opacity-0 group-hover:opacity-100"
                        title="Remove Record"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6" strokeWidth="2"/></svg>
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-3 opacity-20">
                    <svg className="w-12 h-12 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" strokeWidth="2"/></svg>
                    <p className="text-[10px] uppercase font-black italic tracking-widest text-slate-500">Log Buffer Empty // No Signals Generated</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="p-4 bg-slate-950/20 border-t border-slate-800/40 text-[8px] text-slate-700 font-black uppercase tracking-[0.5em] text-center">
        Stationary Log Protocol v3.8 // End of Buffer
      </div>
    </div>
  );
};

export default SignalHistory;
