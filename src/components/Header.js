import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { Code, Plus, LogOut, User as UserIcon, FolderOpen } from 'lucide-react';

const Header = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/auth');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full px-4 py-4">
      <div className="container mx-auto">
        <div className="glass rounded-2xl px-6 py-4 flex justify-between items-center shadow-2xl">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-primary/20 rounded-lg group-hover:bg-primary/30 transition-colors">
              <Code className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              SnippetFlow
            </span>
          </Link>
          
          {user && (
            <div className="flex items-center space-x-3">
              <Link 
                to="/"
                className="hidden md:flex items-center space-x-2 text-slate-400 hover:text-white px-4 py-2.5 rounded-xl transition-all hover:bg-white/5"
              >
                <FolderOpen className="w-4 h-4 text-primary" />
                <span className="font-bold">Projects</span>
              </Link>

              <Link 
                to="/snippets"
                className="hidden md:flex items-center space-x-2 text-slate-400 hover:text-white px-4 py-2.5 rounded-xl transition-all hover:bg-white/5"
              >
                <Code className="w-4 h-4 text-secondary" />
                <span className="font-medium">Snippets</span>
              </Link>

              <Link 
                to="/create" 
                className="hidden md:flex items-center space-x-2 bg-primary hover:bg-primary-hover px-5 py-2.5 rounded-xl transition-all duration-300 shadow-glow-primary hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                <span className="font-medium">New Snippet</span>
              </Link>
              
              <div className="h-8 w-[1px] bg-white/10 mx-2 hidden md:block"></div>
              
              <Link 
                to="/profile"
                className="flex items-center space-x-2 text-slate-400 px-2 py-1.5 rounded-lg hover:bg-white/5 hover:text-white transition-colors"
              >
                <UserIcon className="w-5 h-5" />
                <span className="hidden sm:inline text-sm font-medium">{user.displayName || user.email?.split('@')[0]}</span>
              </Link>

              <button
                onClick={handleLogout}
                className="p-2.5 text-slate-400 hover:text-accent hover:bg-accent/10 rounded-xl transition-all duration-200"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;