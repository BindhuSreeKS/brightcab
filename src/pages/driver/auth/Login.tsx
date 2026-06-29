import React, { useState } from 'react';
import { 
  Phone, 
  ArrowRight, 
  Lock, 
  Smartphone, 
  MapPin, 
  ShieldCheck,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Input, Badge } from '../../../components/ui';
import { useNavigate, Link } from 'react-router-dom';
import { driverAuthApi, TokenStore } from '../../../lib/api';
import toast from 'react-hot-toast';
import logo from '../../../logo.png';

export default function DriverLogin() {
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // 6 digits as per backend mock
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }
    setLoading(true);
    try {
      await driverAuthApi.login(phoneNumber);
      setStep('OTP');
      toast.success('OTP sent successfully');
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length < 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const res = await driverAuthApi.verifyOtp(phoneNumber, otpString);
      TokenStore.setTokens(res.data.accessToken, res.data.refreshToken);
      TokenStore.setDriver(res.data.driver);
      toast.success('Welcome back!');
      navigate('/driver');
    } catch (err: any) {
      toast.error(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full -mr-48 -mt-48 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/5 rounded-full -ml-48 -mb-48 blur-3xl" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-8 relative z-10"
      >
        <div className="text-center space-y-2">
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
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Vazraa mobility</h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Driver Partner Portal</p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'PHONE' ? (
            <motion.form 
              key="phone"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handlePhoneSubmit}
              className="space-y-6 bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-800"
            >
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Mobile Number</label>
                  <div className="relative group">
                     <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">+91</span>
                     <input 
                        type="tel" 
                        required
                        placeholder="00000 00000"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl py-4 pl-14 pr-6 font-bold text-lg transition-all focus:ring-0 text-slate-900 dark:text-white"
                     />
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full py-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xl shadow-xl shadow-indigo-100 dark:shadow-none border-none transition-all active:scale-95 group"
              >
                {loading ? 'SENDING...' : 'PROCEED'}
                {!loading && <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />}
              </Button>

              <p className="text-center text-[10px] text-slate-400 font-medium px-4">
                By continuing, you agree to our <span className="text-indigo-600 font-bold">Terms of Service</span> and <span className="text-indigo-600 font-bold">Privacy Policy</span>.
              </p>
            </motion.form>
          ) : (
            <motion.form 
              key="otp"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleOtpSubmit}
              className="space-y-6 bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-800"
            >
              <div className="text-center space-y-2 mb-8">
                 <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
                    < स्मार्टफोन className="w-6 h-6" />
                 </div>
                 <h2 className="text-xl font-black text-slate-900 dark:text-white">Verify Number</h2>
                 <p className="text-xs font-medium text-slate-500">Sent to +91 {phoneNumber}</p>
                 <Button variant="ghost" onClick={() => setStep('PHONE')} className="text-xs text-indigo-600 font-bold h-auto p-0">Change Number</Button>
              </div>

               <div className="flex justify-between gap-2">
                  {otp.map((digit, i) => (
                     <input 
                       key={i}
                       type="text"
                       maxLength={1}
                       value={digit}
                       onChange={(e) => {
                         const val = e.target.value.replace(/[^0-9]/g, '');
                         const newOtp = [...otp];
                         newOtp[i] = val;
                         setOtp(newOtp);
                         if (val && i < 5) (e.target.nextElementSibling as HTMLInputElement)?.focus();
                       }}
                       onKeyDown={(e) => {
                         if (e.key === 'Backspace' && !otp[i] && i > 0) {
                            (e.currentTarget.previousElementSibling as HTMLInputElement)?.focus();
                         }
                       }}
                       className="w-full aspect-square bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-center text-2xl font-black transition-all focus:ring-0 text-slate-900 dark:text-white"
                     />
                  ))}
               </div>

              <div className="text-center">
                 <p className="text-xs text-slate-500 font-medium">Don't receive code?</p>
                 <Button variant="ghost" className="text-xs text-indigo-600 font-black h-auto p-0 mt-1 uppercase tracking-widest">Resend OTP in 30s</Button>
              </div>

               <Button 
                type="submit" 
                disabled={loading}
                className="w-full py-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xl shadow-xl shadow-indigo-100 dark:shadow-none border-none transition-all active:scale-95"
              >
                {loading ? 'VERIFYING...' : 'VERIFY & START'}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-400">
           <Link to="/driver/register" className="hover:text-indigo-500 transition-colors">Become a Partner</Link>
           <span className="w-1 h-1 rounded-full bg-slate-200" />
           <Link to="/login" className="hover:text-indigo-500 transition-colors">Admin Login</Link>
        </div>
      </motion.div>

      {/* Footer Info */}
      <footer className="absolute bottom-10 inset-x-0 text-center space-y-4">
         <div className="flex items-center justify-center gap-8 text-slate-300 dark:text-slate-800">
            <ShieldCheck className="w-8 h-8" />
            < स्मार्टफोन className="w-8 h-8" />
            <MapPin className="w-8 h-8" />
         </div>
         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] opacity-50 px-12">
            Enterprise Grade Security & Real-Time Tracking Enabled
         </p>
      </footer>
    </div>
  );
}

function स्मार्टफोन(props: any) {
  return <Smartphone {...props} />;
}
