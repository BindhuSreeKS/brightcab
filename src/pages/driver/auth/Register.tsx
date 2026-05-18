import React, { useState } from 'react';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Camera, 
  Car, 
  FileText, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Input, Badge } from '../../../components/ui';
import { useNavigate, Link } from 'react-router-dom';
import { driverAuthApi, TokenStore } from '../../../lib/api';
import toast from 'react-hot-toast';
import { VehicleCategory } from '../../../types';

const STEPS = [
  { id: 1, title: 'Personal Info', icon: User },
  { id: 2, title: 'Documents', icon: FileText },
  { id: 3, title: 'Vehicle Details', icon: Car },
];

export default function DriverRegister() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: 'password123', // Default for now or add a field
    aadhaarNumber: '',
    licenseNumber: '',
    vehicleNumber: '',
    vehicleModel: '',
    vehicleCategory: 'SEDAN' as VehicleCategory,
    // File URLs (mocked for demo)
    profilePhoto: '',
    aadhaarFront: '',
    aadhaarBack: '',
    licenseImage: '',
    rcImage: '',
    vehicleFront: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileUpload = (field: string, file: File | null) => {
    if (file) {
      // In a real app, you'd upload this to a server
      // For demo, we'll create a local URL
      const url = URL.createObjectURL(file);
      setFormData({ ...formData, [field]: url });
    }
  };

  const handleNext = async () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
    else {
      setLoading(true);
      try {
        const res = await driverAuthApi.register(formData);
        TokenStore.setTokens(res.data.accessToken, res.data.refreshToken);
        TokenStore.setDriver(res.data.driver);
        toast.success('Registration successful! Welcome to the fleet.');
        navigate('/driver');
      } catch (err: any) {
        toast.error(err.message || 'Registration failed');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col p-6">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col py-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
           <Button variant="ghost" size="icon" onClick={() => currentStep === 1 ? navigate('/driver/login') : handleBack()} className="rounded-2xl">
              <ChevronLeft className="w-6 h-6" />
           </Button>
           <h1 className="text-xl font-black uppercase tracking-tighter italic">Join Partner Fleet</h1>
           <div className="w-10 h-10" />
        </div>

        {/* Progress Bar */}
        <div className="relative mb-12 px-4">
           <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-100 dark:bg-slate-800 -translate-y-1/2 z-0" />
           <div 
              className="absolute top-1/2 left-4 h-0.5 bg-indigo-500 -translate-y-1/2 z-10 transition-all duration-500" 
              style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
           />
           <div className="flex justify-between relative z-20">
              {STEPS.map((step) => (
                 <div key={step.id} className="flex flex-col items-center gap-2">
                    <div className={cn(
                      "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500",
                      currentStep >= step.id ? "bg-indigo-600 text-white shadow-lg" : "bg-white dark:bg-slate-900 text-slate-300 border border-slate-100 dark:border-slate-800"
                    )}>
                       <step.icon className="w-5 h-5" />
                    </div>
                 </div>
              ))}
           </div>
        </div>

        <motion.div 
           key={currentStep}
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           exit={{ opacity: 0, x: -20 }}
           className="flex-1 space-y-8"
        >
           {currentStep === 1 && (
              <div className="space-y-6">
                 <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Personal Info</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Basic details for identification</p>
                 </div>
                 
                 <div className="space-y-4">
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                        <input 
                          type="text" 
                          required
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                          placeholder="Enter your full name"
                          className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-indigo-500 rounded-2xl py-4 px-6 font-bold transition-all focus:ring-0 text-slate-900 dark:text-white"
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Phone Number</label>
                        <input 
                          type="tel" 
                          required
                          value={formData.phone}
                          onChange={e => setFormData({...formData, phone: e.target.value})}
                          placeholder="Enter your mobile number"
                          className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-indigo-500 rounded-2xl py-4 px-6 font-bold transition-all focus:ring-0 text-slate-900 dark:text-white"
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                        <input 
                          type="email" 
                          required
                          value={formData.email}
                          onChange={e => setFormData({...formData, email: e.target.value})}
                          placeholder="your@email.com"
                          className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-indigo-500 rounded-2xl py-4 px-6 font-bold transition-all focus:ring-0 text-slate-900 dark:text-white"
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Password</label>
                        <input 
                          type="password" 
                          required
                          value={formData.password}
                          onChange={e => setFormData({...formData, password: e.target.value})}
                          placeholder="Create a password"
                          className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-indigo-500 rounded-2xl py-4 px-6 font-bold transition-all focus:ring-0 text-slate-900 dark:text-white"
                        />
                     </div>
                  </div>
               </div>
           )}

           {currentStep === 2 && (
              <div className="space-y-6">
                 <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Identity Details</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Enter your ID numbers</p>
                 </div>
                 
                 <div className="space-y-4">
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Aadhaar Number</label>
                         <input 
                           type="text" 
                           required
                           value={formData.aadhaarNumber}
                           onChange={e => setFormData({...formData, aadhaarNumber: e.target.value})}
                           placeholder="1234 5678 9012"
                           className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-indigo-500 rounded-2xl py-4 px-6 font-bold transition-all focus:ring-0 text-slate-900 dark:text-white"
                         />
                      </div>

                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">DL Number</label>
                         <input 
                           type="text" 
                           required
                           value={formData.licenseNumber}
                           onChange={e => setFormData({...formData, licenseNumber: e.target.value})}
                           placeholder="DL-1234567890123"
                           className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-indigo-500 rounded-2xl py-4 px-6 font-bold transition-all focus:ring-0 text-slate-900 dark:text-white"
                         />
                      </div>
                 </div>
              </div>
           )}

           {currentStep === 3 && (
              <div className="space-y-6">
                 <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Vehicle Info</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Tell us about your cab</p>
                 </div>
                 
                 <div className="space-y-4">
                     <div className="grid grid-cols-2 gap-3">
                        {['HATCHBACK', 'SEDAN', 'SUV', 'LUXURY'].map((type) => (
                           <div 
                              key={type} 
                              onClick={() => setFormData({...formData, vehicleCategory: type as VehicleCategory})}
                              className={cn(
                                "p-6 rounded-[2rem] border-2 flex flex-col items-center gap-3 group cursor-pointer transition-all",
                                formData.vehicleCategory === type ? "bg-indigo-600 border-indigo-600 text-white shadow-lg" : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 hover:border-indigo-500"
                              )}
                           >
                              <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                                formData.vehicleCategory === type ? "bg-white/20 text-white" : "bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-indigo-500"
                              )}>
                                 <Car className="w-6 h-6" />
                              </div>
                              <span className="font-bold text-[10px] uppercase tracking-widest">{type}</span>
                           </div>
                        ))}
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Vehicle Model</label>
                        <input 
                          type="text" 
                          required
                          value={formData.vehicleModel}
                          onChange={e => setFormData({...formData, vehicleModel: e.target.value})}
                          placeholder="e.g. Maruti Swift"
                          className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-indigo-500 rounded-2xl py-4 px-6 font-bold transition-all focus:ring-0 text-slate-900 dark:text-white"
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Vehicle Registration Number</label>
                        <input 
                          type="text" 
                          required
                          value={formData.vehicleNumber}
                          onChange={e => setFormData({...formData, vehicleNumber: e.target.value})}
                          placeholder="MH 01 AB 1234"
                          className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-indigo-500 rounded-2xl py-4 px-6 font-bold transition-all focus:ring-0 text-slate-900 dark:text-white"
                        />
                     </div>
                 </div>
              </div>
           )}
        </motion.div>

        <div className="mt-8 space-y-4">
           <Button 
              onClick={handleNext}
              disabled={loading}
              className="w-full py-8 rounded-[2rem] bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white font-black text-xl shadow-xl transition-all active:scale-95 group border-none"
           >
              {loading ? 'REGISTERING...' : currentStep === 3 ? 'COMPLETE SIGNUP' : 'SAVE & CONTINUE'}
              {!loading && <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />}
           </Button>
           
           <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-8">
              {currentStep === 3 ? 'By finishing, you submit your documents for verification' : 'Step ' + currentStep + ' of 3 • Verification required'}
           </p>
        </div>

      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
