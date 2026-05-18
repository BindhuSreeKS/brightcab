import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { Button, Card, CardContent } from '../../components/ui';

const ForgotPassword = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Reset Password</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Enter your email and we'll send you an OTP code.</p>
        </div>

        <Card className="border-none shadow-2xl backdrop-blur-sm bg-white/80 dark:bg-slate-900/80">
          <CardContent className="p-8">
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); window.location.href = '/verify-otp'; }}>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="email" 
                    placeholder="admin@cabecho.com" 
                    required
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full py-3.5 rounded-xl font-bold">
                Send Reset Code
              </Button>

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

export default ForgotPassword;
