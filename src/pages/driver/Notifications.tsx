import React from 'react';
import { 
  Bell, 
  MapPin, 
  DollarSign, 
  Star, 
  MessageCircle, 
  AlertTriangle,
  Zap,
  Info,
  Car,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button, Badge, Card, CardContent } from '../../components/ui';

const NOTIFICATIONS = [
  {
    id: 1,
    type: 'RIDE_COMPLETED',
    title: 'Trip Completed Successfully',
    message: 'You earned ₹420.50 from your last ride with Prateek Grover.',
    time: '2 mins ago',
    icon: Car,
    color: 'bg-emerald-100 text-emerald-600',
    unread: true
  },
  {
    id: 2,
    type: 'INCENTIVE',
    title: 'Bonus Incentive Earned! 🎉',
    message: 'Congratulations! You reached your 10-trip milestone and earned a bonus of ₹500.',
    time: '1 hour ago',
    icon: Star,
    color: 'bg-amber-100 text-amber-600',
    unread: true
  },
  {
    id: 3,
    type: 'SURGE_ALERT',
    title: 'High Demand Nearby',
    message: 'BKC area is experiencing high demand. Navigate now to earn up to 1.5x.',
    time: '3 hours ago',
    icon: Zap,
    color: 'bg-indigo-100 text-indigo-600',
    unread: false
  },
  {
    id: 4,
    type: 'SYSTEM',
    title: 'New Feature Available',
    message: 'You can now share your live location with your emergency contacts.',
    time: '5 hours ago',
    icon: Info,
    color: 'bg-slate-100 text-slate-600',
    unread: false
  },
  {
    id: 5,
    type: 'SAFETY',
    title: 'Safety Tip of the Day',
    message: 'Always confirm the riders name before starting the trip for better safety.',
    time: '1 day ago',
    icon: AlertTriangle,
    color: 'bg-red-100 text-red-600',
    unread: false
  }
];

export default function DriverNotifications() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto lg:max-w-none pb-8">
      
      {/* Header */}
      <div className="flex items-center justify-between px-2 pt-4">
         <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Inbox</h2>
         <Button variant="ghost" className="text-indigo-600 font-bold">Mark all read</Button>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
         {(['All', 'Payments', 'System', 'Safety'] as const).map((cat) => (
            <Button 
              key={cat}
              className={cn(
                "rounded-full px-6 py-2 h-auto text-xs font-black uppercase tracking-widest border-none whitespace-nowrap",
                cat === 'All' ? "bg-indigo-600 text-white shadow-lg" : "bg-white dark:bg-slate-900 text-slate-500 shadow-sm"
              )}
            >
              {cat}
            </Button>
         ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {NOTIFICATIONS.map((notif, i) => (
           <motion.div 
              key={notif.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-start gap-4 group cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800/80",
                notif.unread && "border-indigo-100 ring-2 ring-indigo-500/5"
              )}
           >
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform",
                notif.color
              )}>
                 <notif.icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                 <div className="flex items-center justify-between mb-1">
                    <h4 className={cn("text-sm font-black truncate", notif.unread ? "text-slate-900 dark:text-white" : "text-slate-500")}>
                      {notif.title}
                    </h4>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap ml-2">{notif.time}</span>
                 </div>
                 <p className={cn("text-xs leading-relaxed", notif.unread ? "text-slate-600 dark:text-slate-300 font-medium" : "text-slate-400")}>
                    {notif.message}
                 </p>
                 {notif.unread && (
                   <div className="mt-3 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">New message</span>
                   </div>
                 )}
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 self-center group-hover:text-indigo-400 transition-all group-hover:translate-x-1" />
           </motion.div>
        ))}
      </div>

    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
