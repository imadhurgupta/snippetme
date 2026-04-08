import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getSnippet, deleteSnippet } from '../db/database';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, Edit2, Trash2, ChevronLeft } from 'lucide-react';

const SnippetDetail = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [snippet, setSnippet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchSnippet = useCallback(async () => {
    try {
      const data = await getSnippet(id);
      if (data) {
        setSnippet(data);
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error fetching snippet:', error);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchSnippet();
  }, [fetchSnippet]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this snippet?')) {
      try {
        await deleteSnippet(id);
        navigate('/');
      } catch (error) {
        console.error('Error deleting snippet:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] space-y-4">
        <div className="w-10 h-10 border-2 border-white/10 border-t-white rounded-full animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-widest animate-pulse">Synchronizing</p>
      </div>
    );
  }

  if (!snippet) {
    return (
      <div className="text-center py-20">
        <h2 className="text-3xl font-black text-white mb-4">Fragment not found</h2>
        <Link to="/" className="text-secondary hover:underline font-black uppercase tracking-widest text-xs">Return to Workspace</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-24 pt-8 px-4 sm:px-0">
      <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-8 group bg-white/5 py-1.5 px-4 rounded-full border border-white/10">
        <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
        <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 shadow-premium border border-white/5 relative overflow-hidden"
      >
        <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {snippet.language}
                </span>
              </div>
              <h1 className="text-2xl md:text-4xl font-black tracking-tighter text-white leading-tight">
                {snippet.title}
              </h1>
              <p className="text-slate-400 text-sm md:text-base font-medium leading-relaxed max-w-2xl">
                {snippet.description}
              </p>
              <div className="flex flex-wrap gap-2 pt-2 md:pt-4">
                {snippet.tags.map((tag, index) => (
                  <div key={index} className="flex items-center space-x-2 px-3 md:px-4 py-1.5 md:py-2 bg-white/5 rounded-full border border-white/10">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{tag}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <Link
                to={`/edit/${snippet.id}`}
                className="btn-primary flex-1 md:flex-none flex items-center justify-center gap-2.5 px-8"
              >
                <Edit2 className="w-4 h-4" />
                <span className="font-black">Modify</span>
              </Link>
              
              <button
                onClick={handleDelete}
                className="p-4 text-slate-500 hover:text-red-400 hover:bg-red-400/5 rounded-2xl transition-all border border-white/5 group"
                title="Purge Fragment"
              >
                <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-2 md:p-10 bg-[#020202]">
          <div className="glass rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border border-white/5 relative group/code shadow-2xl">
            <button
              onClick={handleCopy}
              className="absolute right-4 top-4 md:right-8 md:top-8 z-20 flex items-center space-x-2 bg-white text-black px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest shadow-2xl hover:bg-slate-100 transition-all active:scale-95 border border-white/10"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Snapshot'}</span>
            </button>
            
            <div className="overflow-auto max-h-[700px] scrollbar-none">
              <SyntaxHighlighter
                language={snippet.language.toLowerCase()}
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  padding: window.innerWidth < 768 ? '1.5rem' : '3rem',
                  background: 'transparent',
                  fontSize: '0.9rem',
                  lineHeight: '1.8',
                  fontFamily: '"JetBrains Mono", monospace',
                }}
                showLineNumbers={true}
                lineNumberStyle={{ color: 'rgba(255,255,255,0.05)', minWidth: '4em', paddingRight: '2em' }}
              >
                {snippet.code}
              </SyntaxHighlighter>
            </div>
          </div>
        </div>

        <div className="px-10 py-8 bg-white/[0.01] border-t border-white/5 text-[10px] text-slate-600 font-black uppercase tracking-[0.2em] flex flex-col md:flex-row justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6">
            <span className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-slate-800" /> Identity: {user.uid.substring(0, 16)}...</span>
            <span className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-slate-800" /> Identifier: {snippet.id}</span>
          </div>
          <span className="md:text-right">Synced: {snippet.updatedAt ? new Date(snippet.updatedAt.toDate()).toLocaleString() : 'Recent'}</span>
        </div>
      </motion.div>
    </div>
  );
};

export default SnippetDetail;