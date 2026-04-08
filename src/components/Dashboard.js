import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getSnippets, deleteSnippet, getProject } from '../db/database';
import SnippetCard from './SnippetCard';
import { Search, Filter, Plus, Code, Layers, Zap, Loader2, ChevronRight } from 'lucide-react';

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
    <div className="max-w-7xl mx-auto pb-20">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          {/* Breadcrumb when in a project */}
          {activeProject && (
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
              <Link to="/projects" className="hover:text-white transition-colors">Projects</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="font-bold" style={{ color: activeProject.color }}>{activeProject.name}</span>
            </div>
          )}
          <h1 className="text-4xl md:text-5xl font-black mb-3 tracking-tight bg-gradient-to-br from-white via-white to-white/40 bg-clip-text text-transparent">
            {activeProject ? activeProject.name : 'Your Library'}
          </h1>
          <p className="text-slate-400 text-lg max-w-xl">
            {activeProject
              ? activeProject.description || 'Snippets in this project.'
              : 'A curated collection of your most valuable code fragments and solutions.'}
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Stats pill */}
          <div className="glass px-4 py-2 rounded-xl flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Code className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold">{snippets.length} <span className="text-slate-500 font-medium">Snippets</span></span>
            </div>
            <div className="h-4 w-[1px] bg-white/10" />
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-secondary" />
              <span className="text-sm font-bold">{languages.length} <span className="text-slate-500 font-medium">Languages</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter row */}
      <div className="mb-8 flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search titles, descriptions, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/[0.08] transition-all"
          />
        </div>

        <div className="flex gap-4">
          <div className="relative group">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="pl-11 pr-10 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer hover:bg-white/[0.08] transition-all min-w-[180px]"
            >
              <option value="">All Languages</option>
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          <Link
            to={`/create${projectId ? `?project=${projectId}` : ''}`}
            className="md:hidden flex items-center justify-center bg-primary hover:bg-primary-hover p-4 rounded-2xl transition-all shadow-glow-primary active:scale-95"
          >
            <Plus className="w-6 h-6" />
          </Link>
        </div>
      </div>

      {filteredSnippets.length === 0 ? (
        <div className="glass rounded-3xl p-12 md:p-20 text-center border-dashed border-2 border-white/5">
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            {snippets.length === 0 ? <Zap className="w-10 h-10 text-primary" /> : <Search className="w-10 h-10 text-slate-500" />}
          </div>
          <h3 className="text-2xl md:text-3xl font-bold mb-3">
            {snippets.length === 0 ? 'No snippets here yet' : 'No matches found'}
          </h3>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            {snippets.length === 0
              ? 'Add your first snippet to this collection.'
              : "We couldn't find any snippets matching your search."}
          </p>
          {snippets.length === 0 ? (
            <Link
              to={`/create${projectId ? `?project=${projectId}` : ''}`}
              className="inline-flex items-center space-x-2 bg-primary hover:bg-primary-hover px-8 py-4 rounded-2xl font-bold transition-all shadow-glow-primary hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              <span>Create First Snippet</span>
            </Link>
          ) : (
            <button
              onClick={() => { setSearchTerm(''); setLanguageFilter(''); }}
              className="text-primary font-bold hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
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
