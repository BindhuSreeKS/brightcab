import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ShieldCheck, User, AlertCircle, Loader2 } from 'lucide-react';
import { Button, Card, CardContent } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../logo.png';

const Login = () => {
  const [role, setRole] = useState<'ADMIN' | 'SUPER_ADMIN'>('ADMIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  // Auto-fill credentials based on role switcher
  const handleRoleSwitch = (r: 'ADMIN' | 'SUPER_ADMIN') => {
    setRole(r);
    setError('');
    if (r === 'SUPER_ADMIN') {
      setEmail('superadmin@vazraamobility.com');
      setPassword('SuperAdmin@123');
    } else {
      setEmail('admin@vazraamobility.com');
      setPassword('Admin@123');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      if (role === 'ADMIN') navigate('/admin');
      else navigate('/super-admin');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center">
          <div className="relative group mx-auto mb-8 w-[230px] hover:scale-105 transition-transform duration-500">
            {/* Ambient Pulse Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur-lg opacity-60 group-hover:opacity-90 transition duration-500"></div>
            
            {/* Inner Glassmorphism Container with Gradient Border */}
            <div className="relative h-14 w-[230px] bg-white/95 backdrop-blur-xl rounded-2xl p-[1.5px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-2xl">
              <div className="w-full h-full bg-white rounded-[14px] overflow-hidden flex items-center justify-center p-1.5">
                <img src={logo} alt="Vazraa mobility" className="w-full h-full object-contain" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Welcome Back</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Log in to manage your Vazraa mobility ecosystem</p>
        </div>

        <Card className="border-none shadow-2xl shadow-indigo-500/5 backdrop-blur-sm bg-white/80 dark:bg-slate-900/80">
          <CardContent className="p-8">
            {/* Role Switcher */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-8">
              <button
                onClick={() => handleRoleSwitch('ADMIN')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${role === 'ADMIN' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <User className="w-4 h-4" /> Admin
              </button>
              <button
                onClick={() => handleRoleSwitch('SUPER_ADMIN')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${role === 'SUPER_ADMIN' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <ShieldCheck className="w-4 h-4" /> Super Admin
              </button>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="flex items-center gap-3 p-4 mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    placeholder="admin@vazraamobility.com"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Password</label>
                  <Link to="/forgot-password" className="text-xs font-bold text-indigo-600 hover:underline">Forgot password?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl font-bold text-base shadow-xl shadow-indigo-600/20 group">
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Signing in...</>
                ) : (
                  <>Sign In <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" /></>
                )}
              </Button>
            </form>

            {/* Quick credentials hint */}
            <div className="mt-6 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
              <p className="text-xs text-indigo-700 dark:text-indigo-400 font-medium text-center">
                💡 Switch role above to auto-fill test credentials
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          Need access? <span className="text-indigo-600 font-bold hover:underline cursor-pointer">Contact System Administrator</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
