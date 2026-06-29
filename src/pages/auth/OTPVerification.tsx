import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { Button, Card, CardContent } from '../../components/ui';

const OTPVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const navigate = useNavigate();

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto focus next
    if (value !== '' && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 font-bold text-3xl mx-auto mb-6">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Enter Code</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">We've sent a 6-digit code to your email.</p>
        </div>

        <Card className="border-none shadow-2xl bg-white/80 dark:bg-slate-900/80">
          <CardContent className="p-8">
            <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); navigate('/login'); }}>
              <div className="flex justify-between gap-2">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    className="w-12 h-14 text-center text-2xl font-bold bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  />
                ))}
              </div>

              <div className="space-y-4">
                <Button type="submit" className="w-full py-3.5 rounded-xl font-bold">
                  Verify & Continue
                </Button>
                <div className="text-center">
                  <p className="text-sm text-slate-500">Didn't receive the code? <button type="button" className="text-indigo-600 font-bold hover:underline">Resend</button></p>
                </div>
              </div>

              <Link to="/login" className="flex items-center justify-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </Link>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OTPVerification;
