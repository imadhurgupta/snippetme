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
    <div className="max-w-5xl mx-auto pb-24 px-4 sm:px-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-8">
        <div className="space-y-3">
          <h1 className="text-3xl md:text-5xl font-black mb-2 tracking-tighter text-white leading-none">
            Projects.
          </h1>
          <p className="text-slate-400 text-sm md:text-base font-medium max-w-md">
            Organize your snippets into focused, high-performance workspaces.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="btn-primary flex items-center justify-center gap-2 group hover:scale-[1.02] py-4 w-full md:w-auto px-8"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          <span>New Project</span>
        </button>
      </div>

      {/* Search & Stats */}
      <div className="flex flex-col md:flex-row gap-4 mb-12">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Filter projects by name or description..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-3xl focus:outline-none focus:border-white/20 focus:bg-white/[0.08] transition-all placeholder:text-slate-600 font-medium"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="w-10 h-10 border-2 border-white/10 border-t-white rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest animate-pulse">Synchronizing</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-[3rem] p-20 text-center border border-white/5">
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/10">
            <FolderOpen className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-3xl font-black mb-4 text-white">
            {projects.length === 0 ? 'Workspace Empty' : 'No matches found'}
          </h3>
          <p className="text-slate-400 mb-10 max-w-sm mx-auto text-lg">
            {projects.length === 0
              ? 'Establish your first project to begin organizing your code assets.'
              : 'Refine your search parameters to locate specific projects.'}
          </p>
          {projects.length === 0 && (
            <button onClick={openCreate} className="btn-primary py-4 px-10">
              Establish Workspace
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(proj => {
            const count = snippetCounts[proj.id] ?? 0;
            return (
              <div
                key={proj.id}
                className="glass-card flex flex-col group relative overflow-hidden"
              >
                {/* Decorative Aura */}
                <div 
                  className="absolute -top-12 -right-12 w-32 h-32 blur-3xl opacity-20 transition-opacity group-hover:opacity-40"
                  style={{ backgroundColor: proj.color }}
                />

                <div className="flex justify-between items-start mb-6">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-110"
                    style={{ 
                      backgroundColor: `${proj.color}15`, 
                      borderColor: `${proj.color}30` 
                    }}
                  >
                    <Folder className="w-7 h-7" style={{ color: proj.color }} />
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(proj)}
                      className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(proj)}
                      className="p-2.5 bg-white/5 hover:bg-red-500/10 rounded-xl transition-colors text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1">
                  <h2 className="text-xl font-black text-white mb-2 leading-tight group-hover:text-secondary transition-colors">
                    {proj.name}
                  </h2>
                  <p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed font-medium">
                    {proj.description || 'No project description added yet.'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                    <Code className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs font-black text-white">{count}</span>
                    <span className="text-[10px] uppercase font-black tracking-wider text-slate-500">Snippets</span>
                  </div>
                  
                  <Link
                    to={`/snippets?project=${proj.id}`}
                    className="flex items-center gap-1.5 text-sm font-black text-slate-400 hover:text-white transition-all group/link"
                  >
                    Open
                    <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
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
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-slate-700 text-base"
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
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-slate-700 resize-none text-base"
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
