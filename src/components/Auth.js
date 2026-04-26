import React, { useState } from 'react';
import { auth, googleProvider, githubProvider } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Sparkles, AlertCircle, ChevronRight, ShieldCheck, Github, Chrome, CheckCircle } from 'lucide-react';

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
        {/* Header Section */}
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
            {isLogin ? 'Welcome back.' : 'Join the flow.'}
          </h1>
          <p className="text-slate-400 text-base md:text-lg font-medium leading-relaxed max-w-sm mx-auto">
            {isLogin 
              ? 'Sign in to access your snippets across all devices.' 
              : 'Create your account to start managing code fragments.'}
          </p>
        </div>

        {/* Auth Card */}
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
                className="overflow-hidden"
              >
                <div className="flex items-start space-x-3 bg-red-500/10 border border-red-500/20 text-red-400 px-5 py-4 rounded-2xl mb-8 text-sm font-bold">
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
                <div className="flex items-start space-x-3 bg-secondary/10 border border-secondary/20 text-secondary px-5 py-4 rounded-2xl mb-8 text-sm font-bold">
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
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-2"
                >
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g. Elon Musk"
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-white/20 focus:bg-white/[0.08] transition-all placeholder:text-slate-600 font-bold text-base"
                    required={!isLogin}
                  />
                </motion.div>
              )}
            </AnimatePresence>

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
              <div className="flex items-center justify-between ml-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Password</label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[10px] font-black text-secondary hover:underline tracking-widest"
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
                  {isLogin ? <ShieldCheck className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                </>
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em]">
              <span className="bg-[#0c0c0e] px-4 text-slate-600 font-bold">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleGoogleSignIn}
              className="flex items-center justify-center space-x-3 bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-2xl border border-white/10 transition-all active:scale-95"
            >
              <Chrome className="w-5 h-5 text-slate-400" />
              <span>Google</span>
            </button>
            <button
              onClick={handleGithubSignIn}
              className="flex items-center justify-center space-x-3 bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-2xl border border-white/10 transition-all active:scale-95"
            >
              <Github className="w-5 h-5 text-slate-400" />
              <span>GitHub</span>
            </button>
          </div>
        </motion.div>

        {/* Footer switch */}
        <div className="mt-8 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="group inline-flex items-center space-x-2 text-slate-500 hover:text-white transition-all font-bold py-3 px-6 rounded-2xl hover:bg-white/5"
          >
            <span>{isLogin ? "New to CodeSnippets?" : "Already have an account?"}</span>
            <span className="text-secondary group-hover:underline underline-offset-4">
              {isLogin ? 'Sign Up' : 'Sign In'}
            </span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const Loader2 = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
);

export default Auth;