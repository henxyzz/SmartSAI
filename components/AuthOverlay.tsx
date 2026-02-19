
import React, { useState } from 'react';

interface AuthOverlayProps {
  onLogin: () => void;
}

const AuthOverlay: React.FC<AuthOverlayProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onLogin();
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl">
      <div className="w-full max-w-md p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/20 mx-auto mb-6">
             <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
             </svg>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Smart Scalper Pro</h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2">Enter your quantitative credentials</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Station Email</label>
            <input 
              type="email" 
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all font-medium"
              placeholder="trader@quant.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Access Key</label>
            <input 
              type="password" 
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all font-medium"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-xl transition-all shadow-xl shadow-indigo-500/20 uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'INITIALIZE STATION'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-800 flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
           <span className="text-slate-600">Secure Protocol v2.5</span>
           <button className="text-indigo-400 hover:text-indigo-300">Request Access</button>
        </div>
      </div>
    </div>
  );
};

export default AuthOverlay;
