import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getSnippet, deleteSnippet } from '../db/database';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, Edit2, Trash2, Clock, Tag as TagIcon, ChevronLeft } from 'lucide-react';

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
        <div className="w-10 h-10 border-2 border-white/20 border-t-primary rounded-full animate-spin" />
        <p className="text-slate-400 font-medium">Decompressing source...</p>
      </div>
    );
  }

  if (!snippet) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-white mb-4">Snippet not found</h2>
        <Link to="/" className="text-primary hover:underline">Return to Library</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <Link to="/" className="inline-flex items-center space-x-2 text-slate-400 hover:text-white transition-colors mb-8 group">
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Back to Library</span>
      </Link>

      <div className="glass rounded-[2.5rem] overflow-hidden border border-white/10 shadow-3xl">
        <div className="p-8 md:p-12 border-b border-white/5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <span className="bg-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-primary/20">
                  {snippet.language}
                </span>
                <div className="flex items-center space-x-1 text-slate-500 text-xs font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{snippet.createdAt ? new Date(snippet.createdAt.toDate()).toLocaleDateString() : 'Historical'}</span>
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                {snippet.title}
              </h1>
              <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
                {snippet.description}
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                {snippet.tags.map((tag, index) => (
                  <div key={index} className="flex items-center space-x-1 px-3 py-1.5 bg-white/5 rounded-xl border border-white/10">
                    <TagIcon className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-xs text-slate-300 font-medium">{tag}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                to={`/edit/${snippet.id}`}
                className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3.5 rounded-2xl font-bold transition-all"
              >
                <Edit2 className="w-4 h-4" />
                <span className="hidden sm:inline">Modify</span>
              </Link>
              
              <button
                onClick={handleDelete}
                className="p-3.5 text-slate-500 hover:text-accent hover:bg-accent/10 rounded-2xl transition-all border border-transparent hover:border-accent/20"
                title="Delete permanent"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-8 bg-black/20">
          <div className="glass rounded-[1.5rem] overflow-hidden border border-white/5 relative group">
            <button
              onClick={handleCopy}
              className="absolute right-6 top-6 z-20 flex items-center space-x-2 bg-white text-black px-4 py-2 rounded-xl font-bold text-sm shadow-2xl hover:bg-slate-200 transition-all active:scale-95"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy Source'}</span>
            </button>
            
            <div className="overflow-auto max-h-[600px] scrollbar-thin">
              <SyntaxHighlighter
                language={snippet.language.toLowerCase()}
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  padding: '1.5rem md:padding:2.5rem',
                  background: 'transparent',
                  fontSize: '0.95rem',
                  lineHeight: '1.7',
                }}
                showLineNumbers={true}
                lineNumberStyle={{ color: 'rgba(255,255,255,0.1)', minWidth: '3em' }}
              >
                {snippet.code}
              </SyntaxHighlighter>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 bg-white/[0.02] border-t border-white/5 text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em] flex justify-between">
          <div className="flex items-center space-x-4">
            <span>Identity: {user.uid.substring(0, 8)}...</span>
            <span className="hidden sm:inline">ID: {snippet.id.substring(0, 8)}...</span>
          </div>
          <span>Updated: {snippet.updatedAt ? new Date(snippet.updatedAt.toDate()).toLocaleString() : 'N/A'}</span>
        </div>
      </div>
    </div>
  );
};

export default SnippetDetail;