import React, { useState } from 'react';
import { auth, googleProvider, githubProvider } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, UserPlus, Sparkles, AlertCircle, ChevronRight, User, ShieldCheck, Github, Chrome, CheckCircle } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setResetSent(false);
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
      }
      navigate('/');
    } catch (err) {
      const code = err.code || '';
      let msg = err.message.replace('Firebase:', '').trim();
      if (code === 'auth/wrong-password') msg = 'Incorrect password. Please try again.';
      if (code === 'auth/user-not-found') msg = 'Account not found. Would you like to register?';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch (err) {
      setError(err.message.replace('Firebase:', '').trim());
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/');
    } catch (err) {
      setError(err.message.replace('Firebase:', '').trim());
    }
  };

  const handleGithubSignIn = async () => {
    setError('');
    try {
      await signInWithPopup(auth, githubProvider);
      navigate('/');
    } catch (err) {
      setError(err.message.replace('Firebase:', '').trim());
    }
  };

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 relative py-12">
      {/* Dynamic Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-[30rem] h-[30rem] bg-primary/10 rounded-full blur-[140px] -z-10 animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-secondary/10 rounded-full blur-[140px] -z-10 animate-pulse-slow delay-700"></div>

    <motion.div 
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="max-w-md w-full"
    >
        {/* Header Section */}
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex p-4 bg-white/[0.03] rounded-3xl mb-6 border border-white/10 shadow-inner"
          >
            <Sparkles className="w-10 h-10 text-primary" />
          </motion.div>
          <h1 className="text-5xl font-black mb-4 tracking-tighter text-white bg-gradient-to-br from-white via-white to-white/40 bg-clip-text text-transparent">
            {isLogin ? 'Welcome back.' : 'Experience flow.'}
          </h1>
          <p className="text-slate-400 text-lg font-medium leading-relaxed">
            {isLogin 
              ? 'Your library is ready and synchronized.' 
              : 'Join thousands of developers managing fragments with ease.'}
          </p>
        </div>

        {/* Auth Card */}
        <motion.div 
          layout
          className="glass rounded-[3rem] p-10 shadow-2xl border border-white/10 relative overflow-hidden"
        >
          {/* Subtle accent light */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-[60px]"></div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-start space-x-3 bg-accent/10 border border-accent/20 text-accent px-5 py-4 rounded-2xl mb-8 text-sm font-bold">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              </motion.div>
            )}
            {resetSent && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-start space-x-3 bg-primary/10 border border-primary/20 text-primary px-5 py-4 rounded-2xl mb-8 text-sm font-bold">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>Reset link sent to your email!</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleAuth} className="space-y-6">
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-2"
                >
                  <label className="flex items-center space-x-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">
                    <User className="w-3.5 h-3.5" />
                    <span>Full Identity</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g. John Carmack"
                    className="w-full px-6 py-4 bg-white/[0.03] border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/[0.07] transition-all placeholder:text-slate-700 font-bold"
                    required={!isLogin}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">
                <Mail className="w-3.5 h-3.5" />
                <span>Access Terminal</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@snippetflow.io"
                className="w-full px-6 py-4 bg-white/[0.03] border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/[0.07] transition-all placeholder:text-slate-700 font-bold"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-2">
                <label className="flex items-center space-x-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Security Token</span>
                </label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[10px] font-black text-primary hover:text-primary-hover uppercase tracking-[0.1em]"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-6 py-4 bg-white/[0.03] border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/[0.07] transition-all placeholder:text-slate-700 font-bold font-mono"
                required={isLogin}
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full relative group bg-primary hover:bg-primary-hover text-white font-black py-5 px-6 rounded-2xl transition-all shadow-glow-primary hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-3 disabled:opacity-50 mt-10 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? <ShieldCheck className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                  <span className="text-lg">{isLogin ? 'Authenticate' : 'Establish Identity'}</span>
                </>
              )}
            </button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em]">
              <span className="bg-[#0c0c0e] px-6 text-slate-600 font-black">Secure Gateways</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleGoogleSignIn}
              className="flex items-center justify-center space-x-3 bg-white/[0.03] hover:bg-white/[0.07] text-white font-bold py-4 rounded-2xl border border-white/10 transition-all group hover:scale-[1.02]"
            >
              <Chrome className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
              <span>Google</span>
            </button>
            <button
              onClick={handleGithubSignIn}
              className="flex items-center justify-center space-x-3 bg-white/[0.03] hover:bg-white/[0.07] text-white font-bold py-4 rounded-2xl border border-white/10 transition-all group hover:scale-[1.02]"
            >
              <Github className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
              <span>GitHub</span>
            </button>
          </div>
        </motion.div>

        {/* Footer switch */}
        <div className="mt-10 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="group inline-flex items-center space-x-2 text-slate-500 hover:text-white transition-all font-bold py-3 px-6 rounded-2xl hover:bg-white/5"
          >
            <span>{isLogin ? "No identity established?" : "Previously registered?"}</span>
            <span className="text-primary group-hover:shadow-glow-primary transition-all underline decoration-2 underline-offset-4">
              {isLogin ? 'Create One' : 'Log In'}
            </span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
    </motion.div>
    </div>
  );
};

export default Auth;