
import React, { useState, useEffect, useRef } from 'react';
import { firebaseService, ChatMessage, UserData, Channel, Presence } from '../services/firebase.ts';
import { translations, Language } from '../translations.ts';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'framer-motion';

interface GlobalDiscussionProps {
  user: UserData;
  lang: Language;
  onSetView: (view: any) => void;
}

const AudioPlayer: React.FC<{ src: string }> = ({ src }) => {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const toggle = () => {
    if (playing) audioRef.current?.pause();
    else audioRef.current?.play();
    setPlaying(!playing);
  };

  return (
    <div className="flex items-center gap-3 bg-indigo-500/10 border border-indigo-500/30 p-3 rounded-2xl w-full max-w-[200px]">
      <button onClick={toggle} className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white active:scale-90 transition-transform">
        {playing ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
        ) : (
          <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        )}
      </button>
      <div className="flex-1">
        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
          <div className={`h-full bg-indigo-500 ${playing ? 'animate-pulse' : ''}`} style={{ width: playing ? '100%' : '30%' }}></div>
        </div>
        <p className="text-[8px] text-indigo-400 font-bold mt-1 uppercase">Voice Stream</p>
      </div>
      <audio ref={audioRef} src={src} onEnded={() => setPlaying(false)} className="hidden" />
    </div>
  );
};

