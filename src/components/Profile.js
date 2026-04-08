import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getSnippets, deleteAllUserData, exportDBFile, importDBFile } from '../db/database';
import { updateProfile, deleteUser, signOut, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import {
  Mail, Calendar, Code, Tag, Edit2, Save, X,
  LogOut, Trash2, Shield, Activity, ChevronRight,
  CheckCircle, AlertTriangle, Key, Download, Upload, Loader2
} from 'lucide-react';

const Profile = ({ user }) => {
  const navigate = useNavigate();
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Delete account state
  const [deleteConfirm, setDeleteConfirm] = useState('');

  // Backup/Restore state
  const [isRestoring, setIsRestoring] = useState(false);

  const fetchSnippets = useCallback(async () => {
    try {
      const data = await getSnippets(user.uid);
      setSnippets(data);
    } catch (err) {
      console.error('Error fetching snippets:', err);
    } finally {
      setLoading(false);
    }
  }, [user.uid]);

  useEffect(() => {
    fetchSnippets();
  }, [fetchSnippets]);

  const handleSaveName = async () => {
    setSaving(true);
    try {
      await updateProfile(auth.currentUser, { displayName });
      setSaveSuccess(true);
      setEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setPasswordSuccess(false), 4000);
    } catch (err) {
      setPasswordError(err.message.replace('Firebase:', '').trim());
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== user.email) return;
    try {
      await deleteAllUserData(user.uid);
      await deleteUser(auth.currentUser);
      navigate('/auth');
    } catch (err) {
      console.error('Error deleting account:', err);
      alert('Please log out and log back in before deleting your account.');
    }
  };

  const handleBackup = async () => {
    try {
      await exportDBFile();
    } catch (err) {
      console.error('Backup failed:', err);
    }
  };

  const handleRestore = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsRestoring(true);
    try {
      await importDBFile(file);
      window.location.reload();
    } catch (err) {
      console.error('Restore failed:', err);
      alert('Failed to restore database. Please ensure it is a valid .db file.');
    } finally {
      setIsRestoring(false);
    }
  };

  const totalTags = [...new Set(snippets.flatMap(s => s.tags || []))].length;
  const languages = [...new Set(snippets.map(s => s.language).filter(Boolean))];
  const joinDate = user.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : 'Unknown';

  const initials = (user.displayName || user.email || 'U')
    .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
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
                {user.photoURL ? (
                  <img src={user.photoURL} alt="avatar" className="w-full h-full object-cover rounded-[1.25rem]" />
                ) : (
                  <span className="text-secondary">{initials}</span>
                )}
              </div>

              <div className="pb-2">
                {editing ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      placeholder="Display name"
                      className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-white font-bold focus:outline-none focus:border-white/20 text-lg md:text-xl w-40 md:w-auto"
                      autoFocus
                    />
                    <button onClick={handleSaveName} disabled={saving} className="p-2.5 bg-white text-black rounded-xl hover:bg-slate-200 transition-colors">
                      <Save className="w-5 h-5" />
                    </button>
                    <button onClick={() => setEditing(false)} className="p-2.5 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                      <X className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 group justify-center sm:justify-start">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                      {user.displayName || user.email?.split('@')[0] || 'Member'}
                    </h1>
                    <button onClick={() => setEditing(true)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-white transition-all bg-white/5 rounded-lg">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {saveSuccess && (
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center justify-center sm:justify-start gap-1.5 mt-2">
                    <CheckCircle className="w-3 h-3" /> Identity Sync Complete
                  </p>
                )}
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
              <span className="whitespace-nowrap">Active since {joinDate}</span>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Fragments', value: snippets.length, icon: Code, color: 'text-secondary bg-secondary/10 border-secondary/20' },
              { label: 'Syntaxes', value: languages.length, icon: Activity, color: 'text-white bg-white/5 border-white/10' },
              { label: 'Labels', value: totalTags, icon: Tag, color: 'text-accent bg-accent/10 border-accent/20' },
              { label: 'Streak', value: user.metadata?.creationTime ? Math.ceil((Date.now() - new Date(user.metadata.creationTime)) / 86400000) : '—', icon: Zap, color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
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

      {/* ─── Security Tab ─── */}
      {activeTab === 'security' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="glass rounded-[2.5rem] p-8 md:p-10 border border-white/5 relative overflow-hidden">
             {/* Subtle Glow */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full" />

            <h2 className="text-sm font-black text-white mb-2 uppercase tracking-widest flex items-center gap-3">
              <Key className="w-5 h-5 text-secondary" />
              Credentials Management
            </h2>
            <p className="text-slate-500 text-sm mb-8 font-medium">Reset your secure access fragment. Required validation before update.</p>

            {passwordSuccess && (
              <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl px-5 py-4 mb-8 text-sm font-black uppercase tracking-widest">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                Access Fragment Re-established
              </div>
            )}
            {passwordError && (
              <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl px-5 py-4 mb-8 text-sm font-bold">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                {passwordError}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-6 max-w-md">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-1">Current Validation Token</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-white/20 transition-all font-mono placeholder:text-slate-800"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-1">New Secure Marker</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  minLength={6}
                  required
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-white/20 transition-all font-mono placeholder:text-slate-800"
                />
              </div>
              <button
                type="submit"
                className="btn-secondary w-full py-4 text-sm uppercase tracking-[0.2em] font-black"
              >
                Sync Credentials
              </button>
            </form>
          </div>

          {/* Data Portability */}
          <div className="glass rounded-[2.5rem] p-8 md:p-10 border border-white/5">
            <h2 className="text-sm font-black text-white mb-2 uppercase tracking-widest flex items-center gap-3">
              <Activity className="w-5 h-5 text-accent" />
              Data Portability
            </h2>
            <p className="text-slate-500 text-sm mb-10 font-medium leading-relaxed">Infrastructure is local-first. We recommend exporting periodic archives of your database.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={handleBackup}
                className="flex items-center justify-center gap-3 px-6 py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-3xl font-black text-xs uppercase tracking-widest transition-all text-white group"
              >
                <Download className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
                Download Archive (.db)
              </button>

              <label className="flex items-center justify-center gap-3 px-6 py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-3xl font-black text-xs uppercase tracking-widest transition-all text-white group cursor-pointer">
                {isRestoring ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />}
                <span>Import Repository</span>
                <input
                  type="file"
                  accept=".db"
                  onChange={handleRestore}
                  className="hidden"
                  disabled={isRestoring}
                />
              </label>
            </div>
          </div>

          {/* Advanced Info */}
          <div className="glass rounded-[2.5rem] p-8 md:p-10 border border-white/5">
             <div className="space-y-4">
              {[
                { label: 'Cloud Access Protocol', value: user.email, icon: Mail },
                { label: 'Protocol ID', value: user.uid.substring(0, 16) + '...', icon: Shield },
                { label: 'Handshake Sync', value: user.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleString() : 'Recent', icon: Calendar },
                { label: 'Identity Verification', value: user.emailVerified ? 'Verified' : 'Pending', icon: CheckCircle },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0 group">
                  <div className="flex items-center gap-3 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </div>
                  <span className={`text-sm font-bold tracking-tight ${label === 'Identity Verification' && !user.emailVerified ? 'text-red-400' : 'text-white'}`}>
                    {value}
                  </span>
                </div>
              ))}
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
              onClick={async () => { await signOut(auth); navigate('/auth'); }}
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

const Zap = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>
);

export default Profile;
