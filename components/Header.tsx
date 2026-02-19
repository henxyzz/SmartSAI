
import React from 'react';
import { translations, Language } from '../translations';

interface HeaderProps {
  isLive: boolean;
  onToggleLive: () => void;
  activeView: 'dashboard' | 'market' | 'discussion' | 'news' | 'profile' | 'admin';
  onSetView: (view: any) => void;
  lang: Language;
  onLangChange: (lang: Language) => void;
  isAdmin?: boolean;
  operatorName?: string;
  connectionStatus?: 'stable' | 'unstable' | 'error';
  onTerminate: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  isLive, onToggleLive, activeView, onSetView, lang, onLangChange, isAdmin, 
  operatorName, connectionStatus, onTerminate 
}) => {
  const t = translations[lang];

  const navItems = [
    { id: 'dashboard', label: t.dashboard },
    { id: 'market', label: t.marketScanner || 'Scanner' },
    { id: 'discussion', label: t.discussion },
    { id: 'news', label: t.news },
    { id: 'profile', label: t.profile }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] bg-slate-950/70 backdrop-blur-2xl border-b border-indigo-500/20 shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all">
      <div className="max-w-[1600px] mx-auto">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg border border-white/10 cursor-pointer hover:scale-105 transition-transform" 
              onClick={() => onSetView('dashboard')}
            >
               <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
               </svg>
            </div>
            <div className="cursor-pointer" onClick={() => onSetView('dashboard')}>
              <h1 className="text-xl font-black tracking-tighter text-white font-orbitron">Smart Scalper <span className="text-indigo-500">Pro</span></h1>
            </div>
          </div>

          <nav className="hidden xl:flex items-center gap-8">
             {navItems.map(nav => (
               <button 
                  key={nav.id}
                  onClick={() => onSetView(nav.id as any)}
                  className={`text-[10px] font-black uppercase tracking-widest relative py-1 transition-all ${activeView === nav.id ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
               >
                 {nav.label}
                 {activeView === nav.id && <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-indigo-500 rounded-full shadow-[0_0_10px_#6366f1]"></span>}
               </button>
             ))}
             {isAdmin && (
               <button 
                 onClick={() => onSetView('admin')}
                 className={`text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-400 transition-all ${activeView === 'admin' ? 'border-b-2 border-rose-500' : ''}`}
               >
                 Admin
               </button>
             )}
          </nav>

          <div className="flex items-center gap-4">
            <div className="flex bg-slate-900/80 border border-slate-800 rounded-xl p-1 shadow-inner backdrop-blur-sm">
               <button onClick={() => onLangChange('en')} className={`px-3 py-1.5 text-[9px] font-black rounded-lg transition-all ${lang === 'en' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-400'}`}>EN</button>
               <button onClick={() => onLangChange('id')} className={`px-3 py-1.5 text-[9px] font-black rounded-lg transition-all ${lang === 'id' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-400'}`}>ID</button>
            </div>

            <button 
              onClick={onToggleLive}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all text-[9px] font-black uppercase tracking-widest ${isLive ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
            >
              <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]' : 'bg-slate-600'}`}></span>
              <span className="hidden sm:inline">{isLive ? 'Live' : 'Stop'}</span>
            </button>
          </div>
        </div>

        <div className="px-6 py-2 bg-slate-950/50 border-t border-slate-800/30 flex justify-between items-center overflow-x-auto no-scrollbar">
           <div className="flex gap-6 items-center shrink-0">
              <div className="flex items-center gap-2">
                 <span className="text-[8px] text-slate-600 uppercase font-black tracking-widest">Operator:</span>
                 <span className="text-[9px] text-indigo-400 font-mono font-bold">@{operatorName || 'GUEST'}</span>
              </div>
              <div className="flex items-center gap-2">
                 <span className="text-[8px] text-slate-600 uppercase font-black tracking-widest">Status:</span>
                 <span className={`text-[9px] font-mono font-bold uppercase ${connectionStatus === 'stable' ? 'text-emerald-500' : 'text-rose-500'}`}>{connectionStatus}</span>
              </div>
           </div>
           
           <button onClick={onTerminate} className="text-[9px] font-black text-rose-500/70 hover:text-rose-400 uppercase tracking-widest transition-colors shrink-0 ml-4">
             LOGOUT STATION
           </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
