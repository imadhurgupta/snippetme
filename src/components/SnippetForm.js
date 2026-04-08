import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Type, AlignLeft, Globe, Hash, Code, Loader2, Save, Folder, ChevronRight, X } from 'lucide-react';
import { addSnippet, getSnippet, updateSnippet, getProjects } from '../db/database';

const LANGUAGES = [
  'JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 
  'TypeScript', 'Swift', 'Kotlin', 'Rust', 'HTML', 'CSS', 'SQL', 'Bash'
];

const SnippetForm = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const presetProjectId = searchParams.get('project') || '';
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    language: 'JavaScript',
    code: '',
    tags: '',
    projectId: presetProjectId
  });
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const fetchProjects = useCallback(async () => {
    try {
      const list = await getProjects(user.uid);
      setProjects(list);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  }, [user.uid]);

  const fetchSnippet = useCallback(async () => {
    if (!id) return;
    setFetching(true);
    try {
      const data = await getSnippet(id);
      if (data) {
        setFormData({
          title:       data.title       || '',
          description: data.description || '',
          language:    data.language    || 'JavaScript',
          code:        data.code        || '',
          tags:        Array.isArray(data.tags) ? data.tags.join(', ') : '',
          projectId:   data.projectId   || '',
        });
      }
    } catch (error) {
      console.error('Error fetching snippet:', error);
    } finally {
      setFetching(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProjects();
    if (id) {
      setIsEdit(true);
      fetchSnippet();
    } else {
      setIsEdit(false);
      setFormData({ 
        title: '', 
        description: '', 
        language: 'JavaScript', 
        code: '', 
        tags: '', 
        projectId: presetProjectId 
      });
    }
  }, [id, fetchSnippet, fetchProjects, presetProjectId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const tags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
      const payload = {
        title:       formData.title,
        description: formData.description,
        language:    formData.language,
        code:        formData.code,
        tags,
        projectId:   formData.projectId || '',
        userId:      user.uid,
      };

      if (isEdit) {
        await updateSnippet(id, payload);
      } else {
        await addSnippet(payload);
      }
      navigate('/snippets'); // Go back to snippets list
    } catch (error) {
      console.error('Error saving snippet:', error);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] space-y-4">
        <div className="w-10 h-10 border-2 border-white/10 border-t-white rounded-full animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-widest animate-pulse">Syncing Fragment Data</p>
      </div>
    );
  }

  if (!isEdit && !loading && projects.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center">
        <div className="glass rounded-[3rem] p-16 border border-white/5 shadow-premium relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-secondary/10 rounded-full blur-3xl opacity-50"></div>
          <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-10 border border-white/10">
            <Folder className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-3xl font-black mb-4 text-white tracking-tight leading-tight">Workspace Required.</h2>
          <p className="text-slate-500 text-lg mb-12 leading-relaxed font-medium">
            Fragments must be associated with a workspace. Establish your first <span className="text-white font-bold">Project Project</span> first.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="btn-primary w-full py-5 text-sm"
          >
            Establish Project
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-24 pt-8 px-4 sm:px-0">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10"
      >
        <div className="space-y-2">
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white leading-none">
            {isEdit ? 'Refine.' : 'Compose.'}
          </h1>
          <p className="text-slate-500 text-sm md:text-base font-medium tracking-tight">
            {isEdit ? 'Update your technical fragment with precision.' : 'Design a high-performance code solution.'}
          </p>
        </div>
        
        <button
          onClick={() => navigate(-1)}
          type="button"
          className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
        >
          <X className="w-4 h-4 text-slate-500" />
        </button>
      </motion.div>

      <motion.form 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit} 
        className="glass rounded-[1.5rem] md:rounded-[2rem] p-6 sm:p-8 md:p-10 shadow-premium space-y-8 border border-white/5 relative overflow-hidden"
      >
        {/* Decorative Aura */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Title */}
          <div className="space-y-3">
            <label className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 ml-1">
              <Type className="w-3.5 h-3.5" />
              <span>Fragment Title</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Optimized Auth Protocol"
              className="w-full px-6 py-5 bg-white/[0.03] border border-white/10 rounded-2xl focus:outline-none focus:border-white/20 transition-all placeholder:text-slate-800 font-bold text-white text-lg"
              required
            />
          </div>

          {/* Language */}
          <div className="space-y-3">
            <label className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 ml-1">
              <Globe className="w-3.5 h-3.5" />
              <span>Syntax Protocol</span>
            </label>
            <div className="relative group">
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="w-full px-6 py-5 bg-white/[0.03] border border-white/10 rounded-2xl focus:outline-none focus:border-white/20 transition-all appearance-none cursor-pointer font-bold text-white text-lg"
                required
              >
                {LANGUAGES.map(lang => (
                  <option key={lang} value={lang} className="bg-[#050505]">{lang}</option>
                ))}
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600">
                <ChevronRight className="w-5 h-5 rotate-90" />
              </div>
            </div>
          </div>

          {/* Project Dropdown */}
          <div className="space-y-3">
            <label className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 ml-1">
              <Folder className="w-3.5 h-3.5" />
              <span>Workspace Target</span>
            </label>
            <div className="relative group">
              <select
                name="projectId"
                value={formData.projectId}
                onChange={handleChange}
                className="w-full px-6 py-5 bg-white/[0.03] border border-white/10 rounded-2xl focus:outline-none focus:border-white/20 transition-all appearance-none cursor-pointer font-bold text-white text-lg"
                style={{ color: projects.find(p => p.id === formData.projectId)?.color || 'inherit' }}
              >
                <option value="" className="bg-[#050505] text-slate-700 font-medium">Standard Library (Global)</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id} className="bg-[#050505] font-bold" style={{ color: p.color }}>
                    {p.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600">
                <ChevronRight className="w-5 h-5 rotate-90" />
              </div>
            </div>
          </div>
          
          {/* Tags */}
          <div className="space-y-3">
            <label className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 ml-1">
              <Hash className="w-3.5 h-3.5" />
              <span>Classification Tags</span>
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g. async, security, pattern"
              className="w-full px-6 py-5 bg-white/[0.03] border border-white/10 rounded-2xl focus:outline-none focus:border-white/20 transition-all placeholder:text-slate-800 font-bold text-white text-lg"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-3">
          <label className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 ml-1">
            <AlignLeft className="w-3.5 h-3.5" />
            <span>Problem Definition</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Define the structural purpose of this creation..."
            rows="2"
            className="w-full px-6 py-5 bg-white/[0.03] border border-white/10 rounded-2xl focus:outline-none focus:border-white/20 transition-all placeholder:text-slate-800 font-medium text-white resize-none text-lg min-h-[100px]"
          />
        </div>

        {/* Source Code */}
        <div className="space-y-3">
          <label className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 ml-1">
            <Code className="w-3.5 h-3.5" />
            <span>Source Implementation</span>
          </label>
          <div className="relative group overflow-hidden rounded-[2.5rem] border border-white/5 bg-[#020202] shadow-premium-inner ring-1 ring-white/5 focus-within:ring-white/10 transition-all">
            <textarea
              name="code"
              value={formData.code}
              onChange={handleChange}
              rows="15"
              className="w-full px-10 py-10 bg-transparent relative z-10 focus:outline-none font-mono text-base leading-relaxed text-white scrollbar-none"
              required
              placeholder="// Design your source code here..."
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 pt-10">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1 py-5 text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-4"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
            <span>{isEdit ? 'Sync Changes' : 'Record Creation'}</span>
          </button>
          
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-12 py-5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-500 hover:text-white font-black rounded-2xl transition-all uppercase tracking-widest text-xs active:scale-95"
          >
            Abort
          </button>
        </div>
      </motion.form>
    </div>
  );
};

export default SnippetForm;