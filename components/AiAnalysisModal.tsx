
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { TradingSignal, Candlestick } from '../types';
import { translations, Language } from '../translations';
import { motion, AnimatePresence } from 'framer-motion';
import { UserData } from '../services/firebase.ts';

interface AiAnalysisModalProps {
  signal: TradingSignal;
  candles: Candlestick[];
  onClose: () => void;
  lang: Language;
  user: UserData;
}

interface PastReport {
  id: string;
  pair: string;
  timestamp: number;
  text: string;
}

const AiAnalysisModal: React.FC<AiAnalysisModalProps> = ({ signal, candles, onClose, lang, user }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sources, setSources] = useState<{title: string, uri: string}[]>([]);
  const [pastReports, setPastReports] = useState<PastReport[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const t = translations[lang];

  useEffect(() => {
    const saved = localStorage.getItem('ssp_ai_reports');
    if (saved) setPastReports(JSON.parse(saved));
  }, []);

  const saveReport = (text: string) => {
    const newReport: PastReport = {
      id: Math.random().toString(36).substring(7),
      pair: signal.pair,
      timestamp: Date.now(),
      text
    };
    const saved = localStorage.getItem('ssp_ai_reports');
    let existing: PastReport[] = saved ? JSON.parse(saved) : [];
    const updated = [newReport, ...existing].slice(0, 50); // Store up to 50 globally
    setPastReports(updated);
    localStorage.setItem('ssp_ai_reports', JSON.stringify(updated));
  };

  const handleClearHistory = () => {
    if (window.confirm(lang === 'id' ? "Hapus semua riwayat intel?" : "Purge all intel history?")) {
      localStorage.removeItem('ssp_ai_reports');
      setPastReports([]);
      setShowHistory(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(analysis);
    alert(lang === 'id' ? "Intel disalin ke papan klip!" : "Intel copied to clipboard!");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: `SSP Neural Intel: ${signal.pair}`, text: analysis });
    } else {
      handleCopy();
    }
  };

  const runAnalysis = async () => {
    if (loading) return;
    setLoading(true);
    setErrorMsg(null);
    setSources([]);

    try {
      const apiKey = user.aiApiKey || (window as any).process?.env?.API_KEY || "";
      if (!apiKey) throw new Error("API Key Missing.");
      
      const ai = new GoogleGenAI({ apiKey });
      const targetLang = lang === 'id' ? 'Indonesian' : 'English';
      
      const prompt = `Perform a high-level INTEGRATED Technical and Fundamental analysis for the asset ${signal.pair} at Timeframe ${signal.timeframe}.
      
      TECHNICAL INPUTS:
      - Recommended Signal: ${signal.signal}
      - Confidence Index: ${signal.confidence}%
      - Indicators: RSI(14): ${signal.indicators.rsi.toFixed(2)}, EMA9: ${signal.indicators.ema9.toFixed(2)}, EMA200: ${signal.indicators.ema200.toFixed(2)}
      - Trend Context: ${signal.trend}
      
      ACTIONABLE MISSION:
      1. Use Google Search to find current (last 24h) fundamental news, economic events (CPI, FOMC, Geopolitical shifts), or market-moving catalysts specifically affecting ${signal.pair}.
      2. Provide a structured 'Quantum Intel Report' with clearly separated sections.
      
      REPORT STRUCTURE (Mandatory):
      [TECHNICAL PULSE]
      Detailed interpretation of the technical indicators provided above.
      
      [FUNDAMENTAL INTELLIGENCE]
      Analysis of the news and global events found via search and how they impact current volatility.
      
      [CONVERGENCE VERDICT]
      Summarize how technicals and fundamentals align. Final probability assessment.
      
      LANGUAGE: All content must be in ${targetLang}.
      STYLE: Elite, data-heavy terminal style. NO Markdown symbols (no stars, no hashes). Use professional capitalizations for headers.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { 
          systemInstruction: `You are the Smart Scalper Pro Neural Core. You excel at bridging high-frequency technical data with real-time fundamental macro news in ${targetLang}. Use googleSearch for every request. Output as plain text with clean header labels.`,
          tools: [{ googleSearch: {} }] 
        }
      });

      const text = response.text || "Report Failed.";
      setAnalysis(text);
      saveReport(text);
      
      if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
        setSources(response.candidates[0].groundingMetadata.groundingChunks
          .filter(c => c.web).map(c => ({ title: c.web!.title, uri: c.web!.uri })));
      }
    } catch (err: any) {
      setErrorMsg(lang === 'id' ? "Gagal menghubungkan. Periksa API Key di profil." : "Link Failure. Check API Key in profile.");
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = pastReports.filter(r => r.pair === signal.pair);

  const renderAnalysis = (text: string) => {
    // Basic formatting to bold headers if they follow the [SECTION] format
    const lines = text.split('\n');
    return lines.map((line, i) => {
      const isHeader = line.startsWith('[') && line.endsWith(']');
      return (
        <div key={i} className={`${isHeader ? 'text-indigo-400 font-black mt-4 mb-2 tracking-widest border-b border-indigo-900/30 pb-1' : 'text-slate-300 mb-1'} text-[11px] leading-relaxed`}>
          {line}
        </div>
      );
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl" onClick={onClose}/>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-2xl bg-[#020617] border-2 border-indigo-500/30 rounded-[40px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
          <div className="p-7 border-b border-slate-800 flex justify-between items-center bg-indigo-900/5">
            <h2 className="text-white font-black uppercase tracking-[0.2em] text-[10px] font-orbitron flex items-center gap-3">
              <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeWidth="2.5"/></svg>
              Neural Core Matrix (T+F)
            </h2>
            <div className="flex gap-2">
              <button onClick={() => setShowHistory(!showHistory)} className={`p-2 rounded-xl transition-all ${showHistory ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2.5"/></svg>
              </button>
              <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3"/></svg>
              </button>
            </div>
          </div>

          <div className="p-8 overflow-y-auto flex-1 custom-scrollbar font-mono text-slate-100">
            {showHistory ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-[10px] font-black uppercase text-indigo-400">{signal.pair} Neural Archive</h3>
                  {filteredHistory.length > 0 && (
                    <button onClick={handleClearHistory} className="text-[8px] font-black text-rose-500 hover:text-rose-400 uppercase tracking-widest transition-colors">Purge Global Archive</button>
                  )}
                </div>
                {filteredHistory.length > 0 ? filteredHistory.map(r => (
                  <div key={r.id} className="p-5 bg-slate-900/50 border border-slate-800 rounded-3xl group hover:border-indigo-500/30 transition-all">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-white font-black text-xs">{r.pair} INTEL</span>
                      <span className="text-[8px] text-slate-600 font-bold uppercase">{new Date(r.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed mb-4">{r.text}</p>
                    <button onClick={() => { setAnalysis(r.text); setShowHistory(false); }} className="text-[9px] text-indigo-500 font-black uppercase hover:text-indigo-400 flex items-center gap-2">
                      Restore Payload
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeWidth="3"/></svg>
                    </button>
                  </div>
                )) : (
                  <div className="py-20 text-center opacity-30 italic text-[10px] font-black uppercase tracking-widest">
                    No encrypted archives found for {signal.pair}.
                  </div>
                )}
              </div>
            ) : loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                 <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                 <div className="text-[9px] text-indigo-400 font-black uppercase tracking-widest animate-pulse">{t.analyzing}</div>
                 <p className="text-[8px] text-slate-500 uppercase tracking-widest">Searching Fundamental News via Google Matrix...</p>
              </div>
            ) : analysis ? (
              <div className="space-y-6">
                <div className="font-mono border-l-2 border-indigo-500 pl-4 py-2 bg-indigo-500/5 shadow-inner rounded-r-xl">
                  {renderAnalysis(analysis)}
                </div>
                
                {sources.length > 0 && (
                  <div className="pt-4 border-t border-slate-800">
                    <p className="text-[8px] text-slate-500 uppercase font-black mb-3 tracking-widest">Grounding Citations (Fundamental Sources):</p>
                    <div className="flex flex-wrap gap-2">
                      {sources.map((s, idx) => (
                        <a key={idx} href={s.uri} target="_blank" rel="noopener noreferrer" className="text-[8px] bg-slate-900 hover:bg-indigo-600 px-3 py-1.5 rounded-lg border border-slate-700 transition-all truncate max-w-[150px] text-indigo-400 hover:text-white">
                          {s.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-6">
                  <button onClick={handleCopy} className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border border-slate-700">{t.copyResult}</button>
                  <button onClick={handleShare} className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg">{t.shareResult}</button>
                </div>
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-slate-600 text-[10px] mb-8 uppercase font-black tracking-widest">Ready for Unified Neural T+F Processing</p>
                <button onClick={runAnalysis} className="px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all">Initiate Quantum Neural Scan</button>
              </div>
            )}
            {errorMsg && <div className="mt-6 p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-[9px] text-center font-black uppercase tracking-widest">{errorMsg}</div>}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AiAnalysisModal;
