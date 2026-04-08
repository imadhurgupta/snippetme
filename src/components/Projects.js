import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  getProjects, addProject, updateProject, deleteProject, getSnippetCountByProject
} from '../db/database';
import {
  FolderOpen, Folder, Plus, Edit2, Trash2, Code,
  ChevronRight, X, Save, Loader2, Search, Check
} from 'lucide-react';

const PROJECT_COLORS = [
  { name: 'Indigo',  bg: 'bg-indigo-500',  glow: 'shadow-indigo-500/30',  text: 'text-indigo-400',  border: 'border-indigo-500/30',  hex: '#6366f1' },
  { name: 'Violet',  bg: 'bg-violet-500',  glow: 'shadow-violet-500/30',  text: 'text-violet-400',  border: 'border-violet-500/30',  hex: '#8b5cf6' },
  { name: 'Rose',    bg: 'bg-rose-500',    glow: 'shadow-rose-500/30',    text: 'text-rose-400',    border: 'border-rose-500/30',    hex: '#f43f5e' },
  { name: 'Amber',   bg: 'bg-amber-500',   glow: 'shadow-amber-500/30',   text: 'text-amber-400',   border: 'border-amber-500/30',   hex: '#f59e0b' },
  { name: 'Emerald', bg: 'bg-emerald-500', glow: 'shadow-emerald-500/30', text: 'text-emerald-400', border: 'border-emerald-500/30', hex: '#10b981' },
  { name: 'Sky',     bg: 'bg-sky-500',     glow: 'shadow-sky-500/30',     text: 'text-sky-400',     border: 'border-sky-500/30',     hex: '#0ea5e9' },
  { name: 'Pink',    bg: 'bg-pink-500',    glow: 'shadow-pink-500/30',    text: 'text-pink-400',    border: 'border-pink-500/30',    hex: '#ec4899' },
  { name: 'Cyan',    bg: 'bg-cyan-500',    glow: 'shadow-cyan-500/30',    text: 'text-cyan-400',    border: 'border-cyan-500/30',    hex: '#06b6d4' },
];

const Projects = ({ user }) => {
  const [projects, setProjects] = useState([]);
  const [snippetCounts, setSnippetCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formColor, setFormColor] = useState(PROJECT_COLORS[0]);
  const [saving, setSaving] = useState(false);

  const fetchProjects = useCallback(async () => {
    try {
      const list = await getProjects(user.uid);
      setProjects(list);

      // fetch snippet counts per project
      const counts = {};
      await Promise.all(list.map(async (proj) => {
        const count = await getSnippetCountByProject(user.uid, proj.id);
        counts[proj.id] = count;
      }));
      setSnippetCounts(counts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user.uid]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const openCreate = () => {
    setFormName(''); setFormDesc(''); setFormColor(PROJECT_COLORS[0]);
    setEditingProject(null);
    setShowCreate(true);
  };

  const openEdit = (proj) => {
    setFormName(proj.name);
    setFormDesc(proj.description || '');
    setFormColor(PROJECT_COLORS.find(c => c.hex === proj.color) || PROJECT_COLORS[0]);
    setEditingProject(proj);
    setShowCreate(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formName.trim()) return;
    setSaving(true);
    try {
      const data = {
        name: formName.trim(),
        description: formDesc.trim(),
        color: formColor.hex,
        userId: user.uid,
      };
      if (editingProject) {
        await updateProject(editingProject.id, data);
      } else {
        await addProject(data);
      }
      setShowCreate(false);
      fetchProjects();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (proj) => {
    if (!window.confirm(`Delete project "${proj.name}"? Snippets will not be deleted.`)) return;
    try {
      await deleteProject(proj.id);
      setProjects(p => p.filter(x => x.id !== proj.id));
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto pb-24">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black mb-3 tracking-tight bg-gradient-to-br from-white via-white to-white/40 bg-clip-text text-transparent">
            Projects
          </h1>
          <p className="text-slate-400 text-lg">
            Organise your snippets into focused workspaces.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover px-6 py-3 rounded-2xl font-bold transition-all shadow-glow-primary hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-5 h-5" />
          New Project
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <input
          type="text"
          placeholder="Search projects..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-48 gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-slate-500 text-sm font-medium animate-pulse">Loading projects...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-3xl p-16 text-center border-dashed border-2 border-white/5">
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FolderOpen className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-2xl font-bold mb-3">
            {projects.length === 0 ? 'No projects yet' : 'No results found'}
          </h3>
          <p className="text-slate-400 mb-8 max-w-sm mx-auto">
            {projects.length === 0
              ? 'Create your first project to start organising your snippets.'
              : 'Try a different search term.'}
          </p>
          {projects.length === 0 && (
            <button onClick={openCreate} className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover px-8 py-4 rounded-2xl font-bold transition-all shadow-glow-primary">
              <Plus className="w-5 h-5" /> Create First Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(proj => {
            const count = snippetCounts[proj.id] ?? 0;
            return (
              <div
                key={proj.id}
                className="glass rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all group relative flex flex-col"
              >
                {/* Color accent bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                  style={{ background: proj.color }}
                />

                {/* Action buttons */}
                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(proj)}
                    className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(proj)}
                    className="p-1.5 bg-white/5 hover:bg-accent/20 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-accent" />
                  </button>
                </div>

                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${proj.color}22`, border: `1px solid ${proj.color}44` }}
                >
                  <Folder className="w-6 h-6" style={{ color: proj.color }} />
                </div>

                <h2 className="text-lg font-black text-white mb-1 pr-14">{proj.name}</h2>
                <p className="text-slate-500 text-sm mb-4 flex-1 line-clamp-2">
                  {proj.description || 'No description'}
                </p>

                  <div className="flex items-center gap-3 mt-auto pt-4 border-t border-white/5">
                    <div className="flex items-center gap-1.5 text-slate-500 text-sm flex-1">
                      <Code className="w-4 h-4" />
                      <span className="font-bold" style={{ color: proj.color }}>{count}</span>
                      <span>snippet{count !== 1 ? 's' : ''}</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Link
                        to={`/create?project=${proj.id}`}
                        className="flex items-center gap-2 text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all text-slate-400 hover:text-white"
                      >
                        <Plus className="w-3 h-3" />
                        Add
                      </Link>
                      <Link
                        to={`/snippets?project=${proj.id}`}
                        className="flex items-center gap-1 text-sm font-bold transition-colors hover:text-white"
                        style={{ color: proj.color }}
                      >
                        View all <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass rounded-3xl p-8 w-full max-w-md border border-white/15 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-white">
                {editingProject ? 'Edit Project' : 'New Project'}
              </h2>
              <button onClick={() => setShowCreate(false)} className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Project Name *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. Portfolio Website"
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-slate-700"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Description</label>
                <textarea
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  placeholder="What is this project about?"
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-slate-700 resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Color</label>
                <div className="flex flex-wrap gap-2">
                  {PROJECT_COLORS.map(c => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setFormColor(c)}
                      className="w-8 h-8 rounded-lg transition-all hover:scale-110 flex items-center justify-center"
                      style={{ background: c.hex }}
                      title={c.name}
                    >
                      {formColor.hex === c.hex && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !formName.trim()}
                  className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary-hover font-bold transition-all shadow-glow-primary flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editingProject ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
