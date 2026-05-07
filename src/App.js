import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import SnippetForm from './components/SnippetForm';
import SnippetDetail from './components/SnippetDetail';
import Profile from './components/Profile';
import Projects from './components/Projects';
import { Loader2 } from 'lucide-react';

export const AuthContext = React.createContext(null);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('gcp_token');
    if (token) {
      fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
        } else {
          localStorage.removeItem('gcp_token');
        }
      })
      .catch(() => localStorage.removeItem('gcp_token'))
      .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-slate-400 font-bold tracking-widest uppercase text-xs animate-pulse">Initializing Environment</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, setUser }}>
    <Router>
      <div className="min-h-screen text-slate-300 selection:bg-secondary/30 scroll-smooth font-sans relative">
        {/* Premium Background System */}
        <div className="bg-premium">
          <div className="aura aura-1"></div>
          <div className="aura aura-2"></div>
          <div className="aura aura-3"></div>
        </div>

        <Header user={user} />
        <main className="container mx-auto px-4 pt-24 pb-8 md:pt-28 md:pb-16 relative z-10">
          <Routes>
            <Route 
              path="/auth" 
              element={!user ? <Auth /> : <Navigate to="/" />} 
            />
            <Route 
              path="/" 
              element={user ? <Projects user={user} /> : <Navigate to="/auth" />} 
            />
            <Route 
              path="/snippets" 
              element={user ? <Dashboard user={user} /> : <Navigate to="/auth" />} 
            />
            <Route 
              path="/create" 
              element={user ? <SnippetForm user={user} /> : <Navigate to="/auth" />} 
            />
            <Route 
              path="/edit/:id" 
              element={user ? <SnippetForm user={user} /> : <Navigate to="/auth" />} 
            />
            <Route 
              path="/snippet/:id" 
              element={user ? <SnippetDetail user={user} /> : <Navigate to="/auth" />} 
            />
            <Route 
              path="/profile" 
              element={user ? <Profile user={user} /> : <Navigate to="/auth" />} 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
    </AuthContext.Provider>
  );
}

export default App;