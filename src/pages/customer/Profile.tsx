import React from 'react';
import { 
  Camera, 
  MapPin, 
  Star, 
  Gift, 
  Shield, 
  Smartphone, 
  Settings, 
  ChevronRight, 
  Headphones as HeadphonesIcon, 
  Bell, 
  LogOut 
} from 'lucide-react';
import { Button, Badge } from '../../components/ui';
import { TokenStore } from '../../lib/api';
import { useNavigate } from 'react-router-dom';

export default function CustomerProfile() {
  const navigate = useNavigate();
  const customer = TokenStore.getCustomer();

  const handleLogout = () => {
    TokenStore.clear();
    navigate('/customer/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col pt-8 pb-10">
      
      {/* Profile Header */}
      <div className="px-6 flex flex-col items-center text-center space-y-4 mb-8">
         <div className="relative group">
            <div className="w-32 h-32 rounded-[3.5rem] bg-indigo-600 flex items-center justify-center text-white text-5xl font-black italic shadow-2xl shadow-indigo-200/50 dark:shadow-none border-4 border-white dark:border-slate-900">
               {customer?.name?.charAt(0) || 'C'}
            </div>
            <button className="absolute bottom-1 right-1 w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-lg hover:bg-indigo-700 transition-all active:scale-95">
               <Camera className="w-5 h-5" />
            </button>
         </div>
         <div>
            <div className="flex items-center justify-center gap-2">
               <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">
                  {customer?.name || 'Customer'}
               </h1>
               <Badge className="bg-amber-100 text-amber-600 border-none font-black text-[10px] py-1 px-2.5 rounded-full">PRO</Badge>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">
               {customer?.phone} • {customer?.email}
            </p>
         </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 px-6 mb-8">
         {[
            { label: 'Rides', val: customer?.totalRides || '0', icon: MapPin, color: 'text-indigo-500' },
            { label: 'Rating', val: customer?.rating?.toFixed(1) || '5.0', icon: Star, color: 'text-amber-500' },
            { label: 'Wallet', val: '₹' + (customer?.walletBalance?.toFixed(0) || '0'), icon: Gift, color: 'text-emerald-500' }
         ].map((stat) => (
            <div key={stat.label} className="p-4 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center gap-2 shadow-sm">
               <stat.icon className={`w-5 h-5 ${stat.color}`} />
               <div>
                  <p className="text-lg font-black italic tracking-tighter text-slate-900 dark:text-white leading-none">{stat.val}</p>
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-1">{stat.label}</p>
               </div>
            </div>
         ))}
      </div>

      {/* Profile Sections */}
      <div className="px-6 space-y-8">
         <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-2 italic">Account Controls</h3>
            <div className="space-y-3">
               {[
                  { label: 'Saved Addresses', icon: MapPin, desc: 'Manage your home and work' },
                  { label: 'Safety Center', icon: Shield, desc: 'Emergency contacts & tracking' },
                  { label: 'Privacy Settings', icon: Smartphone, desc: 'Data control and visibility' },
                  { label: 'Preferences', icon: Settings, desc: 'Language, theme, notifications' }
               ].map((item) => (
                  <button key={item.label} className="w-full p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-indigo-500 transition-all active:scale-95">
                     <div className="flex items-center gap-4 text-left">
                        <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                           <item.icon className="w-6 h-6" />
                        </div>
                        <div>
                           <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm italic">{item.label}</h4>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{item.desc}</p>
                        </div>
                     </div>
                     <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
                  </button>
               ))}
            </div>
         </div>

         <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-2 italic">Support & Legal</h3>
            <div className="space-y-3">
               {[
                  { label: 'Help & Support', icon: HeadphonesIcon },
                  { label: 'About Vazraa mobility', icon: Bell }
               ].map((item) => (
                  <button key={item.label} className="w-full p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between group transition-all active:scale-95">
                     <div className="flex items-center gap-4 text-left">
                        <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                           <item.icon className="w-6 h-6" />
                        </div>
                        <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm italic">{item.label}</h4>
                     </div>
                     <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
                  </button>
               ))}
            </div>
         </div>

         <Button 
            onClick={handleLogout}
            variant="ghost" 
            className="w-full py-8 text-red-500 font-black uppercase tracking-[0.2em] rounded-3xl border-2 border-red-50 dark:border-red-900/10 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all group"
         >
            <LogOut className="w-6 h-6 mr-3 group-hover:-translate-x-1 transition-transform" />
            Sign Out Account
         </Button>
         
         <div className="text-center pb-8 opacity-40">
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Vazraa mobility v4.2.0 • Build 90210</p>
         </div>
      </div>

    </div>
  );
}
