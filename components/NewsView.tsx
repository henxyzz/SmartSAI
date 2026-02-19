
import React, { useState, useEffect } from 'react';
import { Language, translations } from '../translations';
import { GoogleGenAI, Type } from "@google/genai";

interface NewsViewProps {
  lang: Language;
  user?: any;
}

interface NewsItem {
  id: string;
  title: string;
  source: string;
  url: string;
  time: string;
  impact: 'high' | 'medium' | 'low';
  summary: string;
  category: string;
}

const NewsView: React.FC<NewsViewProps> = ({ lang, user }) => {
  const t = translations[lang];
  const [news, setNews] = useState<NewsItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRealTimeNews = async (category: string = 'All') => {
    setIsLoading(true);
    setError(null);
    try {
      const apiKey = user?.aiApiKey || (window as any).process?.env?.API_KEY || "";
      if (!apiKey) {
        throw new Error("Station Access Key (API Key) Missing. Please update in Profile.");
      }
      
      const ai = new GoogleGenAI({ apiKey });
      const targetLang = lang === 'id' ? 'Indonesian' : 'English';
      
      const prompt = `Find the 5 most critical market-moving news events happening RIGHT NOW for the category: ${category}. 
      Include economic data, geopolitical shifts, or asset-specific breakouts.
      Return the data in a clean structured format. 
      For each item include: 
      1. Headline
      2. Source Name
      3. Impact Level (high, medium, low)
      4. A brief 2-sentence summary translated into ${targetLang}.
      
      IMPORTANT: You must use the googleSearch tool for real-time data.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { 
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                source: { type: Type.STRING },
                impact: { type: Type.STRING },
                summary: { type: Type.STRING },
                category: { type: Type.STRING }
              }
            }
          }
        }
      });

      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const parsedData = JSON.parse(response.text || "[]");

      const enrichedNews: NewsItem[] = parsedData.map((item: any, index: number) => {
        const url = groundingChunks[index]?.web?.uri || "https://www.google.com/search?q=" + encodeURIComponent(item.title);
        return {
          id: Math.random().toString(36).substring(7),
          title: item.title,
          source: item.source || "Market Intel",
          url: url,
          time: "Just Now",
          impact: item.impact?.toLowerCase() || 'medium',
          summary: item.summary,
          category: item.category || category
        };
      });

      setNews(enrichedNews);
    } catch (e: any) {
      console.error("News Fetch Error:", e);
      setError(e.message || "Failed to establish link with Neural News Network.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRealTimeNews(filterCategory);
  }, [filterCategory]);

  const filteredNews = news.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-white/10">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" strokeWidth="2.5"/></svg>
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-widest font-orbitron">Global News Hub</h2>
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">{t.searchingLive}</p>
            </div>
          </div>
          <button 
            onClick={() => fetchRealTimeNews(filterCategory)}
            disabled={isLoading}
            className="flex items-center gap-3 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95"
          >
            {isLoading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> SYNCING...</>
            ) : (
              <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeWidth="2.5"/></svg> Refresh Neural Stream</>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
          <div className="md:col-span-8 relative">
            <input 
              type="text" 
              placeholder="Filter intelligence..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-12 py-4 text-xs text-white focus:border-indigo-500 outline-none transition-all font-mono"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="3"/></svg>
          </div>
          <div className="md:col-span-4">
            <select 
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-xs text-white outline-none focus:border-indigo-500 cursor-pointer font-black uppercase tracking-widest"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="All">All Sectors</option>
              <option value="Crypto">Crypto Assets</option>
              <option value="Forex">Major Currencies</option>
              <option value="Commodities">Gold & Energy</option>
              <option value="Stocks">Global Equity</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-6 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-500 text-[10px] font-black uppercase tracking-widest text-center">
            CRITICAL_ERROR: {error}
          </div>
        )}

        <div className="space-y-6">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
               <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
               <p className="text-[10px] text-indigo-400 font-black uppercase animate-pulse">Syncing with Reuters & Bloomberg APIs...</p>
            </div>
          ) : filteredNews.length > 0 ? filteredNews.map(item => (
            <div key={item.id} className="p-6 bg-slate-950/50 border border-slate-800 rounded-[28px] hover:border-indigo-500/30 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <span className="text-[8px] font-black text-slate-700 uppercase tracking-[0.3em]">{item.category}</span>
              </div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${item.impact === 'high' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'}`}>
                    {item.impact} Impact
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 font-mono">/ {item.source}</span>
                </div>
              </div>
              <h3 className="text-lg font-black text-white mb-2 group-hover:text-indigo-400 transition-colors uppercase tracking-tight leading-tight">{item.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium mb-4">{item.summary}</p>
              <a 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 text-[9px] font-black text-indigo-500 uppercase tracking-widest hover:text-indigo-400 transition-colors"
              >
                ACCESS SOURCE INTEL
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeWidth="2.5"/></svg>
              </a>
            </div>
          )) : (
            <div className="py-20 text-center opacity-30 italic text-[10px] font-black uppercase tracking-widest">
              No matching intelligence packets found. Try a broader search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsView;
