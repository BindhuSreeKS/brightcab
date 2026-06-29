import React from 'react';
import { 
  User, 
  Car, 
  FileText, 
  ShieldCheck, 
  Star, 
  Settings, 
  ChevronRight,
  LogOut,
  Camera,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, Button, Badge } from '../../components/ui';

const STATS = [
  { label: 'Rating', value: '4.95', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
  { label: 'Trips', value: '1,240', icon: Car, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { label: 'Years', value: '2.5', icon: Clock, color: 'text-emerald-500', bg: 'bg-emerald-50' },
];

const DOCUMENTS = [
  { label: 'Driving License', status: 'Verified', statusType: 'success' },
  { label: 'Vehicle registration (RC)', status: 'Verified', statusType: 'success' },
  { label: 'Aadhaar Card', status: 'Verified', statusType: 'success' },
  { label: 'Vehicle Insurance', status: 'Expiring in 5 days', statusType: 'warning' },
  { label: 'PAN Card', status: 'Verified', statusType: 'success' },
];

import { driverProfileApi } from '../../lib/api';
import { TokenStore } from '../../lib/api';

export default function DriverProfile() {
  const [driver, setDriver] = React.useState<any>(TokenStore.getDriver());
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await driverProfileApi.getProfile();
        setDriver(res.data);
        TokenStore.setDriver(res.data);
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const calculateYears = (dateStr: string) => {
    if (!dateStr) return '0.0';
    const start = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    const years = diff / (1000 * 60 * 60 * 24 * 365);
    return years.toFixed(1);
  };

  const STATS = [
    { label: 'Rating', value: driver?.rating || '0.0', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Trips', value: driver?.totalRides || '0', icon: Car, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { label: 'Years', value: calculateYears(driver?.createdAt), icon: Clock, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  ];

  const DOCUMENTS = [
    { label: 'Driving License', status: driver?.verificationStatus === 'APPROVED' ? 'Verified' : 'Pending', statusType: driver?.verificationStatus === 'APPROVED' ? 'success' : 'warning' },
    { label: 'Vehicle registration (RC)', status: driver?.verificationStatus === 'APPROVED' ? 'Verified' : 'Pending', statusType: driver?.verificationStatus === 'APPROVED' ? 'success' : 'warning' },
    { label: 'Aadhaar Card', status: driver?.verificationStatus === 'APPROVED' ? 'Verified' : 'Pending', statusType: driver?.verificationStatus === 'APPROVED' ? 'success' : 'warning' },
  ];

  const handleSignOut = () => {
    TokenStore.clear();
    window.location.href = '/driver/login';
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto lg:max-w-none pb-20">
      
      {/* Profile Header */}
      <div className="text-center space-y-4 pt-4">
        <div className="relative inline-block">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-32 h-32 rounded-[3rem] p-1 bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-2xl"
          >
            <div className="w-full h-full rounded-[2.8rem] bg-white dark:bg-slate-800 flex items-center justify-center text-4xl font-black text-indigo-600 border-4 border-white dark:border-slate-900">
              {driver?.name?.charAt(0) || 'D'}
            </div>
          </motion.div>
          <Button size="icon" className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xl border-none hover:bg-slate-50">
             <Camera className="w-5 h-5" />
          </Button>
        </div>
        
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">{driver?.name || 'Vazraa mobility Driver'}</h2>
          <div className="flex items-center justify-center gap-2 mt-1">
            <Badge className={cn(
              "border-none font-bold",
              driver?.verificationStatus === 'APPROVED' ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
            )}>
              {driver?.verificationStatus === 'APPROVED' ? 'VERIFIED PARTNER' : 'PENDING VERIFICATION'}
            </Badge>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">ID: #{driver?.id?.slice(-6).toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
         {STATS.map((stat, i) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-slate-900 p-4 rounded-[2rem] text-center shadow-sm border border-slate-100 dark:border-slate-800"
            >
               <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2", stat.bg)}>
                  <stat.icon className={cn("w-5 h-5", stat.color)} />
               </div>
               <p className="text-xl font-black text-slate-900 dark:text-white">{stat.value}</p>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            </motion.div>
         ))}
      </div>

      {/* Vehicle Info Card */}
      <Card className="rounded-[2.5rem] border-none shadow-xl bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
        <CardContent className="p-8 relative z-10 flex items-center gap-6">
           <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-[2rem] flex items-center justify-center text-indigo-400">
              <Car className="w-10 h-10" />
           </div>
           <div className="flex-1">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Current Vehicle</p>
              <h3 className="text-2xl font-black">{driver?.vehicleModel || 'No Vehicle Added'}</h3>
              <p className="text-sm font-bold opacity-70">{driver?.vehicleNumber || '---'} • {driver?.vehicleCategory || '---'}</p>
           </div>
           <ChevronRight className="w-6 h-6 opacity-30" />
        </CardContent>
      </Card>

      {/* Sections List */}
      <div className="space-y-4">
        
        {/* Document Verification */}
        <div className="space-y-3">
           <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic px-2">Document Status</h3>
           <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
              {DOCUMENTS.map((doc, i) => (
                 <div key={doc.label} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                       <div className={cn(
                         "w-10 h-10 rounded-xl flex items-center justify-center",
                         doc.statusType === 'success' ? "bg-emerald-50 text-emerald-500" : "bg-amber-50 text-amber-500"
                       )}>
                          <FileText className="w-5 h-5" />
                       </div>
                       <span className="font-bold text-sm text-slate-900 dark:text-white">{doc.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className={cn(
                         "text-[10px] font-black uppercase tracking-widest",
                         doc.statusType === 'success' ? "text-emerald-500" : "text-amber-500"
                       )}>{doc.status}</span>
                       {doc.statusType === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-amber-500" />}
                    </div>
                 </div>
              ))}
           </div>
        </div>

        {/* Action Menu */}
        <div className="space-y-2">
           <Button variant="ghost" className="w-full justify-between p-6 h-auto rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 group shadow-sm">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                    <ShieldCheck className="w-5 h-5" />
                 </div>
                 <span className="font-bold text-slate-900 dark:text-white">Security & Privacy</span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-all group-hover:translate-x-1" />
           </Button>

           <Button variant="ghost" className="w-full justify-between p-6 h-auto rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 group shadow-sm">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                    <Settings className="w-5 h-5" />
                 </div>
                 <span className="font-bold text-slate-900 dark:text-white">App Preferences</span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-all group-hover:translate-x-1" />
           </Button>

           <Button 
            onClick={handleSignOut}
            variant="ghost" 
            className="w-full justify-between p-6 h-auto rounded-[2rem] bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 group hover:bg-red-100 dark:hover:bg-red-900/20 shadow-sm mt-6"
           >
              <div className="flex items-center gap-4 text-red-600">
                 <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center shadow-sm">
                    <LogOut className="w-5 h-5" />
                 </div>
                 <span className="font-bold">Sign Out {driver?.name?.split(' ')[0]}</span>
              </div>
           </Button>
        </div>

      </div>

    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
