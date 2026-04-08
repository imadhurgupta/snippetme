import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Type, AlignLeft, Globe, Hash, Code, Loader2, Save, Sparkles, Folder, ChevronRight } from 'lucide-react';
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
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-slate-400 font-medium animate-pulse">Retrieving snippet details...</p>
      </div>
    );
  }

  if (!isEdit && !loading && projects.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center">
        <div className="glass rounded-[3rem] p-12 border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
          <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-primary/20 shadow-glow-primary">
            <Folder className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-3xl font-black mb-4 text-white tracking-tight">Project Required</h2>
          <p className="text-slate-400 text-lg mb-10 leading-relaxed font-medium">
            To keep your library organized, you must create a <span className="text-white font-bold">Project Workspace</span> first before adding any snippets.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center space-x-3 bg-primary hover:bg-primary-hover px-8 py-5 rounded-2xl font-black transition-all shadow-glow-primary hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="w-6 h-6" />
            <span>Create First Project</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center space-x-5 mb-12"
      >
        <div className="p-4 bg-primary/10 rounded-3xl border border-primary/20 shadow-glow-primary">
          <Sparkles className="w-10 h-10 text-primary" />
        </div>
        <div>
          <h1 className="text-5xl font-black tracking-tight text-white leading-tight">
            {isEdit ? 'Refine Snippet' : 'New Creation'}
          </h1>
          <p className="text-slate-400 text-lg font-medium tracking-wide">
            {isEdit ? 'Update your technical solution' : 'Document a new elegant architecture'}
          </p>
        </div>
      </motion.div>

      <motion.form 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit} 
        className="glass rounded-[3.5rem] p-10 md:p-16 shadow-2xl space-y-10 border border-white/10 relative overflow-hidden"
      >
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-[100px]"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* Title */}
          <div className="space-y-3">
            <label className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-400 ml-2">
              <Type className="w-4 h-4" />
              <span>Snippet Title</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Auth Middleware"
              className="w-full px-6 py-5 bg-white/[0.03] border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/[0.07] transition-all placeholder:text-slate-600 font-bold text-white shadow-inner text-lg"
              required
            />
          </div>

          {/* Language */}
          <div className="space-y-3">
            <label className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-400 ml-2">
              <Globe className="w-4 h-4" />
              <span>Programming Language</span>
            </label>
            <div className="relative group">
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="w-full px-6 py-5 bg-white/[0.03] border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/[0.07] transition-all appearance-none cursor-pointer font-bold text-white group-hover:border-white/20 text-lg"
                required
              >
                {LANGUAGES.map(lang => (
                  <option key={lang} value={lang} className="bg-slate-900">{lang}</option>
                ))}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-white transition-colors">
                <ChevronRight className="w-5 h-5 rotate-90" />
              </div>
            </div>
          </div>

          {/* Project Dropdown */}
          <div className="space-y-3">
            <label className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-400 ml-2">
              <Folder className="w-4 h-4" />
              <span>Project Workspace</span>
            </label>
            <div className="relative group">
              <select
                name="projectId"
                value={formData.projectId}
                onChange={handleChange}
                className="w-full px-6 py-5 bg-white/[0.03] border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/[0.07] transition-all appearance-none cursor-pointer font-bold text-white group-hover:border-white/20 text-lg"
                style={{ color: projects.find(p => p.id === formData.projectId)?.color || 'inherit' }}
              >
                <option value="" className="bg-slate-900 text-slate-500 italic">No Project (Global)</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id} className="bg-slate-900 font-bold" style={{ color: p.color }}>
                    {p.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-white transition-colors">
                <ChevronRight className="w-5 h-5 rotate-90" />
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-3">
          <label className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-400 ml-2">
            <AlignLeft className="w-4 h-4" />
            <span>Logic Description</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the problem this solves..."
            rows="2"
            className="w-full px-6 py-5 bg-white/[0.03] border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/[0.07] transition-all placeholder:text-slate-600 font-medium text-white resize-none text-lg"
          />
        </div>

        {/* Tags */}
        <div className="space-y-3">
          <label className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-400 ml-2">
            <Hash className="w-4 h-4" />
            <span>Categorization Tags</span>
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="e.g. backend, security, cleanup (comma separated)"
            className="w-full px-6 py-5 bg-white/[0.03] border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/[0.07] transition-all placeholder:text-slate-600 font-bold text-lg"
          />
        </div>

        {/* Source Code */}
        <div className="space-y-3">
          <label className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-400 ml-2">
            <Code className="w-4 h-4" />
            <span>Code Fragment</span>
          </label>
          <div className="relative group overflow-hidden rounded-[2.5rem] border border-white/10 focus-within:ring-2 focus-within:ring-primary/50 transition-all shadow-2xl">
            <div className="absolute inset-0 bg-primary/5 pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
            <textarea
              name="code"
              value={formData.code}
              onChange={handleChange}
              rows="12"
              className="w-full px-8 py-8 bg-black/50 relative z-10 focus:outline-none font-mono text-base leading-relaxed text-white scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
              required
              placeholder="// Paste your code here..."
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 pt-6">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 relative group bg-primary hover:bg-primary-hover text-white font-black text-lg py-5 px-8 rounded-2xl transition-all shadow-glow-primary hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 overflow-hidden flex items-center justify-center space-x-3"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
            <span>{isEdit ? 'Save Changes' : 'Establish Snippet'}</span>
          </button>
          
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-10 py-5 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-slate-400 hover:text-white font-black rounded-2xl transition-all"
          >
            Cancel
          </button>
        </div>
      </motion.form>
    </div>
  );
};

export default SnippetForm;