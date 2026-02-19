
import React from 'react';
import { translations, Language } from './translations';

interface HeaderProps {
  isLive: boolean;
  onToggleLive: () => void;
  activeView: 'dashboard' | 'market' | 'backtest' | 'discussion' | 'profile' | 'admin';
  onSetView: (view: 'dashboard' | 'market' | 'backtest' | 'discussion' | 'profile' | 'admin') => void;
  lang: Language;
  onLangChange: (lang: Language) => void;
  isAdmin?: boolean;
}

const Header: React.FC<HeaderProps> = ({ isLive, onToggleLive, activeView, onSetView, lang, onLangChange, isAdmin }) => {
  const t = translations[lang];

  return (
    <header className="sticky top-0 z-[100] bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-6 py-4">
      <div className="max-w-[1600px] mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
             <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
             </svg>
          </div>
          <div className="cursor-pointer" onClick={() => onSetView('dashboard')}>
            <h1 className="text-xl font-bold tracking-tight text-white leading-none hidden sm:block">Smart Scalper Pro</h1>
            <span className="text-[10px] font-bold text-indigo-400 tracking-[0.2em] uppercase">Quant Suite</span>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-6 text-sm font-bold uppercase tracking-widest text-[9px]">
           {[
             { id: 'dashboard', label: t.dashboard },
             { id: 'market', label: t.marketScanner },
             { id: 'discussion', label: t.discussion },
             { id: 'profile', label: t.profile }
           ].map(nav => (
             <button 
                key={nav.id}
                onClick={() => onSetView(nav.id as any)}
                className={`transition-all hover:text-white ${activeView === nav.id ? 'text-indigo-400 border-b-2 border-indigo-500 pb-1' : 'text-slate-500'}`}
             >
               {nav.label}
             </button>
           ))}
           {isAdmin && (
             <button 
               onClick={() => onSetView('admin')}
               className={`transition-all font-black text-rose-500 hover:text-rose-400 ${activeView === 'admin' ? 'border-b-2 border-rose-500 pb-1' : ''}`}
             >
               ADMIN COMMAND
             </button>
           )}
        </nav>

        <div className="flex items-center gap-4">
          <div className="flex bg-slate-800/50 rounded-lg p-0.5 border border-slate-700">
             <button onClick={() => onLangChange('en')} className={`px-2 py-1 text-[8px] font-black rounded ${lang === 'en' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>EN</button>
             <button onClick={() => onLangChange('id')} className={`px-2 py-1 text-[8px] font-black rounded ${lang === 'id' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>ID</button>
          </div>

          <button 
            onClick={onToggleLive}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 text-[10px] font-bold uppercase tracking-widest ${isLive ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
          >
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`}></span>
            <span className="hidden sm:inline">{isLive ? t.liveEngine : t.paused}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
