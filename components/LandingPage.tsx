
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI } from "@google/genai";
import { Language, translations } from '../translations.ts';

interface LandingPageProps {
  onEnter: () => void;
  lang: Language;
  onLangChange: (lang: Language) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter, lang, onLangChange }) => {
  const t = translations[lang];
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [systemLogs, setSystemLogs] = useState<string[]>([]);

  // Simulate scrolling system logs for scifi feel
  useEffect(() => {
    const logs = [
      'INITIALIZING NEURAL LINK...',
      'ESTABLISHING SATELLITE HANDSHAKE...',
      'QUANTUM MATRIX SYNC: 98%',
      'ENCRYPTING DATA STREAM...',
      'TRADING NODES ACTIVE: 412/412',
      'LATENCY CHECK: 12ms',
      'MARKET LIQUIDITY: OPTIMAL'
    ];
    let i = 0;
    const interval = setInterval(() => {
      setSystemLogs(prev => [...prev, logs[i % logs.length]].slice(-10));
      i++;
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const runAiCS = async (query: string) => {
    if (!query.trim() || isAiLoading) return;

    setAiQuery(query);
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: (window as any).process?.env?.API_KEY || "" });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: query,
        config: {
          systemInstruction: `You are the Neural Support Liaison for Smart Scalper Pro. Your job is to act as a high-tech AI guide. 
          Respond with futuristic, data-driven intelligence. 
          Smart Scalper Pro features: 
          1. Neural-driven signals (Strong Buy/Sell).
          2. Real-time charting (5M, 15M, 1H).
          3. Institutional-grade indicators (RSI, EMA 9/21/50/200).
          4. Global community nodes.
          Respond in ${lang === 'id' ? 'Indonesian' : 'English'}. Keep responses concise and use terminal-style terminology.`
        }
      });
      setAiResponse(response.text || "Connection to Neural Core failed.");
    } catch (err) {
      setAiResponse("System error: Satellite link unstable.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const tickerItems = [
    { s: 'BTC/USD', p: '64,231.50', c: '+2.4%' },
    { s: 'XAU/USD', p: '2,341.20', c: '+0.8%' },
    { s: 'ETH/USD', p: '3,412.10', c: '-1.2%' },
    { s: 'SOL/USD', p: '145.62', c: '+5.7%' },
  ];

  const suggestedQueries = lang === 'id' 
    ? ["Bagaimana cara kerja sinyal?", "Apa itu Neural Core?", "Strategi scalping terbaik?", "Bagaimana cara daftar?"]
    : ["How do signals work?", "What is Neural Core?", "Best scalping strategy?", "How to get access?"];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden font-orbitron selection:bg-indigo-500/30">
      {/* HUD Background Elements */}
      <div className="fixed inset-0 scifi-grid opacity-20 pointer-events-none"></div>
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
         {/* Corner Brackets */}
         <div className="absolute top-10 left-10 w-20 h-20 border-t-2 border-l-2 border-indigo-500/30"></div>
         <div className="absolute top-10 right-10 w-20 h-20 border-t-2 border-r-2 border-indigo-500/30"></div>
         <div className="absolute bottom-10 left-10 w-20 h-20 border-b-2 border-l-2 border-indigo-500/30"></div>
         <div className="absolute bottom-10 right-10 w-20 h-20 border-b-2 border-r-2 border-indigo-500/30"></div>
         
         {/* Side Data Stream */}
         <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-2 opacity-10">
            {systemLogs.map((log, i) => (
              <div key={i} className="text-[8px] font-mono tracking-widest whitespace-nowrap">{log}</div>
            ))}
         </div>
      </div>

      {/* Ticker Tape */}
      <div className="sticky top-0 w-full bg-slate-950/90 border-b border-indigo-500/20 backdrop-blur-xl py-2 z-[100] flex overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <div className="flex animate-[ticker_30s_linear_infinite] whitespace-nowrap gap-12 px-4">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{item.s}</span>
              <span className="text-[9px] font-mono font-bold text-white">{item.p}</span>
              <span className={`text-[8px] font-black ${item.c.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>{item.c}</span>
            </div>
          ))}
        </div>
      </div>

      <header className="p-8 flex justify-between items-center relative z-50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.5)] border border-white/10 group cursor-pointer overflow-hidden relative">
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <svg className="w-7 h-7 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
          </div>
          <h1 className="text-white font-black text-2xl tracking-tighter uppercase">Smart Scalper <span className="text-indigo-500">Pro</span></h1>
        </div>
        <div className="flex bg-slate-900/60 border border-slate-800 rounded-xl p-1 backdrop-blur-md">
          <button onClick={() => onLangChange('en')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${lang === 'en' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>EN</button>
          <button onClick={() => onLangChange('id')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${lang === 'id' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>ID</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 space-y-32 py-10 relative z-10">
        {/* Hero Section */}
        <section className="text-center relative py-20 overflow-hidden">
          {/* Animated Tech Ring */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none opacity-20">
             <svg viewBox="0 0 200 200" className="w-full h-full animate-[spin_20s_linear_infinite]">
                <circle cx="100" cy="100" r="90" fill="none" stroke="#6366f1" strokeWidth="0.5" strokeDasharray="10 20" />
                <circle cx="100" cy="100" r="70" fill="none" stroke="#10b981" strokeWidth="0.5" strokeDasharray="5 15" className="animate-[spin_10s_linear_infinite_reverse]" />
             </svg>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }}>
            <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></span>
              <span className="text-[10px] font-black text-indigo-400 tracking-[0.4em] uppercase">{lang === 'id' ? 'PROTOKOL AKTIF v3.8' : 'PROTOCOL ACTIVE v3.8'}</span>
            </div>
            
            <h2 className="text-7xl md:text-9xl font-black text-white tracking-tighter leading-[0.85] mb-12 uppercase drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              {lang === 'id' ? 'TRADING' : 'QUANTUM'} <br /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-emerald-500">{lang === 'id' ? 'MASA DEPAN' : 'NEURAL CORE'}</span>
            </h2>
            
            <div className="flex flex-col items-center gap-8">
               <button 
                onClick={onEnter}
                className="group relative px-20 py-8 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-[32px] text-sm tracking-[0.5em] transition-all hover:scale-105 active:scale-95 shadow-[0_0_50px_rgba(99,102,241,0.4)] neon-glow overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                {lang === 'id' ? 'INISIALISASI STASIUN' : 'INITIALIZE STATION'}
              </button>
              
              <div className="flex gap-12 text-slate-500 opacity-50">
                 <div className="flex flex-col items-center">
                    <span className="text-xl font-mono text-white">94.2%</span>
                    <span className="text-[8px] uppercase tracking-widest font-black">Accuracy</span>
                 </div>
                 <div className="flex flex-col items-center">
                    <span className="text-xl font-mono text-white">12ms</span>
                    <span className="text-[8px] uppercase tracking-widest font-black">Latency</span>
                 </div>
                 <div className="flex flex-col items-center">
                    <span className="text-xl font-mono text-white">24/7</span>
                    <span className="text-[8px] uppercase tracking-widest font-black">Coverage</span>
                 </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Mission Matrix (About Us) */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10">
            <div className="inline-block p-6 bg-indigo-600/10 border border-indigo-500/30 rounded-3xl shadow-inner">
              <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="1.5" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"></path></svg>
            </div>
            <h3 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">{t.aboutMission}</h3>
            <p className="text-slate-400 text-xl leading-relaxed font-medium font-inter">
              {lang === 'id' 
                ? 'Kami menggabungkan data likuiditas institusional dengan algoritma neural tingkat lanjut untuk memberikan sinyal trading yang presisi dan instan.'
                : 'We fuse institutional liquidity data with advanced neural algorithms to deliver precise, instantaneous trading signals for high-frequency scalping.'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-[32px] hover:border-indigo-500/30 transition-all group">
                <h4 className="text-indigo-400 font-black text-xs uppercase tracking-[0.2em] mb-3">Institutional Edge</h4>
                <p className="text-[11px] text-slate-500 font-bold uppercase leading-relaxed">Direct websocket feeds from the world's largest liquidity pools.</p>
              </div>
              <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-[32px] hover:border-emerald-500/30 transition-all group">
                <h4 className="text-emerald-400 font-black text-xs uppercase tracking-[0.2em] mb-3">Risk Matrix</h4>
                <p className="text-[11px] text-slate-500 font-bold uppercase leading-relaxed">Automated protection levels calculated via ATR and neural volatility scans.</p>
              </div>
            </div>
          </div>
          
          <div className="relative group perspective-1000">
            <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] rounded-full group-hover:bg-indigo-500/40 transition-all animate-pulse"></div>
            <div className="relative bg-slate-900/80 border border-slate-700/50 p-10 rounded-[50px] shadow-2xl overflow-hidden backdrop-blur-3xl transform group-hover:rotate-y-12 transition-transform duration-700">
               <div className="flex justify-between items-center mb-12 border-b border-slate-800 pb-6">
                 <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-ping"></span>
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">System Load: 12%</span>
                 </div>
                 <span className="text-[9px] text-slate-600 font-mono">NODE_HASH: SS_P001X</span>
               </div>
               
               <div className="space-y-8">
                  <div className="space-y-3">
                     <div className="flex justify-between text-[8px] font-black text-slate-500 uppercase tracking-widest">
                        <span>Neural Sync Speed</span>
                        <span>980 GB/s</span>
                     </div>
                     <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} whileInView={{ width: '85%' }} transition={{ duration: 2 }} className="h-full bg-indigo-500 shadow-[0_0_15px_#6366f1]"></motion.div>
                     </div>
                  </div>
                  <div className="space-y-3">
                     <div className="flex justify-between text-[8px] font-black text-slate-500 uppercase tracking-widest">
                        <span>Signal Precision</span>
                        <span>94.2%</span>
                     </div>
                     <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} whileInView={{ width: '94%' }} transition={{ duration: 2, delay: 0.3 }} className="h-full bg-emerald-500 shadow-[0_0_15px_#10b981]"></motion.div>
                     </div>
                  </div>
                  <div className="space-y-3">
                     <div className="flex justify-between text-[8px] font-black text-slate-500 uppercase tracking-widest">
                        <span>Market Coverage</span>
                        <span>Global</span>
                     </div>
                     <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} whileInView={{ width: '70%' }} transition={{ duration: 2, delay: 0.6 }} className="h-full bg-cyan-500 shadow-[0_0_15px_#06b6d4]"></motion.div>
                     </div>
                  </div>
               </div>

               <div className="mt-16 text-center border-t border-slate-800 pt-8">
                  <div className="text-[40px] font-black text-white font-mono tracking-tighter mb-1">SSP CORE</div>
                  <div className="text-[8px] text-indigo-500 font-black tracking-[0.6em] uppercase">Multi-Processor Ready</div>
               </div>
            </div>
          </div>
        </section>

        {/* Neural Support Terminal (AI Guide) */}
        <section id="support-section" className="space-y-16">
          <div className="text-center space-y-4">
             <div className="inline-block p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl mb-4">
               <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
             </div>
             <h3 className="text-4xl font-black text-white uppercase tracking-tighter font-orbitron">{t.aiAssistantTitle}</h3>
             <p className="text-slate-500 text-sm max-w-xl mx-auto uppercase font-black tracking-[0.3em] leading-relaxed">{t.aiAssistantDesc}</p>
          </div>

          <div className="max-w-4xl mx-auto bg-slate-950 border border-indigo-500/30 rounded-[40px] p-1 shadow-[0_0_100px_rgba(99,102,241,0.1)] relative overflow-hidden group">
            {/* Inner Terminal */}
            <div className="bg-[#020617] rounded-[38px] p-10 space-y-8 relative z-10">
              <div className="flex justify-between items-center px-2">
                 <div className="flex gap-2">
                   <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50"></div>
                   <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50"></div>
                   <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50"></div>
                 </div>
                 <span className="text-[8px] font-mono text-slate-700 tracking-widest uppercase">SSP_LIAISON_SHELL_v2.0</span>
              </div>

              <div className="h-80 bg-slate-900/30 border border-slate-800/50 rounded-3xl p-8 overflow-y-auto custom-scrollbar relative">
                {/* CRT Effect Overlay */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-20 bg-[length:100%_4px,3px_100%]"></div>
                
                {aiResponse ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="flex items-center gap-3">
                      <span className="text-indigo-400 font-black text-[10px] uppercase tracking-widest font-mono">[LIAISON]</span>
                      <div className="flex-1 h-px bg-indigo-500/20"></div>
                    </div>
                    <p className="text-slate-200 font-mono text-xs leading-relaxed whitespace-pre-wrap">{aiResponse}</p>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700">
                    <div className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center animate-pulse">
                      <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="1" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Node Connection Established</p>
                      <p className="text-[9px] font-mono text-indigo-400">Awaiting your tactical query...</p>
                    </div>
                  </div>
                )}
                
                {isAiLoading && (
                  <div className="flex items-center gap-4 mt-8">
                     <div className="w-2 h-2 bg-indigo-500 animate-ping"></div>
                     <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest font-mono">Processing Neural Request...</span>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="flex flex-wrap gap-2">
                   {suggestedQueries.map((q, i) => (
                     <button 
                      key={i} 
                      onClick={() => runAiCS(q)}
                      className="px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-xl text-[9px] font-black uppercase text-slate-500 hover:text-white hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all active:scale-95"
                    >
                      {q}
                    </button>
                   ))}
                </div>

                <form 
                  onSubmit={(e) => { e.preventDefault(); runAiCS(aiQuery); }}
                  className="flex gap-4 p-2 bg-slate-900 border border-slate-800 rounded-2xl focus-within:border-indigo-500/50 transition-all"
                >
                  <input 
                    type="text" 
                    placeholder={t.askAnything}
                    className="flex-1 bg-transparent px-6 py-4 text-xs text-white outline-none font-mono"
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                  />
                  <button 
                    type="submit" 
                    disabled={isAiLoading}
                    className="px-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-xl shadow-indigo-900/40 active:scale-95 disabled:opacity-50 font-black uppercase tracking-widest text-[10px]"
                  >
                    Transmit
                  </button>
                </form>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
             <a href="https://t.me/smartscalperpro" target="_blank" className="p-10 bg-slate-900/40 border border-slate-800 rounded-[40px] group hover:border-indigo-500/40 transition-all flex items-center gap-8 shadow-2xl">
                <div className="w-16 h-16 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform shadow-inner">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.52-1.4.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.45-.42-1.39-.89.03-.24.37-.49 1.02-.73 4-1.74 6.67-2.88 8.01-3.41 3.81-1.51 4.6-1.77 5.12-1.78.11 0 .37.03.54.17.14.11.18.26.2.38.01.07.02.21.01.32z"/></svg>
                </div>
                <div>
                   <h4 className="text-white font-black uppercase text-sm tracking-widest mb-1">{t.contactTG}</h4>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">@smartscalperpro_hq</p>
                </div>
             </a>
             <a href="mailto:support@smartscalperpro.io" className="p-10 bg-slate-900/40 border border-slate-800 rounded-[40px] group hover:border-emerald-500/40 transition-all flex items-center gap-8 shadow-2xl">
                <div className="w-16 h-16 bg-emerald-600/10 rounded-2xl flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform shadow-inner">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                </div>
                <div>
                   <h4 className="text-white font-black uppercase text-sm tracking-widest mb-1">{t.contactEmail}</h4>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">matrix@smartscalperpro.io</p>
                </div>
             </a>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-24 grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { title: 'Neural Matrix', desc: 'Sinyal berbasis AI dengan tingkat kepercayaan yang divalidasi secara real-time.', icon: 'M13 10V3L4 14h7v7l9-11h-7z', color: 'text-indigo-500' },
             { title: 'Market Terminal', desc: 'Grafik profesional dengan latensi nol untuk aset Gold, Crypto, dan Forex.', icon: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4', color: 'text-emerald-500' },
             { title: 'Secure Protocol', desc: 'Enkripsi end-to-end untuk semua data transmisi dan interaksi komunitas.', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', color: 'text-cyan-500' }
           ].map((item, i) => (
             <div key={i} className="p-10 bg-slate-900/30 border border-slate-800 rounded-[40px] hover:border-indigo-500/40 transition-all group overflow-hidden relative shadow-xl">
               <div className={`w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center ${item.color} mb-8 group-hover:scale-110 transition-transform`}>
                 <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2.5" d={item.icon} /></svg>
               </div>
               <h4 className="text-white font-black text-xs uppercase tracking-widest mb-4">{item.title}</h4>
               <p className="text-[11px] text-slate-500 font-bold uppercase leading-relaxed">{item.desc}</p>
             </div>
           ))}
        </section>
      </main>

      <footer className="p-16 text-center border-t border-slate-900 bg-slate-950/60 backdrop-blur-xl relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 opacity-40">
           <span className="text-[9px] font-black text-slate-500 tracking-[0.6em] uppercase">
            SECURE PROTOCOL v3.8.4 ACTIVE // {new Date().getFullYear()}
           </span>
           <div className="flex gap-12 text-[8px] font-black uppercase tracking-[0.4em]">
              <a href="#" className="hover:text-indigo-400">Terms</a>
              <a href="#" className="hover:text-indigo-400">Privacy</a>
              <a href="#" className="hover:text-indigo-400">API</a>
           </div>
        </div>
      </footer>

      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .perspective-1000 {
          perspective: 1000px;
        }
        .rotate-y-12 {
          transform: rotateY(12deg);
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
