import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSnippets, deleteAllUserData } from '../db/database';
import { AuthContext } from '../App';
import {
  Mail, Calendar, Code, Tag,
  LogOut, Trash2, Activity, ChevronRight
} from 'lucide-react';

const Profile = ({ user }) => {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Delete account state
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const fetchSnippets = useCallback(async () => {
    try {
      const data = await getSnippets(user.id);
      setSnippets(data);
    } catch (err) {
      console.error('Error fetching snippets:', err);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchSnippets();
  }, [fetchSnippets]);

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== user.email) return;
    try {
      await deleteAllUserData(user.id);
      localStorage.removeItem('gcp_token');
      setUser(null);
      navigate('/auth');
    } catch (err) {
      console.error('Error deleting account:', err);
      alert('Failed to delete account.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('gcp_token');
    setUser(null);
    navigate('/auth');
  };

  const totalTags = [...new Set(snippets.flatMap(s => s.tags || []))].length;
  const languages = [...new Set(snippets.map(s => s.language).filter(Boolean))];
  const joinDate = 'Recently'; // Could track this in DB if needed

  const initials = (user.name || user.email || 'U')
    .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'danger', label: 'Danger Zone', icon: Trash2 },
  ];

  return (
    <div className="max-w-4xl mx-auto pb-24 pt-8 space-y-10 px-4 sm:px-0">
      {/* Hero Section */}
      <div className="glass rounded-[2rem] overflow-hidden border border-white/5 relative shadow-premium">
        {/* Banner with Aura Gradient */}
        <div className="h-24 md:h-32 relative overflow-hidden bg-background">
          <div className="absolute top-[-50%] left-[-10%] w-[120%] h-[200%] bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent blur-3xl opacity-50" />
        </div>

        <div className="px-5 md:px-8 pb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-center sm:justify-start -mt-10 sm:-mt-12 mb-6 gap-6 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-surface border-4 border-[#020202] flex items-center justify-center text-3xl font-black text-white shadow-2xl relative z-10">
                {user.picture ? (
                  <img src={user.picture} alt="avatar" className="w-full h-full object-cover rounded-[1.25rem]" />
                ) : (
                  <span className="text-secondary">{initials}</span>
                )}
              </div>

              <div className="pb-2">
                <div className="flex items-center gap-3 group justify-center sm:justify-start">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                    {user.name || user.email?.split('@')[0] || 'Member'}
                  </h1>
                </div>
              </div>
            </div>

            <Link
              to="/"
              className="btn-primary flex items-center gap-2 text-sm px-6 py-3 sm:py-4 sm:ml-auto"
            >
              <Code className="w-4 h-4" />
              My Workspace
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 md:gap-6 text-xs md:text-sm font-medium text-slate-500">
            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5">
              <Mail className="w-4 h-4" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5">
              <Calendar className="w-4 h-4" />
              <span className="whitespace-nowrap">Active {joinDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Tabs */}
      <div className="flex gap-1 bg-white/[0.03] rounded-3xl p-1.5 border border-white/5 w-full md:w-fit mx-auto shadow-2xl overflow-x-auto no-scrollbar">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex flex-1 sm:flex-none items-center justify-center gap-2.5 px-4 sm:px-8 py-3 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === id
                ? 'bg-white text-black shadow-lg shadow-white/10'
                : 'text-slate-500 hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="inline-block">{label}</span>
          </button>
        ))}
      </div>

      {/* ─── Overview Tab ─── */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { label: 'Fragments', value: snippets.length, icon: Code, color: 'text-secondary bg-secondary/10 border-secondary/20' },
              { label: 'Syntaxes', value: languages.length, icon: Activity, color: 'text-white bg-white/5 border-white/10' },
              { label: 'Labels', value: totalTags, icon: Tag, color: 'text-accent bg-accent/10 border-accent/20' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="glass rounded-[2rem] p-6 border border-white/5 hover:border-white/12 transition-all group">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border transition-transform group-hover:scale-110 ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <p className="text-3xl font-black text-white leading-none">{loading ? '—' : value}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-3">{label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Languages breakdown */}
            <div className="glass rounded-[2.5rem] p-8 border border-white/5">
              <h2 className="text-sm font-black text-white mb-6 uppercase tracking-widest flex items-center gap-3">
                <div className="w-1 h-4 bg-secondary rounded-full" />
                Distribution
              </h2>
              <div className="space-y-4">
                {languages.length > 0 ? (
                  languages.map(lang => {
                    const count = snippets.filter(s => s.language === lang).length;
                    const pct = Math.round((count / snippets.length) * 100);
                    return (
                      <div key={lang} className="p-4 bg-white/[0.03] rounded-2xl border border-white/5 group hover:bg-white/[0.05] transition-all">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-black text-white">{lang}</span>
                          <span className="text-xs font-black text-slate-500">{pct}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-secondary rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-slate-500 text-sm font-medium py-10 text-center italic">No data markers found.</p>
                )}
              </div>
            </div>

            {/* Recent Snippets */}
            <div className="glass rounded-[2.5rem] p-8 border border-white/5">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                  <div className="w-1 h-4 bg-accent rounded-full" />
                  Recent Activity
                </h2>
                <Link to="/" className="text-[10px] font-black text-slate-500 hover:text-white transition-all uppercase tracking-widest flex items-center gap-1.5">
                  Expand <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-3">
                {loading ? (
                  <p className="text-slate-500 text-sm italic">Synchronizing...</p>
                ) : snippets.length === 0 ? (
                  <div className="text-center py-10 opacity-30">
                    <Code className="w-12 h-12 mx-auto mb-4" />
                    <p className="text-sm font-black uppercase tracking-widest">Library Offline</p>
                  </div>
                ) : (
                  snippets.slice(0, 4).map(snippet => (
                    <Link
                      key={snippet.id}
                      to={`/snippet/${snippet.id}`}
                      className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-secondary" />
                        <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors truncate max-w-[160px]">
                          {snippet.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 group-hover:text-slate-400">
                        {snippet.language}
                      </span>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Danger Zone Tab ─── */}
      {activeTab === 'danger' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="glass rounded-[2.5rem] p-8 md:p-12 border border-red-500/20 bg-red-500/[0.02]">
            <h2 className="text-sm font-black text-red-400 mb-4 uppercase tracking-[0.2em] flex items-center gap-3">
              <Trash2 className="w-6 h-6" />
              Deprovision Account
            </h2>
            <p className="text-slate-400 text-base mb-10 leading-relaxed font-medium">
              Executing this will permanently purge your identity and all <strong className="text-white">{snippets.length} technical fragments</strong> from the database. This action is <strong className="text-red-400 uppercase">irreversible</strong>.
            </p>

            <div className="space-y-6 max-w-md">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block ml-1">
                  Confirm identity by typing: <span className="text-white ml-2">{user.email}</span>
                </label>
                <input
                  type="email"
                  value={deleteConfirm}
                  onChange={e => setDeleteConfirm(e.target.value)}
                  placeholder={user.email}
                  className="w-full px-6 py-4 bg-red-400/5 border border-red-400/10 rounded-2xl focus:outline-none focus:border-red-400/30 transition-all font-bold text-white placeholder:text-red-900/30"
                />
              </div>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirm !== user.email}
                className="w-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed border border-red-500/20 font-black uppercase tracking-widest py-5 rounded-2xl transition-all shadow-lg active:scale-95"
              >
                Purge All Systems
              </button>
            </div>
          </div>

          <div className="glass rounded-[2.5rem] p-8 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h2 className="text-sm font-black text-white uppercase tracking-widest mb-1">Session Termination</h2>
              <p className="text-slate-500 text-sm font-medium">Safe disconnect from current session.</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-10 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-black text-xs uppercase tracking-widest transition-all text-white border border-white/10 flex items-center gap-3 active:scale-95"
            >
              <LogOut className="w-5 h-5 text-slate-500" />
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
