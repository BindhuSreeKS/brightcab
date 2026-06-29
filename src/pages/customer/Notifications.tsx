import React from 'react';
import { 
  Bell, 
  Car, 
  Star, 
  Gift, 
  Zap, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  MoreVertical,
  Navigation2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button, Card, Badge } from '../../components/ui';

const NOTIFICATIONS = [
  { 
    id: 1, 
    type: 'RIDE', 
    title: 'Ride Completed', 
    desc: 'Your trip to Terminal 1 has ended. Rate your experience with Rohit Verma.', 
    time: '2 mins ago', 
    read: false,
    icon: Navigation2,
    color: 'indigo'
  },
  { 
    id: 2, 
    type: 'PROMO', 
    title: 'Weekend Special: 50% Cashback!', 
    desc: 'Use code WEEKEND50 on your next 3 rides. Valid till Sunday midnight.', 
    time: '1 hour ago', 
    read: false,
    icon: Gift,
    color: 'emerald'
  },
  { 
    id: 3, 
    type: 'SYSTEM', 
    title: 'Security Alert: New Login', 
    desc: 'A new login from a Chrome browser on Windows was detected on your account.', 
    time: '3 hours ago', 
    read: true,
    icon: AlertCircle,
    color: 'rose'
  },
  { 
    id: 4, 
    type: 'WALLET', 
    title: 'Wallet Recharged Successfully', 
    desc: '₹1,000 has been added to your Vazraa mobility wallet via UPI.', 
    time: 'Yesterday', 
    read: true,
    icon: CheckCircle2,
    color: 'amber'
  }
];

export default function CustomerNotifications() {
  return (
    <div className="p-6 space-y-8 pb-10">
      
      {/* Header */}
      <div className="flex items-center justify-between">
         <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Alerts</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Stay updated with latest activity</p>
         </div>
         <Button variant="ghost" size="icon" className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
            <MoreVertical className="w-5 h-5 text-slate-400" />
         </Button>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
         {NOTIFICATIONS.map((notif, i) => (
           <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: i * 0.1 }}
             key={notif.id}
             className={`relative p-6 rounded-[2.5rem] border transition-all cursor-pointer group hover:scale-[1.02] active:scale-95 ${notif.read ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm' : 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/20 shadow-lg shadow-indigo-100/50 dark:shadow-none'}`}
           >
              {/* Unread Indicator */}
              {!notif.read && (
                 <div className="absolute top-6 right-6 w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
              )}
              
              <div className="flex gap-4">
                 <div className={`w-14 h-14 bg-${notif.color}-100 dark:bg-${notif.color}-900/20 text-${notif.color}-600 rounded-[1.25rem] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <notif.icon className="w-7 h-7" />
                 </div>
                 <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                       <Badge variant="outline" className={`p-0 font-black text-[9px] tracking-widest uppercase text-${notif.color}-500 opacity-60`}>{notif.type}</Badge>
                       <span className="text-[10px] font-bold text-slate-300">•</span>
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{notif.time}</span>
                    </div>
                    <h3 className={`font-black text-sm uppercase tracking-tight italic transition-colors ${notif.read ? 'text-slate-900 dark:text-white' : 'text-indigo-600 dark:text-indigo-400'}`}>
                       {notif.title}
                    </h3>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-2 leading-relaxed tracking-tight">
                       {notif.desc}
                    </p>
                    
                    {!notif.read && notif.type === 'RIDE' && (
                       <div className="mt-4 flex gap-2">
                          <Button className="flex-1 py-4 rounded-xl bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] h-auto border-none">Rate Ride</Button>
                          <Button variant="outline" className="flex-1 py-4 rounded-xl border-2 font-black uppercase tracking-widest text-[10px] h-auto">Refuse</Button>
                       </div>
                    )}
                 </div>
              </div>

              {/* Timestamp Footer Mobile Display only if needed */}
              <div className="absolute bottom-6 right-8 opacity-5 group-hover:opacity-10 transition-opacity">
                 <notif.icon className="w-16 h-16" />
              </div>
           </motion.div>
         ))}
      </div>

      {NOTIFICATIONS.length > 0 && (
         <Button variant="ghost" className="w-full py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-indigo-600 transition-colors">Mark All as Read</Button>
      )}

      {NOTIFICATIONS.length === 0 && (
         <div className="text-center py-20 flex flex-col items-center gap-6">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-[2.5rem] flex items-center justify-center text-slate-300">
               <Bell className="w-10 h-10" />
            </div>
            <div>
               <h3 className="text-xl font-black uppercase tracking-tighter italic text-slate-400">All Quiet Here</h3>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">No new updates for now</p>
            </div>
         </div>
      )}
    </div>
  );
}