const ProfileCard: React.FC<{ targetUser: UserData, currentUser: UserData, onClose: () => void, lang: Language }> = ({ targetUser, currentUser, onClose, lang }) => {
  const [likes, setLikes] = useState(targetUser.likesCount || 0);
  const [followers, setFollowers] = useState(targetUser.followersCount || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasFollowed, setHasFollowed] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const checkState = async () => {
      const liked = await firebaseService.checkInteraction(currentUser.id, targetUser.id, 'likes');
      const followed = await firebaseService.checkInteraction(currentUser.id, targetUser.id, 'follows');
      setHasLiked(liked);
      setHasFollowed(followed);
    };
    checkState();

    if (targetUser.musicUrl && audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(e => console.log("Autoplay blocked. User interaction required."));
    }
  }, [targetUser, currentUser.id]);

  const handleLike = async () => {
    if (hasLiked) return;
    const newLikes = await firebaseService.likeUser(currentUser.id, targetUser.id);
    if (newLikes !== -1) { setLikes(newLikes); setHasLiked(true); }
  };

  const handleFollow = async () => {
    if (hasFollowed) return;
    const newFollows = await firebaseService.followUser(currentUser.id, targetUser.id);
    if (newFollows !== -1) { setFollowers(newFollows); setHasFollowed(true); }
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl" onClick={onClose}></div>
      <div className="relative w-full max-w-sm bg-[#020617] border-2 border-indigo-500/30 rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
        {targetUser.musicUrl && <audio ref={audioRef} src={targetUser.musicUrl} className="hidden" />}
        <div className="h-28 bg-gradient-to-b from-indigo-900/40 to-transparent relative opacity-50 scifi-grid"></div>
        <div className="px-8 pb-10 -mt-14 flex flex-col items-center text-center">
          <img src={targetUser.profilePic} className="w-28 h-28 rounded-[36px] border-4 border-[#020617] shadow-2xl z-10 object-cover" alt="avatar" />
          <h2 className="text-xl font-black text-white mt-4 uppercase tracking-tighter font-orbitron">@{targetUser.username}</h2>
          
          <div className="mt-4 px-4 py-3 bg-slate-900/40 border border-slate-800 rounded-2xl w-full">
            <p className="text-[10px] text-slate-400 font-medium italic">"{targetUser.bio || 'Active Scalper Node.'}"</p>
          </div>

          <div className="grid grid-cols-2 gap-4 my-6 w-full">
            <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-2xl">
              <div className="text-indigo-400 font-black text-lg font-mono">{followers}</div>
              <div className="text-[7px] text-slate-500 uppercase font-black">Links</div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-2xl">
              <div className="text-rose-400 font-black text-lg font-mono">{likes}</div>
              <div className="text-[7px] text-slate-500 uppercase font-black">Karma</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full">
             <button onClick={handleFollow} disabled={hasFollowed} className={`py-4 rounded-xl text-[9px] font-black uppercase tracking-widest ${hasFollowed ? 'bg-slate-800 text-slate-600' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}>{hasFollowed ? 'Linked' : 'Link'}</button>
             <button onClick={handleLike} disabled={hasLiked} className={`py-4 rounded-xl text-[9px] font-black uppercase tracking-widest ${hasLiked ? 'bg-slate-800 text-slate-600' : 'bg-rose-600 hover:bg-rose-500 text-white'}`}>{hasLiked ? 'Endorsed' : 'Endorse'}</button>
          </div>
          <button onClick={onClose} className="mt-6 text-[9px] font-black text-slate-600 hover:text-white uppercase tracking-widest">Close Station View</button>
        </div>
      </div>
    </div>
  );
};

const GlobalDiscussion: React.FC<GlobalDiscussionProps> = ({ user, lang, onSetView }) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [members, setMembers] = useState<Presence[]>([]);
  const [inputText, setInputText] = useState('');
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [viewingUser, setViewingUser] = useState<UserData | null>(null);
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState<Channel | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [newChannelData, setNewChannelData] = useState({ name: '', type: 'public' as 'public' | 'private', code: '' });
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const init = async () => {
      const chs = await firebaseService.getChannels();
      if (chs.length === 0) {
        const def = await firebaseService.createChannel({ name: 'MAIN-SERVER', type: 'public', ownerId: 'sys', createdAt: Date.now() });
        setChannels([def]);
        setActiveChannel(def);
      } else {
        setChannels(chs);
        setActiveChannel(chs[0]);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!activeChannel) return;
    const interval = setInterval(async () => {
      const [msgs, activeMembers] = await Promise.all([
        firebaseService.getChatMessages(activeChannel.id),
        firebaseService.getActiveMembers(activeChannel.id)
      ]);
      
      setMessages(prev => {
        if (JSON.stringify(prev) === JSON.stringify(msgs)) return prev;
        return msgs;
      });
      setMembers(activeMembers);
      firebaseService.updatePresence(activeChannel.id, user.id, user.username);
    }, 3000);
    return () => clearInterval(interval);
  }, [activeChannel, user]);

  useEffect(() => {
    if (isAtBottomRef.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      // Define a threshold (e.g., 100px) to determine if we are "at the bottom"
      isAtBottomRef.current = scrollHeight - scrollTop - clientHeight < 100;
    }
  };

  const cleanAiText = (text: string) => {
    return text.replace(/[*#_~`>]/g, '').trim();
  };

  const askAi = async (query: string) => {
    try {
      const apiKey = user.aiApiKey || (window as any).process?.env?.API_KEY || "";
      if (!apiKey) return;
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: query.replace('@ai', '').trim(),
        config: { systemInstruction: "You are Smart Scalper Pro Neural Core. Provide brief, elite trading intel. Use plain text only, no markdown symbols or stars." }
      });
      if (response.text && activeChannel) {
        await firebaseService.sendChatMessage({
          userId: 'ai-core', 
          username: 'NEURAL_CORE', 
          profilePic: 'https://api.dicebear.com/7.x/bottts/svg?seed=neural_core',
          text: cleanAiText(response.text),
          timestamp: Date.now(), 
          channelId: activeChannel.id, 
          isAi: true
        });
      }
    } catch (e) { console.error("Neural Error", e); }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isSending || !activeChannel) return;
    setIsSending(true);
    const text = inputText.trim();
    try {
      if (editingMsgId) {
        await firebaseService.editChatMessage(activeChannel.id, editingMsgId, text);
        setEditingMsgId(null);
      } else {
        await firebaseService.sendChatMessage({
          userId: user.id, 
          username: user.username, 
          profilePic: user.profilePic,
          text: text,
          timestamp: Date.now(), 
          channelId: activeChannel.id
        });
        if (text.toLowerCase().startsWith('@ai')) setTimeout(() => askAi(text), 600);
      }
      setInputText('');
      isAtBottomRef.current = true; // Force scroll to bottom on own message
    } catch(err) { console.error("TX Failure", err); }
    finally { setIsSending(false); }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeChannel) return;
    
    if (file.size > 1024 * 1024) {
      alert("Image is too large (Max 1MB).");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      await firebaseService.sendChatMessage({
        userId: user.id, 
        username: user.username, 
        profilePic: user.profilePic,
        text: '', 
        image: reader.result as string,
        timestamp: Date.now(), 
        channelId: activeChannel.id
      });
      isAtBottomRef.current = true;
    };
    reader.readAsDataURL(file);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          if(activeChannel) {
            await firebaseService.sendChatMessage({
              userId: user.id, 
              username: user.username, 
              profilePic: user.profilePic,
              text: '', 
              audio: reader.result as string,
              timestamp: Date.now(), 
              channelId: activeChannel.id
            });
            isAtBottomRef.current = true;
          }
        };
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (e) { alert("Mic permission denied."); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    }
  };

  const selectChannel = (ch: Channel) => {
    if (ch.id === activeChannel?.id) return;
    if (ch.type === 'private' && ch.ownerId !== user.id) {
      setShowPinModal(ch);
      setPinInput('');
    } else {
      setActiveChannel(ch);
      isAtBottomRef.current = true;
    }
  };

  return (
    <div className="flex h-[calc(100vh-200px)] gap-6 overflow-hidden">
      {viewingUser && <ProfileCard targetUser={viewingUser} currentUser={user} onClose={() => setViewingUser(null)} lang={lang} />}
      
      <div className="w-64 bg-slate-900/50 border border-slate-800 rounded-[32px] p-6 flex flex-col hidden lg:flex shadow-2xl backdrop-blur-xl">
        <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6 flex justify-between items-center font-orbitron">
          Active Nodes
          <button onClick={() => setShowChannelModal(true)} className="p-1.5 bg-indigo-600 rounded-lg text-white hover:bg-indigo-500 transition-all shadow-lg">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="3"/></svg>
          </button>
        </h3>
        <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
          {channels.map(ch => (
            <button 
              key={ch.id} onClick={() => selectChannel(ch)}
              className={`w-full text-left px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeChannel?.id === ch.id ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-800'}`}
            >
              <div className="flex justify-between items-center">
                <span className="truncate flex items-center gap-2">
                   {ch.type === 'private' ? '🔒' : '🌐'} {ch.name}
                </span>
                <span className="text-[7px] bg-black/30 px-2 py-0.5 rounded border border-white/5">
                  {ch.id === activeChannel?.id ? members.length : '?'}
                </span>
              </div>
            </button>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-slate-800">
           <p className="text-[8px] text-slate-600 uppercase font-black text-center tracking-widest">Quantum Core Stable</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-slate-950/80 border border-slate-800/60 rounded-[40px] overflow-hidden shadow-2xl relative">
        <div className="px-8 py-5 border-b border-slate-800 bg-indigo-600/5 flex justify-between items-center">
           <div>
             <h2 className="text-lg font-black text-white uppercase tracking-tighter font-orbitron">{activeChannel?.name || 'INITIALIZING...'}</h2>
             <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest font-mono">{members.length} Online Operators</p>
           </div>
           <button onClick={() => { navigator.clipboard.writeText(activeChannel?.id || ""); alert("ID Copied."); }} className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-500 text-[9px] font-black uppercase hover:text-white transition-colors">Copy Node ID</button>
        </div>

        <div 
          ref={scrollRef} 
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar scroll-smooth"
        >
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div key={m.id} layout initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-4 items-start ${m.userId === user.id ? 'flex-row-reverse' : 'flex-row'}`}>
                <button 
                  onClick={async () => { if(m.userId !== 'ai-core') { const u = await firebaseService.getUserById(m.userId); if(u) setViewingUser(u); }}}
                  className="shrink-0 focus:outline-none"
                >
                  <img 
                    src={m.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.username}`} 
                    className={`w-10 h-10 rounded-[14px] border border-slate-800 shadow-lg object-cover hover:scale-105 transition-transform ${m.userId === 'ai-core' ? 'border-cyan-500/50' : ''}`}
                    alt="avatar"
                  />
                </button>

                <div className={`flex flex-col group ${m.userId === user.id ? 'items-end' : 'items-start'} max-w-[80%]`}>
                  <div className={`flex items-center gap-2 mb-1 px-1 ${m.userId === user.id ? 'flex-row-reverse' : ''}`}>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${m.userId === 'ai-core' ? 'text-cyan-400 font-orbitron' : 'text-indigo-400 font-mono'}`}>
                      {m.userId === 'ai-core' ? '[NEURAL CORE]' : `@${m.username}`}
                    </span>
                    <span className="text-[7px] text-slate-600 font-mono uppercase">{new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  
                  <div className={`p-4 rounded-[24px] relative transition-all ${m.userId === user.id ? 'bg-indigo-600/10 border border-indigo-500/30 rounded-tr-none shadow-xl' : m.userId === 'ai-core' ? 'bg-cyan-950/20 border-2 border-cyan-500/40 rounded-tl-none shadow-cyan-950 shadow-2xl' : 'bg-slate-900 border border-slate-800 rounded-tl-none shadow-lg'}`}>
                    {m.audio ? <AudioPlayer src={m.audio} /> : m.image ? (
                      <img src={m.image} className="max-w-full rounded-xl border border-white/10 shadow-2xl cursor-pointer hover:scale-[1.01] transition-transform" alt="data-transmission" onClick={() => window.open(m.image)} />
                    ) : (
                      <p className={`text-sm font-medium whitespace-pre-wrap ${m.userId === 'ai-core' ? 'text-cyan-100 font-mono' : 'text-slate-200'}`}>
                        {m.text}
                        {m.isEdited && <span className="text-[7px] text-slate-600 ml-2 italic">(RECODED)</span>}
                      </p>
                    )}
                    
                    {m.userId === user.id && !m.audio && (
                      <div className="absolute -left-14 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => {setEditingMsgId(m.id); setInputText(m.text);}} title="Edit Message" className="p-1.5 bg-slate-800 rounded-lg text-indigo-400 border border-slate-700 hover:bg-indigo-600 hover:text-white transition-all">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536M9 11l3.5 3.5L21 6.5l-3.5-3.5L9 11zM4 20h4l.582-.582M4 20l-.582-.582M4 20v-4" strokeWidth="2.5"/></svg>
                        </button>
                        <button onClick={() => firebaseService.deleteChatMessage(activeChannel!.id, m.id)} title="Delete Message" className="p-1.5 bg-slate-800 rounded-lg text-rose-500 border border-slate-700 hover:bg-rose-600 hover:text-white transition-all">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6" strokeWidth="2.5"/></svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <form onSubmit={handleSend} className="p-6 bg-slate-900/50 border-t border-slate-800 flex items-center gap-4">
           <button type="button" onClick={() => imageInputRef.current?.click()} className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 border border-slate-700 hover:text-white flex items-center justify-center transition-all">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" strokeWidth="2.5"/></svg>
           </button>
           <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
           
           <div className="flex-1 relative">
             <input className="w-full bg-[#020617] border border-slate-800 rounded-2xl px-6 py-4 text-white text-[12px] outline-none transition-all placeholder:text-slate-600 font-mono focus:border-indigo-500" placeholder={editingMsgId ? "RECODING BUFFER..." : "Message Node... (@ai for Neural Core)"} value={inputText} onChange={(e) => setInputText(e.target.value)} />
             {editingMsgId && <button onClick={() => {setEditingMsgId(null); setInputText('');}} className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-500 text-[8px] font-black uppercase">Cancel</button>}
             {inputText.toLowerCase().startsWith('@ai') && (
               <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
                 <span className="text-[8px] text-cyan-500 font-black uppercase font-mono">NEURAL_LINK</span>
               </div>
             )}
           </div>

           <button type="button" onMouseDown={startRecording} onMouseUp={stopRecording} onTouchStart={startRecording} onTouchEnd={stopRecording} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-rose-600 animate-pulse scale-110' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'}`}>
             <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
           </button>
           
           <button type="submit" disabled={isSending} className="bg-indigo-600 hover:bg-indigo-500 w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-indigo-900/40">
             <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeWidth="3"/></svg>
           </button>
        </form>
      </div>

      {showPinModal && (
        <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl" onClick={() => setShowPinModal(null)}></div>
          <div className="relative w-full max-sm bg-[#020617] border-2 border-rose-500/30 rounded-[40px] p-10 shadow-2xl text-center">
            <h2 className="text-xl font-black text-white uppercase tracking-tighter font-orbitron mb-4">Node Locked</h2>
            <p className="text-[9px] text-slate-500 uppercase font-black mb-8">Enter Hash Code for {showPinModal.name}</p>
            <input 
              type="text" maxLength={6} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white text-center text-3xl font-black tracking-[0.5em] focus:border-rose-500 outline-none mb-6 font-mono"
              value={pinInput} onChange={(e) => setPinInput(e.target.value)}
            />
            <button 
              onClick={() => {
                if (pinInput === showPinModal.accessCode) { setActiveChannel(showPinModal); setShowPinModal(null); }
                else alert("ACCESS DENIED: Incorrect Security Hash.");
              }}
              className="w-full py-5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-rose-900/40 uppercase tracking-widest text-[10px]"
            >Verify Identity</button>
          </div>
        </div>
      )}

      {showChannelModal && (
        <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={() => setShowChannelModal(false)}></div>
          <div className="relative w-full max-w-md bg-[#020617] border-2 border-indigo-500/30 rounded-[40px] p-10 shadow-2xl">
            <h2 className="text-xl font-black text-white uppercase tracking-tighter font-orbitron mb-8 text-center">New Node Hub</h2>
            <div className="space-y-6">
              <input className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-white font-mono text-sm outline-none focus:border-indigo-500" placeholder="Node Alias" value={newChannelData.name} onChange={e => setNewChannelData({...newChannelData, name: e.target.value})} />
              <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setNewChannelData({...newChannelData, type: 'public'})} className={`py-3 rounded-xl text-[10px] font-black uppercase border ${newChannelData.type === 'public' ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>Public</button>
                  <button onClick={() => setNewChannelData({...newChannelData, type: 'private'})} className={`py-3 rounded-xl text-[10px] font-black uppercase border ${newChannelData.type === 'private' ? 'bg-rose-600 text-white border-rose-400' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>Private</button>
              </div>
              {newChannelData.type === 'private' && (
                <input className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-white font-mono text-center tracking-[0.5em]" placeholder="6-DIGIT PIN" maxLength={6} value={newChannelData.code} onChange={e => setNewChannelData({...newChannelData, code: e.target.value})} />
              )}
              <button onClick={async () => {
                if(!newChannelData.name) return;
                const ch = await firebaseService.createChannel({ 
                  name: newChannelData.name.toUpperCase(), 
                  type: newChannelData.type, 
                  ownerId: user.id, 
                  accessCode: newChannelData.type === 'private' ? newChannelData.code : undefined,
                  createdAt: Date.now() 
                });
                setChannels(prev => [...prev, ch]);
                setActiveChannel(ch);
                setShowChannelModal(false);
              }} className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-indigo-900/20 uppercase tracking-widest text-[10px]">Create Node</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalDiscussion;
