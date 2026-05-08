import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../App';
import { Code, Plus, LogOut, User as UserIcon, LayoutGrid, Database } from 'lucide-react';

const Header = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useContext(AuthContext);

  const handleLogout = () => {
    localStorage.removeItem('gcp_token');
    setUser(null);
    navigate('/auth');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="absolute top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <div className="glass rounded-full px-3 md:px-6 h-14 md:h-16 flex items-center justify-between shadow-2xl pointer-events-auto max-w-full border border-white/10 select-none">
        <Link to="/" className="flex items-center space-x-2 group mr-2 md:mr-6 flex-shrink-0">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-all">
            <Code className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
          <span className="text-xs md:text-sm font-black tracking-tight text-white hidden lg:block">
            SnippetMe
          </span>
        </Link>
        
        {user && (
          <nav className="flex items-center gap-1 md:gap-2">
            <Link 
              to="/"
              className={`flex items-center gap-2 px-3 md:px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                isActive('/') ? 'bg-white text-black' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:block">Workspaces</span>
            </Link>

            <Link 
              to="/snippets"
              className={`flex items-center gap-2 px-3 md:px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                isActive('/snippets') ? 'bg-white text-black' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Database className="w-4 h-4" />
              <span className="hidden sm:block">Fragments</span>
            </Link>

            <Link 
              to="/create" 
              className="px-3 md:px-6 py-2 rounded-full bg-secondary text-white hover:bg-secondary-hover flex items-center gap-2 shadow-lg shadow-secondary/10 transition-all group"
            >
              <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
              <span className="hidden md:block">Compose</span>
            </Link>
            
            <div className="h-6 w-[1px] bg-white/10 mx-2"></div>
            
            <div className="flex items-center">
              <Link 
                to="/profile"
                className={`p-2 rounded-full transition-all ${isActive('/profile') ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                title="Profile"
              >
                <UserIcon className="w-5 h-5 md:w-4 md:h-4" />
              </Link>

              <button
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-all duration-200"
                title="Logout"
              >
                <LogOut className="w-5 h-5 md:w-4 md:h-4" />
              </button>
            </div>
          </nav>
        )}

        {!user && (
          <Link to="/auth" className="text-sm btn-pill bg-white text-black hover:bg-slate-100">
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;