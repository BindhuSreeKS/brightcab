import React, { useState } from 'react';
import { 
  Phone, 
  Lock, 
  ArrowRight, 
  Github, 
  Chrome,
  ShieldCheck,
  Zap,
  ChevronLeft
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Input, Badge } from '../../../components/ui';

import { customerAuthApi, TokenStore } from '../../../lib/api';
import { toast } from 'react-hot-toast';

export default function CustomerLogin() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await customerAuthApi.login(phone);
      toast.success('OTP sent successfully');
      setStep(2);
    } catch (err: any) {
      toast.error(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await customerAuthApi.verifyOtp(phone, otp);
      TokenStore.setTokens(res.data.accessToken, res.data.refreshToken);
      TokenStore.setCustomer(res.data.customer);
      toast.success('Welcome to Vazraa mobility!');
      navigate('/customer');
    } catch (err: any) {
      toast.error(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col p-8 relative overflow-hidden">
      
      {/* Background Ornaments */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/5 rounded-full -ml-48 -mb-48 blur-3xl" />

      {/* Header */}
      <div className="relative z-10 mb-12">
         <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => step === 2 ? setStep(1) : navigate('/')}
            className="rounded-2xl -ml-2 mb-6"
          >
            <ChevronLeft className="w-6 h-6" />
         </Button>
         <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">
            {step === 1 ? (
              <>Welcome back <br/> <span className="text-indigo-600 italic">Traveler.</span></>
            ) : (
              <>Verify <br/> <span className="text-indigo-600 italic">Identity.</span></>
            )}
         </h1>
         <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-4">
            {step === 1 ? 'Login to your account to book a ride' : `Enter the 6-digit code sent to +91 ${phone}`}
         </p>
      </div>

      {/* Form */}
      <form onSubmit={step === 1 ? handleSendOtp : handleVerifyOtp} className="relative z-10 space-y-8">
         <div className="space-y-6">
            {step === 1 ? (
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 italic">Phone Number</label>
                  <div className="relative group">
                     <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm tracking-widest group-focus-within:text-indigo-500 transition-colors">+91</div>
                     <input 
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="98765 43210"
                        className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-800 rounded-[2rem] py-5 pl-16 pr-6 font-black text-lg tracking-tight text-slate-900 dark:text-white transition-all focus:border-indigo-500 outline-none focus:bg-white shadow-sm"
                        required
                     />
                  </div>
               </div>
            ) : (
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 italic">One-Time Password</label>
                  <div className="relative group">
                     <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                        <Lock className="w-5 h-5" />
                     </div>
                     <input 
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="123456"
                        maxLength={6}
                        className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-800 rounded-[2rem] py-5 px-16 font-black text-2xl tracking-[0.5em] text-slate-900 dark:text-white transition-all focus:border-indigo-500 outline-none focus:bg-white shadow-sm"
                        required
                        autoFocus
                     />
                  </div>
                  <div className="text-right px-2">
                     <button type="button" onClick={handleSendOtp} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Resend OTP</button>
                  </div>
               </div>
            )}
         </div>

         <Button 
            type="submit"
            disabled={loading}
            className="w-full py-8 rounded-[2rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xl shadow-2xl shadow-indigo-200 dark:shadow-none border-none transition-all active:scale-95 group"
         >
            {loading ? (
               <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
            ) : (
               <>
                  {step === 1 ? 'GET OTP' : 'VERIFY & LOGIN'}
                  <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
               </>
            )}
         </Button>
      </form>

      {/* Social Login */}
      {step === 1 && (
        <div className="relative z-10 mt-12 space-y-8">
           <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                 <div className="w-full border-t-2 border-slate-50 dark:border-slate-900"></div>
              </div>
              <span className="relative px-6 bg-white dark:bg-slate-950 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Or continue with</span>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="py-6 rounded-2xl border-2 border-slate-50 dark:border-slate-900 font-black uppercase text-xs tracking-widest gap-3 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all active:scale-95">
                 <Chrome className="w-5 h-5" />
                 Google
              </Button>
              <Button variant="outline" className="py-6 rounded-2xl border-2 border-slate-50 dark:border-slate-900 font-black uppercase text-xs tracking-widest gap-3 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all active:scale-95">
                 <Github className="w-5 h-5" />
                 Apple
              </Button>
           </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto relative z-10 text-center space-y-6 pt-12">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Don't have an account yet? 
            <Link to="/customer/register" className="ml-2 text-indigo-600 hover:underline">Join Now</Link>
         </p>
         <div className="flex items-center justify-center gap-4 text-slate-300 opacity-50 italic">
            <ShieldCheck className="w-5 h-5" />
            <Zap className="w-5 h-5" />
         </div>
      </div>

    </div>
  );
}
