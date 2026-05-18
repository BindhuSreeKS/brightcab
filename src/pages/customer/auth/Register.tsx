import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, User, Mail, Lock, ArrowRight } from 'lucide-react';
import { Button } from '../../../components/ui';
import { customerAuthApi, TokenStore } from '../../../lib/api';
import { toast } from 'react-hot-toast';

export default function CustomerRegister() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await customerAuthApi.register(formData);
      TokenStore.setTokens(res.data.accessToken, res.data.refreshToken);
      TokenStore.setCustomer(res.data.customer);
      toast.success('Welcome to Vazraa mobility!');
      navigate('/customer');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col p-8 relative overflow-hidden">
      
      {/* Header */}
      <div className="relative z-10 mb-8">
         <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/customer/login')}
            className="rounded-2xl -ml-2 mb-6"
          >
            <ChevronLeft className="w-6 h-6" />
         </Button>
         <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">
            Create <br/> <span className="text-indigo-600 italic">Account.</span>
         </h1>
         <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-4">Join the premium Vazraa mobility fleet</p>
      </div>

      {/* Form */}
      <form onSubmit={handleRegister} className="relative z-10 space-y-8 pb-10">
         <div className="space-y-6">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 italic">Full Name</label>
               <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                     <User className="w-5 h-5" />
                  </div>
                  <input 
                     type="text"
                     placeholder="John Doe"
                     value={formData.name}
                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                     className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-800 rounded-[2rem] py-5 px-16 font-black text-lg tracking-tight text-slate-900 dark:text-white transition-all focus:border-indigo-500 outline-none focus:bg-white shadow-sm"
                     required
                  />
               </div>
            </div>



            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 italic">Phone Number</label>
               <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm tracking-widest group-focus-within:text-indigo-500 transition-colors">+91</div>
                  <input 
                     type="tel"
                     placeholder="98765 43210"
                     value={formData.phone}
                     onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                     className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-800 rounded-[2rem] py-5 pl-16 pr-6 font-black text-lg tracking-tight text-slate-900 dark:text-white transition-all focus:border-indigo-500 outline-none focus:bg-white shadow-sm"
                     required
                  />
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 italic">Password</label>
               <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                     <Lock className="w-5 h-5" />
                  </div>
                  <input 
                     type="password"
                     placeholder="••••••••"
                     value={formData.password}
                     onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                     className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-800 rounded-[2rem] py-5 px-16 font-black text-lg tracking-tight text-slate-900 dark:text-white transition-all focus:border-indigo-500 outline-none focus:bg-white shadow-sm"
                     required
                  />
               </div>
            </div>
         </div>

         <div className="space-y-4">
            <Button 
               type="submit"
               disabled={loading}
               className="w-full py-8 rounded-[2rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xl shadow-2xl shadow-indigo-200 dark:shadow-none border-none transition-all active:scale-95 group"
            >
               {loading ? (
                  <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
               ) : (
                  <>
                    CREATE ACCOUNT
                    <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
               )}
            </Button>
            <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest px-8">
               By signing up, you agree to our <span className="text-indigo-600">Terms</span> & <span className="text-indigo-600">Privacy Policy</span>
            </p>
         </div>
      </form>

      {/* Footer */}
      <div className="mt-auto relative z-10 text-center pb-8">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Already have an account? 
            <Link to="/customer/login" className="ml-2 text-indigo-600 hover:underline">Sign In</Link>
         </p>
      </div>

    </div>
  );
}
