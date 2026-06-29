import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ArrowRight, 
  ShieldCheck,
  RefreshCw,
  Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui';

export default function CustomerOTP() {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(30);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Auto focus next
      if (value && index < 3) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col p-8 relative overflow-hidden">
      
      {/* Header */}
      <div className="relative z-10 mb-12">
         <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="rounded-2xl -ml-2 mb-6"
          >
            <ChevronLeft className="w-6 h-6" />
         </Button>
         <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">
            Verify <br/> <span className="text-indigo-600 italic">Identity.</span>
         </h1>
         <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-4 italic">Enter 4-digit code sent to your phone</p>
      </div>

      {/* OTP Inputs */}
      <div className="relative z-10 flex justify-between gap-4 mb-12">
         {otp.map((digit, i) => (
           <input 
             key={i}
             id={`otp-${i}`}
             type="number"
             value={digit}
             onChange={(e) => handleChange(i, e.target.value)}
             className="w-full aspect-square bg-slate-50 dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-800 rounded-3xl text-center font-black text-3xl text-slate-900 dark:text-white transition-all focus:border-indigo-500 outline-none focus:bg-white shadow-sm"
           />
         ))}
      </div>

      {/* Resend */}
      <div className="relative z-10 text-center space-y-8">
         <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Didn't receive code?</p>
            <button 
               disabled={timer > 0}
               className={`mt-2 font-black text-sm uppercase tracking-tighter italic flex items-center justify-center gap-2 mx-auto ${timer > 0 ? 'text-slate-300' : 'text-indigo-600'}`}
            >
               <RefreshCw className={`w-4 h-4 ${timer > 0 ? '' : 'animate-spin-slow'}`} />
               Resend {timer > 0 ? `in ${timer}s` : 'Now'}
            </button>
         </div>

         <Button 
            onClick={() => navigate('/customer')}
            className="w-full py-8 rounded-[2rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xl shadow-2xl shadow-indigo-200 dark:shadow-none border-none transition-all active:scale-95 group"
         >
            VERIFY & START
            <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
         </Button>

         <div className="flex items-center justify-center gap-4 text-slate-300 opacity-50 italic pt-12">
            <Lock className="w-5 h-5" />
            <ShieldCheck className="w-5 h-5" />
         </div>
      </div>

    </div>
  );
}
