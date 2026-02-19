
import React, { useState, useEffect, useRef } from 'react';
import { 
  Candlestick, TradingSignal, 
  AppSettings, SUPPORTED_PAIRS
} from './types.ts';
import { generateHistoricalData } from './services/mockDataService.ts';
import { generateSignal } from './services/tradingLogic.ts';
import Header from './components/Header.tsx';
import SignalCard from './components/SignalCard.tsx';
import ChartContainer from './components/ChartContainer.tsx';
import SignalHistory from './components/SignalHistory.tsx';
import SettingsPanel from './components/SettingsPanel.tsx';
import MarketOverview from './components/MarketOverview.tsx';
import ProfitCalculator from './components/ProfitCalculator.tsx';
import AuthSystem from './components/AuthSystem.tsx';
import AiAnalysisModal from './components/AiAnalysisModal.tsx';
import GlobalDiscussion from './components/GlobalDiscussion.tsx';
import ProfileSettings from './components/ProfileSettings.tsx';
import NewsView from './components/NewsView.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import LandingPage from './components/LandingPage.tsx';
import { UserData } from './services/firebase.ts';
import { translations, Language } from './translations.ts';

const BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws';
const BINANCE_REST_URL = 'https://api.binance.com/api/v3/klines';

const App: React.FC = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('ssp_lang') as Language) || 'id');
  const t = translations[lang];

  const [activeView, setActiveView] = useState<'dashboard' | 'market' | 'discussion' | 'news' | 'profile' | 'admin'>('dashboard');
  const [selectedPair, setSelectedPair] = useState('BTCUSD');
  const [currentTimeframe, setCurrentTimeframe] = useState('5m');
  const [candles, setCandles] = useState<Candlestick[]>([]);
  const [currentSignal, setCurrentSignal] = useState<TradingSignal | null>(null);
  
  const [history, setHistory] = useState<TradingSignal[]>(() => {
    try {
      const saved = localStorage.getItem('ssp_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [isLive, setIsLive] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'stable' | 'unstable' | 'error'>('stable');
  
  const [settings, setSettings] = useState<AppSettings>({ 
    riskPercentage: 1, 
    rrRatio: 2, 
    timezone: 'UTC', 
    scalpingMode: false, 
    breakoutSensitivity: 1.0
  });

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('ssp_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed?.id) {
          setUser(parsed);
          setIsAuthenticated(true);
        }
      } catch (e) { localStorage.removeItem('ssp_user'); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('ssp_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('ssp_lang', lang);
  }, [lang]);

  const mapSymbolForBinance = (pair: string) => {
    const mapping: Record<string, string> = {
      'XAUUSD': 'PAXGUSDT', 'BTCUSD': 'BTCUSDT', 'ETHUSD': 'ETHUSDT',
      'SOLUSD': 'SOLUSDT', 'EURUSD': 'EURUSDT', 'GBPUSD': 'GBPUSDT',
      'NAS100': 'USTECUSDT', 'US30': 'USDT'
    };
    return mapping[pair] || pair.replace('USD', 'USDT');
  };

  const isFiniteNum = (v: any) => typeof v === 'number' && isFinite(v);

  const fetchHistory = async (pair: string, tf: string) => {
    setIsFetching(true);
    const symbol = mapSymbolForBinance(pair);
    try {
      const response = await fetch(`${BINANCE_REST_URL}?symbol=${symbol}&interval=${tf}&limit=500`);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Invalid response format");
      
      const formatted: Candlestick[] = data
        .map((d: any) => ({
          time: Math.floor(Number(d[0]) / 1000),
          open: Number(d[1]),
          high: Number(d[2]),
          low: Number(d[3]),
          close: Number(d[4]),
          volume: Number(d[5])
        }))
        .filter(c => 
          isFiniteNum(c.time) && c.time > 0 &&
          isFiniteNum(c.open) && isFiniteNum(c.high) && 
          isFiniteNum(c.low) && isFiniteNum(c.close)
        )
        .sort((a, b) => a.time - b.time); // Critical: ensure sorting for chart engine
      
      setCandles(formatted);
      setConnectionStatus('stable');
    } catch (err) {
      console.error("Fetch failure:", err);
      setCandles(generateHistoricalData(200, pair.includes('BTC') ? 60000 : 2000));
      setConnectionStatus('unstable');
    } finally { setIsFetching(false); }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchHistory(selectedPair, currentTimeframe);
    setCurrentSignal(null);
    
    if (wsRef.current) wsRef.current.close();
    
    const symbol = mapSymbolForBinance(selectedPair).toLowerCase();
    const ws = new WebSocket(`${BINANCE_WS_URL}/${symbol}@kline_${currentTimeframe}`);
    
    ws.onmessage = (event) => {
      if (!isLive) return;
      
      try {
        const msg = JSON.parse(event.data);
        if (!msg.k) return;
        
        const k = msg.k;
        const incomingCandle: Candlestick = {
          time: Math.floor(Number(k.t) / 1000),
          open: Number(k.o),
          high: Number(k.h),
          low: Number(k.l),
          close: Number(k.c),
          volume: Number(k.v)
        };

        if (!isFiniteNum(incomingCandle.time) || !isFiniteNum(incomingCandle.close)) return;

        setCandles(prev => {
          if (prev.length === 0) return [incomingCandle];
          const lastCandle = prev[prev.length - 1];
          if (incomingCandle.time === lastCandle.time) {
            const updated = [...prev];
            updated[updated.length - 1] = incomingCandle;
            return updated;
          } else if (incomingCandle.time > lastCandle.time) {
            const updated = [...prev, incomingCandle];
            return updated.length > 500 ? updated.slice(-500) : updated;
          }
          return prev;
        });
      } catch (err) {
        console.error("WS Matrix Sync Error:", err);
      }
    };

    ws.onopen = () => setConnectionStatus('stable');
    ws.onerror = () => setConnectionStatus('error');
    ws.onclose = () => setConnectionStatus('unstable');
    
    wsRef.current = ws;
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [selectedPair, currentTimeframe, isAuthenticated, isLive]);

  const handleGetSignal = () => {
    if (candles.length === 0 || isAnalyzing) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      const sig = generateSignal(selectedPair, currentTimeframe.toUpperCase(), candles, settings.rrRatio, settings.scalpingMode, settings.breakoutSensitivity);
      setCurrentSignal(sig);
      setHistory(h => [sig, ...h].slice(0, 50));
      setIsAnalyzing(false);
    }, 1200);
  };

  const handleViewSignalChart = (sig: TradingSignal) => {
    setSelectedPair(sig.pair);
    setCurrentTimeframe(sig.timeframe.toLowerCase());
    setActiveView('dashboard');
    setCurrentSignal(sig);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  };

  const handleClearHistory = () => {
    if (window.confirm(lang === 'id' ? "Konfirmasi: Bersihkan seluruh riwayat sinyal?" : "Confirm: Purge all signal history?")) {
      setHistory([]);
      localStorage.removeItem('ssp_history');
    }
  };

  const handleTerminate = () => {
    if (window.confirm(lang === 'id' ? "Akhiri sesi operator?" : "Terminate operator session?")) {
      localStorage.removeItem('ssp_user');
      setIsAuthenticated(false);
      setUser(null);
      setShowAuth(false);
    }
  };

  if (!isAuthenticated && !showAuth) return <LandingPage onEnter={() => setShowAuth(true)} lang={lang} onLangChange={setLang} />;
  if (!isAuthenticated && showAuth) return <AuthSystem onSuccess={(u) => { setUser(u); setIsAuthenticated(true); localStorage.setItem('ssp_user', JSON.stringify(u)); }} />;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-indigo-500/30 relative pb-24">
      {/* HUD Background Elements */}
      <div className="fixed inset-0 scifi-grid opacity-20 pointer-events-none"></div>
      <div className="fixed inset-0 hex-bg opacity-10 pointer-events-none"></div>
      
      <Header 
        isLive={isLive} 
        onToggleLive={() => setIsLive(!isLive)} 
        activeView={activeView} 
        onSetView={setActiveView} 
        lang={lang} 
        onLangChange={setLang}
        isAdmin={user?.isAdmin}
        operatorName={user?.username}
        connectionStatus={connectionStatus}
        onTerminate={handleTerminate}
      />

      <main className="max-w-[1600px] mx-auto px-6 pt-32">
        {activeView === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start pb-24">
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-slate-900/60 border border-slate-800 rounded-[32px] p-8 backdrop-blur-md space-y-6 shadow-2xl relative z-10">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Asset Control Hub</label>
                <select 
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white font-black uppercase tracking-widest outline-none text-[11px] focus:border-indigo-500 cursor-pointer"
                  value={selectedPair}
                  onChange={(e) => setSelectedPair(e.target.value)}
                >
                  {SUPPORTED_PAIRS.map(p => <option key={p.symbol} value={p.symbol}>{p.symbol}</option>)}
                </select>
                <button 
                  onClick={handleGetSignal} 
                  disabled={isAnalyzing || isFetching} 
                  className="w-full py-5 rounded-2xl font-black bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:opacity-50 shadow-xl shadow-indigo-900/20 uppercase tracking-[0.2em] text-[10px] active:scale-95"
                >
                  {isAnalyzing ? (lang === 'id' ? 'MEMPROSES...' : 'PROCESSING...') : (lang === 'id' ? 'SCAN NEURAL' : 'NEURAL SCAN')}
                </button>
              </div>
              
              {currentSignal && (
                <SignalCard 
                  signal={currentSignal} 
                  timezone={settings.timezone} 
                  lang={lang} 
                  onViewChart={() => handleViewSignalChart(currentSignal)}
                  onRunNeural={() => setShowAiModal(true)}
                />
              )}

              <SettingsPanel settings={settings} onUpdate={setSettings} />
              <ProfitCalculator currentPrice={candles[candles.length - 1]?.close || 0} />
            </div>

            <div className="lg:col-span-8 space-y-10">
              <ChartContainer 
                data={candles} 
                pair={selectedPair} 
                timeframe={currentTimeframe} 
                onTimeframeChange={setCurrentTimeframe} 
                timezone={settings.timezone}
                onRunAnalysis={() => setShowAiModal(true)}
                lang={lang}
                history={history}
                currentSignal={currentSignal}
              />
              <SignalHistory 
                history={history} 
                timezone={settings.timezone} 
                onClear={handleClearHistory} 
                lang={lang} 
                onDeleteSignal={(id) => setHistory(h => h.filter(s => s.id !== id))}
                onViewSignal={handleViewSignalChart}
              />
            </div>
          </div>
        )}

        {activeView === 'market' && (
          <MarketOverview 
            onSelectPair={(p) => { setSelectedPair(p); setActiveView('dashboard'); }} 
            timezone={settings.timezone} 
            rrRatio={settings.rrRatio} 
            breakoutSensitivity={settings.breakoutSensitivity} 
            lang={lang} 
          />
        )}

        {activeView === 'discussion' && <GlobalDiscussion user={user!} lang={lang} onSetView={setActiveView} />}
        {activeView === 'news' && <NewsView lang={lang} user={user} />}
        {activeView === 'profile' && <ProfileSettings user={user!} lang={lang} onUpdate={(u) => { setUser(u); localStorage.setItem('ssp_user', JSON.stringify(u)); }} onSetView={setActiveView} />}
        {activeView === 'admin' && user?.isAdmin && <AdminPanel currentAdmin={user} lang={lang} onSetView={setActiveView} />}
      </main>

      {showAiModal && currentSignal && (
        <AiAnalysisModal 
          signal={currentSignal} 
          candles={candles} 
          user={user!} 
          lang={lang} 
          onClose={() => setShowAiModal(false)} 
        />
      )}
      
      {/* Mobile Nav with Glassmorphism */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] lg:hidden glass-nav px-6 py-4 rounded-[32px] flex items-center justify-between gap-6 shadow-2xl backdrop-blur-xl bg-slate-900/70 border border-indigo-500/20">
         {[
           { id: 'dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
           { id: 'market', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2m0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
           { id: 'discussion', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
           { id: 'news', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z' },
           { id: 'profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' }
         ].map(item => (
           <button 
             key={item.id} 
             onClick={() => setActiveView(item.id as any)}
             className={`p-3 rounded-2xl transition-all duration-300 shrink-0 ${activeView === item.id ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.5)] scale-110' : 'text-slate-400 hover:text-slate-200'}`}
           >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={item.icon} /></svg>
           </button>
         ))}
      </nav>
    </div>
  );
};

export default App;
