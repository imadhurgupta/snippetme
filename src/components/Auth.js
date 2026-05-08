import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';

import { AuthContext } from '../App';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const url = '/api/auth/login';
    const body = { email, password };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem('gcp_token', data.token);
        setUser(data.user);
        navigate('/');
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  const containerVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.05 },
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 relative py-12">
      <motion.div 
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="max-w-md w-full"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="inline-flex py-1 px-3 bg-secondary/10 rounded-full mb-6 border border-secondary/20 shadow-inner"
          >
            <span className="text-[10px] font-black uppercase tracking-wider text-secondary flex items-center gap-2">
              <Sparkles className="w-3 h-3" />
              Trusted by developers
            </span>
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter text-white leading-[0.9]">
            Welcome to SnippetMe
          </h1>
          <p className="text-slate-400 text-base md:text-lg font-medium leading-relaxed max-w-sm mx-auto">
            Sign in or create an account to access your snippets.
          </p>
        </div>

        <motion.div 
          layout
          className="glass rounded-3xl md:rounded-4xl p-6 md:p-10 shadow-premium border border-white/10 relative overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden w-full"
              >
                <div className="flex items-start space-x-3 bg-red-500/10 border border-red-500/20 text-red-400 px-5 py-4 rounded-2xl mb-8 text-sm font-bold w-full">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@example.com"
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-white/20 focus:bg-white/[0.08] transition-all placeholder:text-slate-600 font-bold"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-white/20 focus:bg-white/[0.08] transition-all placeholder:text-slate-600 font-bold"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-5 text-lg font-black flex items-center justify-center space-x-3 disabled:opacity-50 mt-8"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-6 h-6" />
                  <span>Continue</span>
                </>
              )}
            </button>
          </form>


        </motion.div>


      </motion.div>
    </div>
  );
};

export default Auth;