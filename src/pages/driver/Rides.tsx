import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  Calendar, 
  ChevronRight, 
  Star,
  Zap,
  MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, Button, Badge } from '../../components/ui';

import { driverAnalyticsApi } from '../../lib/api';

export default function DriverRides() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [selectedRide, setSelectedRide] = useState<string | null>(null);
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchRides = async () => {
      try {
        const res = await driverAnalyticsApi.getHistory(0, 50);
        setRides(res.data.content || []);
      } catch (err) {
        console.error('Failed to fetch rides', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRides();
  }, []);

  const filteredRides = rides.filter(ride => {
    const matchesSearch = ride.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (ride.customerName && ride.customerName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = filter === 'ALL' || ride.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 max-w-2xl mx-auto lg:max-w-none pb-8">
      
      {/* Header & Search */}
      <div className="space-y-4 sticky top-16 z-30 lg:top-0 py-2 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="flex items-center justify-between px-2">
           <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Your Rides</h2>
           <Button variant="ghost" size="icon" className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 shadow-sm">
              <Filter className="w-5 h-5 text-slate-500" />
           </Button>
        </div>

        <div className="relative group">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
           <input 
              type="text" 
              placeholder="Search ride ID, customer name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border-none rounded-3xl py-4 pl-12 pr-6 text-sm font-medium focus:ring-2 focus:ring-indigo-500 shadow-sm text-slate-900 dark:text-white"
           />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 px-1 no-scrollbar">
           {(['ALL', 'COMPLETED', 'CANCELLED'] as const).map((f) => (
              <Button 
                key={f}
                variant={filter === f ? 'primary' : 'ghost'}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-full px-6 py-2 h-auto text-xs font-black uppercase tracking-widest border-none whitespace-nowrap",
                  filter === f ? "bg-indigo-600 text-white shadow-lg" : "bg-white dark:bg-slate-900 text-slate-500 shadow-sm"
                )}
              >
                {f}
              </Button>
           ))}
        </div>
      </div>

      {/* Rides List */}
      <div className="space-y-4">
        {loading ? (
           <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest animate-pulse">Loading rides...</div>
        ) : filteredRides.length === 0 ? (
           <div className="py-20 text-center space-y-4">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
                 <Zap className="w-10 h-10" />
              </div>
              <div>
                 <h3 className="font-bold text-slate-900 dark:text-white">No Rides Found</h3>
                 <p className="text-sm text-slate-500">Try adjusting your filters or search keywords.</p>
              </div>
           </div>
        ) : (
          filteredRides.map((ride, i) => (
             <motion.div 
                key={ride.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
             >
                <Card 
                  className={cn(
                    "rounded-[2rem] border-none shadow-sm overflow-hidden group cursor-pointer transition-all",
                    selectedRide === ride.id ? "ring-2 ring-indigo-500" : "hover:shadow-md"
                  )}
                  onClick={() => setSelectedRide(selectedRide === ride.id ? null : ride.id)}
                >
                   <CardContent className="p-0">
                      <div className="p-5 flex items-center gap-4">
                         <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 font-black text-xl border-2 border-white dark:border-slate-800 shadow-sm">
                            {ride.customerName?.charAt(0) || 'C'}
                         </div>
                         <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                               <h4 className="font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">{ride.customerName || 'Anonymous'}</h4>
                               <span className="font-black text-slate-900 dark:text-white text-lg">₹{ride.fare.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                               <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(ride.createdAt).toLocaleDateString()}</span>
                               <span className={cn(
                                 "font-bold",
                                 ride.status === 'COMPLETED' ? "text-emerald-500" : "text-red-500"
                               )}>{ride.status}</span>
                            </div>
                         </div>
                      </div>

                      <AnimatePresence>
                        {selectedRide === ride.id && (
                           <motion.div 
                               initial={{ height: 0, opacity: 0 }}
                               animate={{ height: 'auto', opacity: 1 }}
                               exit={{ height: 0, opacity: 0 }}
                               className="overflow-hidden bg-slate-50 dark:bg-slate-800/50"
                           >
                              <div className="p-5 pt-0 space-y-6">
                                 <div className="relative pl-5 space-y-6 before:absolute before:left-1 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700 before:border-none">
                                    <div className="relative">
                                       <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-slate-400" />
                                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pickup</p>
                                       <p className="text-sm font-bold text-slate-900 dark:text-white">{ride.pickupLocation}</p>
                                    </div>
                                    <div className="relative">
                                       <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(79,70,229,0.5)]" />
                                       <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Drop</p>
                                       <p className="text-sm font-bold text-slate-900 dark:text-white">{ride.dropLocation}</p>
                                    </div>
                                 </div>

                                 <div className="grid grid-cols-3 gap-2 py-4 border-y border-slate-100 dark:border-slate-700">
                                    <div className="text-center">
                                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Distance</p>
                                       <p className="text-sm font-black text-slate-900 dark:text-white">{ride.distance || '--'} km</p>
                                    </div>
                                    <div className="text-center border-x border-slate-100 dark:border-slate-700">
                                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</p>
                                       <p className="text-sm font-black text-slate-900 dark:text-white">{ride.vehicleCategory}</p>
                                    </div>
                                    <div className="text-center">
                                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                                       <div className="flex items-center justify-center gap-1 text-indigo-500">
                                          <span className="text-sm font-black italic">{ride.status}</span>
                                       </div>
                                    </div>
                                 </div>

                                 <div className="flex gap-2">
                                    <Button className="flex-1 bg-white dark:bg-slate-900 rounded-2xl py-3 text-xs font-black uppercase text-indigo-600 border-none shadow-sm hover:bg-slate-50">
                                       REPORT ISSUE
                                    </Button>
                                    <Button className="flex-1 bg-white dark:bg-slate-900 rounded-2xl py-3 text-xs font-black uppercase text-slate-900 dark:text-white border-none shadow-sm hover:bg-slate-50">
                                       INVOICE
                                    </Button>
                                 </div>
                              </div>
                           </motion.div>
                        )}
                      </AnimatePresence>
                   </CardContent>
                </Card>
             </motion.div>
          ))
        )}
      </div>

    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
