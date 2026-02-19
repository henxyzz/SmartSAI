
import React, { useState, useEffect } from 'react';
import { firebaseService, UserData, ADMIN_EMAIL } from '../services/firebase';
import { Language } from '../translations';

interface AdminPanelProps {
  currentAdmin: UserData;
  lang: Language;
  onSetView: (view: any) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ currentAdmin, lang, onSetView }) => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    const data = await firebaseService.getAllUsers();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleBan = async (userId: string, currentStatus: boolean) => {
    const targetUser = users.find(u => u.id === userId);
    if (targetUser?.email === ADMIN_EMAIL) {
      alert("Critical Error: Root Admin cannot be banned.");
      return;
    }

    if (!window.confirm(`Are you sure you want to ${currentStatus ? 'Unban' : 'Ban'} this user?`)) return;
    
    await firebaseService.toggleUserBan(userId, !currentStatus);
    loadUsers(); // Refresh list
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Admin Command Center</h2>
          <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.3em]">User Database & Access Control</p>
        </div>
        <button 
          onClick={loadUsers}
          className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 transition-all flex items-center gap-2"
        >
          <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          <span className="text-[10px] font-black uppercase tracking-widest">Reload Data</span>
        </button>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-[32px] overflow-hidden backdrop-blur-3xl shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex items-center gap-4 bg-slate-900/50">
          <div className="flex-1 relative">
            <input 
              type="text" 
              placeholder="Search by Email or Codename..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-12 py-3 text-xs text-white focus:border-indigo-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <div className="px-4 py-2 bg-slate-800 rounded-xl border border-slate-700 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Total Nodes: {users.length}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-800/30 text-slate-500 font-bold uppercase text-[9px] tracking-widest border-b border-slate-800">
                <th className="px-6 py-4">Codename / Identity</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Registered</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-indigo-600/5 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-black text-xs text-indigo-400">
                        {(u.username || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-[11px] font-black text-white">@{u.username}</div>
                        <div className="text-[9px] text-slate-600 font-mono">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {u.isBanned ? (
                      <span className="px-3 py-1 bg-rose-500/10 border border-rose-500/30 text-rose-500 text-[8px] font-black uppercase rounded-lg">Banned</span>
                    ) : (
                      <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-[8px] font-black uppercase rounded-lg">Active</span>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-[10px] text-slate-500 font-mono">{new Date(u.createdAt).toLocaleDateString()}</span>
                  </td>
                  <td className="px-6 py-5">
                    {u.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? (
                      <span className="text-indigo-400 font-black text-[9px] uppercase tracking-widest">ROOT ADMIN</span>
                    ) : (
                      <span className="text-slate-600 font-bold text-[9px] uppercase tracking-widest">OPERATOR</span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-center">
                    {u.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase() && (
                      <button 
                        onClick={() => handleToggleBan(u.id, !!u.isBanned)}
                        className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${u.isBanned ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'} text-white shadow-lg`}
                      >
                        {u.isBanned ? 'UNBAN' : 'BAN USER'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center opacity-30 italic text-[10px] uppercase font-black tracking-widest">
                    No matching node found in database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
