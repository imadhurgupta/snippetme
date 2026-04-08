import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getSnippets, deleteAllUserData, exportDBFile, importDBFile } from '../db/database';
import { updateProfile, deleteUser, signOut, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Calendar, Code, Tag, Edit2, Save, X,
  LogOut, Trash2, Shield, Activity, ChevronRight,
  CheckCircle, AlertTriangle, Lock, Key, Download, Upload, Loader2
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
      // Delete all user snippets & projects in SQLite
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
      window.location.reload(); // Reload to refresh all data
    } catch (err) {
      console.error('Restore failed:', err);
      alert('Failed to restore database. Please ensure it is a valid .db file.');
    } finally {
      setIsRestoring(false);
    }
  };

  // Compute stats
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
    <div className="max-w-4xl mx-auto pb-24 space-y-8">
      {/* Hero Section */}
      <div className="glass rounded-[2.5rem] overflow-hidden border border-white/10">
        {/* Banner */}
        <div className="h-32 md:h-40 bg-gradient-to-br from-primary/30 via-secondary/20 to-transparent relative">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(99,102,241,0.3) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(139,92,246,0.3) 0%, transparent 60%)'
          }} />
        </div>

        <div className="px-8 pb-8">
          {/* Avatar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between -mt-12 mb-6 gap-4">
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-3xl font-black text-white shadow-glow-primary border-4 border-background">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="avatar" className="w-full h-full object-cover rounded-2xl" />
                ) : initials}
              </div>

              <div className="pb-1">
                {editing ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      placeholder="Display name"
                      className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-white font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 text-lg"
                      autoFocus
                    />
                    <button onClick={handleSaveName} disabled={saving} className="p-2 bg-primary rounded-lg hover:bg-primary-hover transition-colors">
                      <Save className="w-4 h-4 text-white" />
                    </button>
                    <button onClick={() => setEditing(false)} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                      <X className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group">
                    <h1 className="text-2xl font-black text-white">
                      {user.displayName || user.email?.split('@')[0] || 'Developer'}
                    </h1>
                    <button onClick={() => setEditing(true)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-primary transition-all">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {saveSuccess && (
                  <p className="text-xs text-green-400 flex items-center gap-1 mt-1">
                    <CheckCircle className="w-3 h-3" /> Display name saved!
                  </p>
                )}
              </div>
            </div>

            <Link
              to="/"
              className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover rounded-xl font-bold text-sm transition-all shadow-glow-primary hover:scale-[1.02]"
            >
              <Code className="w-4 h-4" />
              My Library
            </Link>
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-1.5">
              <Mail className="w-4 h-4" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>Member since {joinDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white/5 rounded-2xl p-1.5 border border-white/10">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === id
                ? id === 'danger'
                  ? 'bg-accent/20 text-accent border border-accent/20'
                  : 'bg-primary/20 text-primary border border-primary/20'
                : 'text-slate-500 hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* ─── Overview Tab ─── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Snippets', value: snippets.length, icon: Code, color: 'text-primary bg-primary/10 border-primary/20' },
              { label: 'Languages', value: languages.length, icon: Activity, color: 'text-secondary bg-secondary/10 border-secondary/20' },
              { label: 'Unique Tags', value: totalTags, icon: Tag, color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20' },
              { label: 'Days Active', value: user.metadata?.creationTime ? Math.ceil((Date.now() - new Date(user.metadata.creationTime)) / 86400000) : '—', icon: Calendar, color: 'text-green-400 bg-green-400/10 border-green-400/20' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="glass rounded-2xl p-5 border border-white/10 hover:border-white/20 transition-all">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 border ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-3xl font-black text-white">{loading ? '—' : value}</p>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Languages breakdown */}
          {languages.length > 0 && (
            <div className="glass rounded-2xl p-6 border border-white/10">
              <h2 className="font-black text-white mb-4 flex items-center gap-2">
                <Code className="w-5 h-5 text-primary" />
                Language Breakdown
              </h2>
              <div className="flex flex-wrap gap-2">
                {languages.map(lang => {
                  const count = snippets.filter(s => s.language === lang).length;
                  const pct = Math.round((count / snippets.length) * 100);
                  return (
                    <div key={lang} className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all group">
                      <span className="text-sm font-bold text-white">{lang}</span>
                      <span className="text-xs text-slate-500 bg-white/5 rounded-lg px-2 py-0.5 font-bold">{count} · {pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent Snippets */}
          <div className="glass rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Recent Activity
              </h2>
              <Link to="/" className="text-xs text-primary hover:underline font-bold flex items-center gap-1">
                See all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-2">
              {loading ? (
                <p className="text-slate-500 text-sm">Loading snippets...</p>
              ) : snippets.length === 0 ? (
                <div className="text-center py-8">
                  <Code className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">No snippets yet.</p>
                  <Link to="/create" className="text-primary text-sm hover:underline mt-1 inline-block">Create your first snippet →</Link>
                </div>
              ) : (
                snippets.slice(0, 5).map(snippet => (
                  <Link
                    key={snippet.id}
                    to={`/snippet/${snippet.id}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-white/10 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                        {snippet.language}
                      </span>
                      <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors truncate max-w-[200px]">
                        {snippet.title}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0" />
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Security Tab ─── */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="glass rounded-2xl p-6 border border-white/10">
            <h2 className="font-black text-white mb-1 flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              Change Password
            </h2>
            <p className="text-slate-500 text-sm mb-6">Update your security credentials. You'll need your current password to confirm.</p>

            {passwordSuccess && (
              <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl px-4 py-3 mb-4 text-sm font-medium">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                Password updated successfully!
              </div>
            )}
            {passwordError && (
              <div className="flex items-center gap-2 bg-accent/10 border border-accent/20 text-accent rounded-xl px-4 py-3 mb-4 text-sm">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {passwordError}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                  <Lock className="w-3 h-3" /> Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/[0.08] transition-all font-mono placeholder:text-slate-700"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                  <Shield className="w-3 h-3" /> New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  minLength={6}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/[0.08] transition-all font-mono placeholder:text-slate-700"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-xl transition-all shadow-glow-primary hover:scale-[1.01] active:scale-[0.99]"
              >
                Update Password
              </button>
            </form>
          </div>

          {/* Data Management Section */}
          <div className="glass rounded-2xl p-6 border border-white/10">
            <h2 className="font-black text-white mb-1 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Data Management
            </h2>
            <p className="text-slate-500 text-sm mb-6">Since your snippets are stored locally, we recommend exporting a backup regularly.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleBackup}
                className="flex items-center justify-center gap-3 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold transition-all text-slate-300"
              >
                <Download className="w-5 h-5" />
                Backup Library (.db)
              </button>

              <label className="flex items-center justify-center gap-3 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold transition-all text-slate-300 cursor-pointer">
                {isRestoring ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                <span>Restore Library</span>
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

          {/* Account Info */}
          <div className="glass rounded-2xl p-6 border border-white/10">
            <h2 className="font-black text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Account Details
            </h2>
            <div className="space-y-3">
              {[
                { label: 'Email', value: user.email, icon: Mail },
                { label: 'UID', value: user.uid.substring(0, 16) + '...', icon: Shield },
                { label: 'Last Sign In', value: user.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleString() : 'Unknown', icon: Calendar },
                { label: 'Email Verified', value: user.emailVerified ? '✓ Verified' : '✗ Not Verified', icon: CheckCircle },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </div>
                  <span className={`text-sm font-medium ${label === 'Email Verified' && !user.emailVerified ? 'text-accent' : 'text-slate-300'}`}>
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
        <div className="space-y-6">
          <div className="glass rounded-2xl p-6 border border-accent/20 bg-accent/[0.03]">
            <h2 className="font-black text-accent mb-1 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Delete Account
            </h2>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              This will permanently delete your account and all <strong className="text-white">{snippets.length} snippets</strong>. This action <strong className="text-accent">cannot be undone</strong>.
            </p>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">
                  Type your email to confirm: <span className="text-accent">{user.email}</span>
                </label>
                <input
                  type="email"
                  value={deleteConfirm}
                  onChange={e => setDeleteConfirm(e.target.value)}
                  placeholder={user.email}
                  className="w-full px-4 py-3 bg-accent/5 border border-accent/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all placeholder:text-slate-700 text-white"
                />
              </div>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirm !== user.email}
                className="w-full bg-accent/10 hover:bg-accent/20 disabled:opacity-30 disabled:cursor-not-allowed border border-accent/30 text-accent font-black py-3 rounded-xl transition-all"
              >
                Permanently Delete My Account
              </button>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 border border-white/10">
            <h2 className="font-black text-white mb-1 flex items-center gap-2">
              <LogOut className="w-5 h-5 text-slate-400" />
              Sign Out
            </h2>
            <p className="text-slate-500 text-sm mb-4">You can sign back in at any time.</p>
            <button
              onClick={async () => { await signOut(auth); navigate('/auth'); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-slate-300 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign Out of SnippetFlow
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
