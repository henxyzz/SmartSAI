
import React, { useState, useEffect, useCallback } from 'react';
import { firebaseService, UserData } from '../services/firebase.ts';
import { emailService } from '../services/emailService.ts';

interface AuthSystemProps {
  onSuccess: (user: UserData) => void;
}

const AuthSystem: React.FC<AuthSystemProps> = ({ onSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>(['[SYS] TERMINAL READY...']);

  // Captcha State
  const [captcha, setCaptcha] = useState<{ q: string, a: number }>({ q: '', a: 0 });
  const [captchaInput, setCaptchaInput] = useState('');

  const addLog = useCallback((msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`].slice(-5));
  }, []);

  const generateCaptcha = useCallback(() => {
    const n1 = Math.floor(Math.random() * 20) + 1;
    const n2 = Math.floor(Math.random() * 20) + 1;
    setCaptcha({ q: `${n1} + ${n2}`, a: n1 + n2 });
    setCaptchaInput('');
  }, []);

  useEffect(() => {
    generateCaptcha();
    const handleMailEvent = (e: any) => {
      const { otp, to } = e.detail;
      addLog(`MAIL_INTERCEPT: TO ${to}`);
      addLog(`VERIFICATION_KEY: ${otp}`);
      setGeneratedOtp(otp);
    };
    window.addEventListener('quantum-mail-sent', handleMailEvent);
    return () => window.removeEventListener('quantum-mail-sent', handleMailEvent);
  }, [generateCaptcha, addLog]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Verify Humanity
    if (parseInt(captchaInput) !== captcha.a) {
      setError("HUMANITY_VERIFICATION_FAILED");
      addLog('SECURITY: INCORRECT_CHALLENGE_ANSWER');
      generateCaptcha();
      return;
    }

    setLoading(true);
    addLog('INITIATING SATELLITE LINK...');

    try {
      if (isRegister) {
        const code = emailService.generateOTP();
        const sent = await emailService.sendVerificationEmail(email, code);
        if (sent) { 
          setIsVerifying(true); 
          addLog('TRANS_SUCCESS: CHECK TERMINAL'); 
        } else { 
          setError("Failed to dispatch link."); 
          generateCaptcha();
        }
      } else {
        const { user, error: loginErr } = await firebaseService.loginUser(email, password);
        if (user) { 
          addLog('AUTH_GRANTED...'); 
          setTimeout(() => onSuccess(user!), 1000); 
        } else { 
          setError(loginErr || "Invalid identity."); 
          addLog('AUTH_DENIED.');
          generateCaptcha();
        }
      }
    } catch (err) { 
      setError("Quantum failure."); 
      generateCaptcha();
    } finally { 
      setLoading(false); 
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setError(null);
    generateCaptcha();
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[#020617] overflow-hidden">
      <div className="absolute inset-0 scifi-grid opacity-30"></div>
      <div className="w-full max-w-md p-4 relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="bg-slate-900/60 backdrop-blur-3xl border border-indigo-500/20 rounded-[40px] p-8 shadow-2xl relative overflow-hidden">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/40 mx-auto mb-4 border border-white/10">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tighter uppercase font-orbitron">Smart Scalper <span className="text-indigo-500">Pro</span></h1>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.4em] mt-2">v3.8 Quantum Terminal</p>
          </div>

          {!isVerifying ? (
            <form onSubmit={handleAuth} className="space-y-4">
              {isRegister && (
                <input 
                  type="text" 
                  placeholder="CODENAME" 
                  required 
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-3.5 text-white focus:border-indigo-500 outline-none font-mono text-xs uppercase transition-all" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                />
              )}
              <input 
                type="email" 
                placeholder="IDENTITY EMAIL" 
                required 
                className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-3.5 text-white focus:border-indigo-500 outline-none font-mono text-xs transition-all" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="ACCESS KEY" 
                  required 
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-3.5 text-white focus:border-indigo-500 outline-none font-mono text-xs transition-all" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-indigo-400">
                  {showPassword ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeWidth="2"/></svg> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88L4.512 4.512M12 5c4.478 0 8.268 2.943 9.542 7a10.05 10.05 0 01-1.243 3.119m-3.883-3.883l5.122 5.122" strokeWidth="2"/></svg>}
                </button>
              </div>

              {/* Humanity Verification (Captcha) */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Humanity Challenge</span>
                  <button type="button" onClick={generateCaptcha} className="text-[7px] text-slate-600 hover:text-indigo-400 font-bold uppercase">Regenerate</button>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl py-3 text-center text-sm font-black text-white font-mono tracking-widest">
                    {captcha.q} = ?
                  </div>
                  <input 
                    type="number" 
                    placeholder="SOLVE"
                    required
                    className="w-24 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-center text-sm font-black focus:border-indigo-500 outline-none transition-all"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-indigo-500/20 uppercase tracking-widest text-[10px] active:scale-95 disabled:opacity-50">
                {loading ? 'SYNCING...' : isRegister ? 'REQUEST ACCESS' : 'INITIALIZE LINK'}
              </button>
            </form>
          ) : (
            <div className="space-y-4 animate-in slide-in-from-right-4">
              <div className="text-center mb-2">
                <span className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.4em]">Multi-Factor Auth Required</span>
              </div>
              <input type="text" maxLength={6} placeholder="000000" className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-4 text-white text-center text-3xl font-black tracking-[0.5em] focus:border-indigo-500 outline-none font-mono" value={otp} onChange={(e) => setOtp(e.target.value)} />
              <button onClick={async () => {
                if(otp === generatedOtp) {
                  const u = await firebaseService.registerUser(email, username, password);
                  if(u) onSuccess(u);
                } else {
                  alert("Invalid Key.");
                }
              }} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-900/20 active:scale-95">Confirm Link</button>
              <button onClick={() => setIsVerifying(false)} className="w-full text-center text-[8px] font-black text-slate-600 hover:text-slate-400 uppercase tracking-widest">Abort Transmission</button>
            </div>
          )}

          <div className="mt-6 flex flex-col items-center gap-4">
            <button onClick={toggleMode} className="text-[9px] font-bold text-slate-500 hover:text-indigo-400 uppercase tracking-widest transition-colors">
              {isRegister ? 'SYNC EXISTING IDENTITY' : 'NEW OPERATOR? REQUEST ACCESS'}
            </button>
            <div className="w-full bg-slate-950 rounded-xl p-3 border border-slate-800 font-mono text-[8px] text-indigo-400/80 h-20 overflow-y-auto custom-scrollbar">
              <div className="text-emerald-500 font-bold border-b border-slate-800 pb-1 mb-1 uppercase flex justify-between">
                <span>Terminal Output</span>
                <span className="animate-pulse">●</span>
              </div>
              {logs.map((log, i) => <div key={i}>{log}</div>)}
              {error && <div className="text-rose-500 font-bold">CRITICAL: {error}</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthSystem;
