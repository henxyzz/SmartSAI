
import React, { useState, useRef } from 'react';
import { UserData, firebaseService } from '../services/firebase.ts';
import { translations, Language } from '../translations.ts';

interface ProfileSettingsProps {
  user: UserData;
  onUpdate: (user: UserData) => void;
  lang: Language;
  onSetView: (view: any) => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user, onUpdate, lang, onSetView }) => {
  const [newUsername, setNewUsername] = useState(user.username);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [profilePic, setProfilePic] = useState(user.profilePic || '');
  const [musicUrl, setMusicUrl] = useState(user.musicUrl || '');
  const [bio, setBio] = useState(user.bio || '');
  const [aiApiKey, setAiApiKey] = useState(user.aiApiKey || '');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations[lang];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 1024 * 1024) {
      alert(lang === 'id' ? "Ukuran file terlalu besar. Maksimal 1MB." : "File too large. Max 1MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setProfilePic(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let success = true;
      const usernameSuccess = await firebaseService.updateUsername(user.id, newUsername);
      const mediaSuccess = await firebaseService.updateProfileMedia(user.id, profilePic, musicUrl, bio, aiApiKey);
      
      if (newPassword) {
        const passSuccess = await firebaseService.updatePassword(user.id, newPassword);
        success = success && passSuccess;
      }

      success = success && usernameSuccess && mediaSuccess;

      if (success) {
        onUpdate({ 
          ...user, 
          username: newUsername, 
          password: newPassword || user.password, 
          profilePic, 
          musicUrl,
          bio,
          aiApiKey
        });
        alert(lang === 'id' ? 'Profil Identitas Diperbarui!' : 'Operator Identity Updated!');
      } else {
        throw new Error("Update partial failure");
      }
    } catch (err) {
      alert(lang === 'id' ? 'Gagal sinkronisasi data.' : 'Data synchronization failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleShareMyProfile = () => {
    const shareText = `Check out my trading profile @${user.username} on Smart Scalper Pro!`;
    const shareUrl = window.location.href;
    if (navigator.share) {
      navigator.share({ title: 'My Smart Scalper Pro Identity', text: shareText, url: shareUrl });
    } else {
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      alert(lang === 'id' ? 'Tautan profil disalin!' : 'Profile link copied to clipboard!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={() => onSetView('dashboard')}
          className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Terminal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-8 bg-slate-900/80 border border-slate-800 rounded-[40px] p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <svg className="w-32 h-32 text-indigo-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          </div>
          
          <h2 className="text-xl font-black text-white uppercase tracking-widest mb-10 flex items-center gap-4 font-orbitron">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/20 border border-white/10">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            {t.profileSettings}
          </h2>

          <div className="space-y-8">
            <div className="flex flex-col items-center gap-6 p-6 bg-slate-950/40 rounded-[32px] border border-slate-800">
               <div className="relative group">
                  <div className="absolute inset-0 bg-indigo-500 rounded-[40px] blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <img 
                    src={profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
                    className="w-36 h-36 rounded-[40px] object-cover border-4 border-indigo-600 shadow-2xl relative z-10"
                    alt="profile"
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/60 rounded-[40px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white z-20 cursor-pointer"
                  >
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" strokeWidth="2"/><path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth="2"/></svg>
                    <span className="text-[8px] font-black uppercase tracking-widest">Update BioData</span>
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
               </div>
               
               <div className="w-full space-y-4">
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Musik Tema (URL Langsung .mp3)</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-3 text-white focus:border-indigo-500 outline-none transition-all font-mono text-[10px]"
                      placeholder="https://example.com/audio.mp3"
                      value={musicUrl}
                      onChange={(e) => setMusicUrl(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2 ml-1">AI NEURAL KEY (Gemini API Key)</label>
                    <input 
                      type="password" 
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 text-white focus:border-indigo-500 outline-none transition-all font-mono text-[10px]"
                      placeholder="Enter your Gemini API Key for private scans"
                      value={aiApiKey}
                      onChange={(e) => setAiApiKey(e.target.value)}
                    />
                    <p className="text-[8px] text-slate-600 mt-1 ml-1 uppercase font-bold tracking-tighter">* Digunakan untuk pemindaian neural personal tanpa batasan sistem.</p>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Operator Bio</label>
                <textarea 
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:border-indigo-500 outline-none transition-all font-medium text-xs resize-none"
                  rows={3}
                  placeholder="Share your trading philosophy..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">{t.codename}</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:border-indigo-500 outline-none transition-all font-mono text-sm uppercase"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">{t.password}</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:border-indigo-500 outline-none transition-all font-mono text-sm"
                    placeholder="Biarkan kosong jika tidak diubah"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-indigo-400 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88L4.512 4.512M12 5c4.478 0 8.268 2.943 9.542 7a10.05 10.05 0 01-1.243 3.119m-3.883-3.883l5.122 5.122"/></svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <button 
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-2xl transition-all shadow-2xl shadow-indigo-500/30 uppercase tracking-[0.2em] text-[11px] active:scale-[0.98]"
            >
              {saving ? 'SYNCHRONIZING DATA...' : t.saveProfile}
            </button>
          </div>
        </div>

        <div className="md:col-span-4 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 border-b border-slate-800 pb-4">Social Metrics</h4>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 text-center group-hover:border-indigo-500/30 transition-all">
                <div className="text-xl font-black text-indigo-400 font-mono">{user.followersCount || 0}</div>
                <div className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Nodes</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 text-center group-hover:border-rose-500/30 transition-all">
                <div className="text-xl font-black text-rose-400 font-mono">{user.likesCount || 0}</div>
                <div className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Trust</div>
              </div>
            </div>
            
            <button onClick={handleShareMyProfile} className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest border border-slate-700 transition-all mb-4 active:scale-95 shadow-lg">
               Broadcast Profile
            </button>

            <div className="p-5 flex items-center justify-between bg-slate-950/30 border border-slate-800 rounded-2xl">
                 <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Trust Index</span>
                 <span className="text-xs font-black text-emerald-400 uppercase tracking-tighter">MAX_GRADE</span>
            </div>
          </div>
          
          <div className="p-8 bg-indigo-600/5 border border-indigo-500/10 rounded-[40px]">
             <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Security Protocol</h5>
             <p className="text-[9px] text-slate-400 leading-relaxed font-medium">Informasi Anda dilindungi oleh Quantum Secure Protocol. Pastikan akses key Anda bersifat rahasia dan diperbarui secara berkala melalui modul ini.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
