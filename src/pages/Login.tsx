import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, LogIn, ArrowRight, User as UserIcon, ShieldCheck, Loader2 } from 'lucide-react';
import { UserRole } from '../types';
import { supabase } from '../lib/supabase';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useStore();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (location.pathname === '/register') {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }
  }, [location.pathname]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    
    if (!isLogin && password !== confirmPassword) {
      setErrorMsg('Passwords do not match!');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        console.log('Attempting sign in for:', email);
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;
        if (data.user) {
          // the auto-router in App.tsx will navigate to /app when user sync is fully done.
          console.log('Login succeeded, waiting for user sync...');
        }
      } else {
        console.log('Attempting sign up for:', email);
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            }
          }
        });

        if (error) {
          if (error.message.includes('User already registered')) {
             throw new Error('Email ini sudah terdaftar. Silakan login.');
          }
          throw error;
        }
        
        if (data.user) {
          if (data.session == null) {
            setSuccessMsg('Pendaftaran berhasil! Silakan periksa email Anda (jika diminta) atau langsung login.');
          } else {
            setSuccessMsg('Pendaftaran berhasil!');
          }
          setIsLogin(true);
        }
      }
    } catch (error: any) {
      console.error('Auth operational error:', error);
      let errMsg = error.error_description || error.message || 'Terjadi kesalahan tidak diketahui';
      if (errMsg.toLowerCase().includes('invalid login credentials')) {
        errMsg = 'Email atau password salah! (Atau akun belum dikonfirmasi jika sistem meminta verifikasi email)';
      }
      setErrorMsg('Gagal: ' + errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative py-32 overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl aspect-square bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />
      
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <GlassCard className="p-8 md:p-10 shadow-[0_40px_80px_rgba(0,0,0,0.5)] border-white/10">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-3 tracking-tighter">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-gray-400 text-sm leading-relaxed">
              {isLogin 
                ? 'Ready to hit the road? Step into the glass-smooth future of rental.' 
                : 'Join the community and start your premium journey today.'}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium text-center">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm font-medium text-center">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500 ml-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                      type="text" 
                      required={!isLogin}
                      className="w-full glass-panel border-white/5 pl-12 pr-4 py-3.5 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all placeholder:text-gray-600"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="email" 
                  required 
                  className="w-full glass-panel border-white/5 pl-12 pr-4 py-3.5 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all placeholder:text-gray-600"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="password" 
                    required 
                    className="w-full glass-panel border-white/5 pl-12 pr-4 py-3.5 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all placeholder:text-gray-600"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {!isLogin && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2"
                >
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500 ml-1">Confirm Password</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                      type="password" 
                      required={!isLogin}
                      className="w-full glass-panel border-white/5 pl-12 pr-4 py-3.5 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all placeholder:text-gray-600"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </motion.div>
              )}
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full py-4 rounded-2xl text-lg font-bold shadow-lg shadow-cyan-500/20" disabled={loading}>
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : isLogin ? (
                  <>Sign In <LogIn size={20} className="ml-2" /></>
                ) : (
                  <>Create Account <ArrowRight size={20} className="ml-2" /></>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5">
             <Button 
               variant="ghost" 
               className="w-full text-sm hover:text-cyan-400"
               onClick={() => setIsLogin(!isLogin)}
             >
               {isLogin ? "Don't have an account? Join Now" : "Already have an account? Sign In"}
             </Button>
          </div>
          
          <div className="mt-6 text-center text-[10px] text-gray-600 uppercase tracking-widest leading-loose">
            Hint: enter any email/pass. <br /> Use 'admin' in email for admin role.
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
