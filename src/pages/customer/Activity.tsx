import React, { useState } from 'react';
import { 
  History, 
  MapPin, 
  ChevronRight, 
  Star, 
  Search, 
  Filter, 
  Calendar,
  Clock,
  Download,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button, Card, Badge, Input } from '../../components/ui';

const RIDE_HISTORY = [
  { 
    id: 'TRP9021', 
    date: 'Today, 2:30 PM', 
    status: 'COMPLETED', 
    from: 'Cyber Tower, IT Park', 
    to: 'Green Avenue, Sector 12', 
    price: '₹240', 
    driver: 'Rohit V.', 
    rating: 5 
  },
  { 
    id: 'TRP8812', 
    date: 'Yesterday, 10:15 AM', 
    status: 'COMPLETED', 
    from: 'Star Mall', 
    to: 'Cyber Tower, IT Park', 
    price: '₹180', 
    driver: 'Amit K.', 
    rating: 4.5 
  },
  { 
    id: 'TRP8754', 
    date: '04 May, 06:45 PM', 
    status: 'CANCELLED', 
    from: 'Terminal 1, Airport', 
    to: 'Terminal 2, Airport', 
    price: '₹0', 
    driver: '-', 
    rating: null 
  }
];

export default function CustomerActivity() {
  const [filter, setFilter] = useState('ALL');

  return (
    <div className="p-6 space-y-8 pb-10">
      
      {/* Header */}
      <div>
         <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Your Activity</h1>
         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Review your ride history and feedback</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
         {['ALL', 'COMPLETED', 'CANCELLED'].map((tab) => (
           <button 
             key={tab}
             onClick={() => setFilter(tab)}
             className={`flex-1 py-3 px-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${filter === tab ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
           >
             {tab}
           </button>
         ))}
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3">
         <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
               placeholder="Search by ID or Location"
               className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-3 px-12 font-bold text-xs uppercase tracking-widest outline-none focus:border-indigo-500 transition-all shadow-sm"
            />
         </div>
         <Button variant="outline" size="icon" className="w-12 h-12 rounded-2xl border-2 border-slate-100 dark:border-slate-800">
            <Filter className="w-5 h-5" />
         </Button>
      </div>

      {/* List */}
      <div className="space-y-4">
        {RIDE_HISTORY.filter(r => filter === 'ALL' || r.status === filter).map((ride, i) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            key={ride.id}
          >
            <Card className="p-6 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 rounded-[2.5rem] hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all group cursor-pointer group relative overflow-hidden">
               {/* Trip ID Badge */}
               <div className="absolute top-0 right-0 p-6">
                  <p className="text-[10px] font-black text-slate-300 dark:text-slate-700 tracking-tighter uppercase group-hover:text-indigo-500/20 transition-colors">#{ride.id}</p>
               </div>

               <div className="space-y-6">
                  {/* Status & Date */}
                  <div className="flex items-center gap-3">
                     <Badge 
                        className={`font-black text-[9px] tracking-[0.2em] px-2.5 py-1 ${ride.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-600 border-none' : 'bg-red-100 text-red-600 border-none'}`}
                     >
                        {ride.status}
                     </Badge>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        {ride.date}
                     </p>
                  </div>

                  {/* Route Timeline */}
                  <div className="space-y-4 relative">
                     <div className="absolute left-[7px] top-[14px] bottom-[14px] w-0.5 bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-100 transition-colors" />
                     <div className="flex items-center gap-4 relative z-10">
                        <div className="w-4 h-4 bg-emerald-500 rounded-full border-4 border-white dark:border-slate-900 shadow-md group-hover:scale-110 transition-transform" />
                        <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight italic truncate">{ride.from}</p>
                     </div>
                     <div className="flex items-center gap-4 relative z-10">
                        <div className="w-4 h-4 bg-indigo-600 rounded-full border-4 border-white dark:border-slate-900 shadow-md group-hover:scale-110 transition-transform" />
                        <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight italic truncate">{ride.to}</p>
                     </div>
                  </div>

                  <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-amber-500 transition-colors">
                           <Star className={ride.rating ? "w-5 h-5 fill-current" : "w-5 h-5"} />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Captain</p>
                           <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tighter">{ride.driver}</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Fare</p>
                        <p className="text-lg font-black text-indigo-600 tracking-tight">{ride.price}</p>
                     </div>
                  </div>
               </div>

               {/* Hover Overlay Actions */}
               <div className="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center pointer-events-none" />
            </Card>
          </motion.div>
        ))}
      </div>

      {RIDE_HISTORY.length === 0 && (
        <div className="text-center py-20">
           <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-6">
              <AlertCircle className="w-10 h-10" />
           </div>
           <h3 className="text-xl font-black uppercase tracking-tighter italic text-slate-400">No rides found</h3>
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Start your journey today!</p>
           <Button className="mt-8 rounded-2xl bg-indigo-600 py-6 px-10">BOOK FIRST RIDE</Button>
        </div>
      )}
    </div>
  );
}
