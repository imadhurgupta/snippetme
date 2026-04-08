import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, Edit2, Trash2, Calendar, Tag as TagIcon } from 'lucide-react';

const SnippetCard = ({ snippet, onDelete }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const getLanguageColor = (lang) => {
    const colors = {
      javascript: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
      python: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
      html: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
      css: 'text-sky-400 bg-sky-400/10 border-sky-400/20',
      react: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
    };
    return colors[lang.toLowerCase()] || 'text-slate-400 bg-slate-400/10 border-slate-400/20';
  };

  return (
    <div className="glass rounded-xl overflow-hidden group flex flex-col h-full hover:border-primary/30 transition-all hover:shadow-glow-primary duration-300">
      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-5">
          <div className="flex-1">
            <h3 className="text-xl font-black text-white group-hover:text-primary transition-colors line-clamp-1 tracking-tight">
              {snippet.title}
            </h3>
            <p className="text-slate-500 text-sm mt-1.5 line-clamp-2 min-h-[40px] font-medium leading-relaxed">
              {snippet.description}
            </p>
          </div>
          <span className={`text-[10px] font-black uppercase tracking-[0.15em] px-2.5 py-1 rounded border font-mono ${getLanguageColor(snippet.language)}`}>
            {snippet.language}
          </span>
        </div>

        <div className="relative mb-5 rounded-lg overflow-hidden border border-white/5 bg-black/60 shadow-inner">
          <div className="absolute right-3 top-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              className="p-2.5 bg-background/90 backdrop-blur-md rounded-lg text-slate-400 hover:text-primary border border-white/5 hover:border-primary/20 transition-all shadow-2xl"
              title="Copy code"
            >
              {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <SyntaxHighlighter
            language={snippet.language.toLowerCase()}
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              padding: '1.5rem',
              background: 'transparent',
              fontSize: '0.85rem',
              lineHeight: '1.6',
              maxHeight: '180px',
              fontFamily: '"JetBrains Mono", monospace'
            }}
          >
            {snippet.code}
          </SyntaxHighlighter>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {snippet.tags.map((tag, index) => (
            <div key={index} className="flex items-center space-x-1.5 px-2.5 py-1 bg-white/[0.03] rounded border border-white/5 group-hover:border-white/10 transition-colors">
              <TagIcon className="w-3 h-3 text-primary/60" />
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">{tag}</span>
            </div>
          ))}
        </div>

        <div className="mt-auto flex justify-between items-center pt-5 border-t border-white/[0.05]">
          <div className="flex items-center space-x-2 text-slate-600 font-mono">
            <Calendar className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-widest leading-none">
              {snippet.updatedAt ? new Date(snippet.updatedAt.toDate()).toLocaleDateString() : 'Active'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Link
              to={`/edit/${snippet.id}`}
              className="p-2 text-slate-500 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
              title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </Link>
            <button
              onClick={() => onDelete(snippet.id)}
              className="p-2 text-slate-500 hover:text-accent hover:bg-accent/5 rounded-lg transition-all"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnippetCard;