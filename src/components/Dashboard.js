import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getSnippets, deleteSnippet, getProject } from '../db/database';
import SnippetCard from './SnippetCard';
import { Search, Filter, Plus, Loader2, ChevronRight, Code } from 'lucide-react';

const Dashboard = ({ user }) => {
  const [snippets, setSnippets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeProject, setActiveProject] = useState(null);
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');

  const fetchSnippets = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSnippets(user.uid, projectId);
      setSnippets(data);

      if (projectId) {
        const proj = await getProject(projectId);
        setActiveProject(proj);
      } else {
        setActiveProject(null);
      }
    } catch (error) {
      console.error('Error fetching snippets:', error);
    } finally {
      setLoading(false);
    }
  }, [user.uid, projectId]);

  useEffect(() => { fetchSnippets(); }, [fetchSnippets]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this snippet?')) {
      try {
        await deleteSnippet(id);
        setSnippets(snippets.filter(s => s.id !== id));
      } catch (error) {
        console.error('Error deleting snippet:', error);
      }
    }
  };

  const filteredSnippets = snippets.filter(snippet => {
    const matchesSearch =
      snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      snippet.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (snippet.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLanguage = !languageFilter || snippet.language === languageFilter;
    return matchesSearch && matchesLanguage;
  });

  const languages = [...new Set(snippets.map(s => s.language))].filter(Boolean);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-slate-400 font-medium animate-pulse">Syncing your snippets...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-24 pt-8">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-3">
          {/* Breadcrumb when in a project */}
          {activeProject && (
            <div className="flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500">
              <Link to="/projects" className="hover:text-white transition-colors">Projects</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span style={{ color: activeProject.color }}>{activeProject.name}</span>
            </div>
          )}
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white leading-none">
            {activeProject ? activeProject.name + '.' : 'Library.'}
          </h1>
          <p className="text-slate-400 text-sm md:text-base font-medium max-w-lg leading-relaxed">
            {activeProject
              ? activeProject.description || 'Project-specific code collection.'
              : 'Your curated repository of high-performance code fragments.'}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Stats pill */}
          <div className="glass px-4 md:px-5 h-10 md:h-12 rounded-full flex items-center gap-5 md:gap-6 border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-secondary shadow-lg shadow-secondary/20" />
              <span className="text-[10px] md:text-xs font-black whitespace-nowrap text-white">
                {snippets.length} <span className="text-slate-500 font-medium ml-0.5">Fragmnts</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-lg shadow-accent/20" />
              <span className="text-[10px] md:text-xs font-black whitespace-nowrap text-white">
                {languages.length} <span className="text-slate-500 font-medium ml-0.5">Syntaxes</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter row */}
      <div className="mb-8 flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 transition-colors group-focus-within:text-white" />
          <input
            type="text"
            placeholder="Search fragments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-white/20 focus:bg-white/[0.08] transition-all font-medium text-sm text-white placeholder:text-slate-600"
          />
        </div>

        <div className="flex gap-3">
          <div className="relative group min-w-[180px]">
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="w-full pl-5 pr-10 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-white/20 appearance-none cursor-pointer hover:bg-white/[0.08] transition-all font-bold text-sm text-white"
            >
              <option value="">All Languages</option>
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
            <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
          </div>

          <Link
            to={`/create${projectId ? `?project=${projectId}` : ''}`}
            className="md:hidden btn-primary p-4"
          >
            <Plus className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {filteredSnippets.length === 0 ? (
        <div className="glass rounded-[1.5rem] md:rounded-[2rem] p-6 sm:p-10 md:p-14 text-center border border-white/5">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 border border-white/10">
            <Code className="w-6 h-6 md:w-8 md:h-8 text-slate-500" />
          </div>
          <h3 className="text-xl md:text-2xl font-black mb-2 text-white">
            {searchTerm || languageFilter ? 'Precision Miss' : 'Empty Collection'}
          </h3>
          <p className="text-slate-400 mb-6 md:mb-8 max-w-xs mx-auto text-sm md:text-base">
            {searchTerm || languageFilter
              ? 'No fragments match your current filters. Refine your parameters.'
              : 'Begin your collection by creating your first technical fragment.'}
          </p>
          {(searchTerm || languageFilter) ? (
            <button 
              onClick={() => { setSearchTerm(''); setLanguageFilter(''); }}
              className="px-8 py-3 bg-white text-black font-black text-xs uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all"
            >
              Reset Filters
            </button>
          ) : (
            <Link
              to={`/create${projectId ? `?project=${projectId}` : ''}`}
              className="px-8 py-3 bg-secondary text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-secondary-hover shadow-lg shadow-secondary/10 transition-all inline-block"
            >
              Initialize Fragment
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSnippets.map(snippet => (
            <SnippetCard
              key={snippet.id}
              snippet={snippet}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
