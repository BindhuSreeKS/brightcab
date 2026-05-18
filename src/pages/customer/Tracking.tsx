import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Navigation2, 
  ChevronLeft, 
  AlertCircle, 
  CheckCircle2, 
  Shield, 
  Star, 
  Phone, 
  MessageCircle, 
  Share2, 
  X 
} from 'lucide-react';
import { Button, Badge } from '../../components/ui';
import { customerRideApi, TokenStore } from '../../lib/api';
import { toast } from 'react-hot-toast';

export default function RideTracking() {
  const [ride, setRide] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchActiveRide = async () => {
    try {
      const res = await customerRideApi.getActive();
      setRide(res.data);
      if (res.data.status === 'COMPLETED') {
        toast.success('Ride completed! Hope you had a great trip.');
        navigate('/customer');
      }
    } catch (err) {
      console.error('Failed to fetch active ride', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveRide();
    const interval = setInterval(fetchActiveRide, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCancel = async () => {
    if (!ride?.id) return;
    try {
      await customerRideApi.cancel(ride.id);
      toast.success('Ride cancelled');
      navigate('/customer');
    } catch (err) {
      toast.error('Failed to cancel ride');
    }
  };

  const status = ride?.status?.toLowerCase() || 'searching';

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col relative overflow-hidden">
      
      {/* Background Simulation Map */}
      <div className="absolute inset-0 z-0 bg-slate-200 dark:bg-slate-900">
         <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 0)', backgroundSize: '40px 40px' }} />
         </div>
         
         {/* Animated Markers */}
         <motion.div 
            animate={{ 
               x: status === 'searching' ? [100, 200, 150] : 300,
               y: status === 'searching' ? [100, 150, 120] : 350
            }}
            className="absolute top-0 left-0 w-12 h-12 flex items-center justify-center z-10"
         >
            <div className="relative">
               <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-indigo-500/50 ring-4 ring-white dark:ring-slate-800">
                  <Navigation2 className="w-4 h-4 fill-current rotate-45" />
               </div>
               <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-40 -z-10" />
            </div>
         </motion.div>

         <div className="absolute top-[40%] left-[30%] w-6 h-6 bg-emerald-500 rounded-full border-4 border-white dark:border-slate-800 shadow-xl shadow-emerald-500/50">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 px-3 py-1 rounded-full shadow-lg border border-slate-100 dark:border-slate-700 whitespace-nowrap">
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Pickup Point</span>
            </div>
         </div>
      </div>

      {/* Floating Header */}
      <div className="relative z-10 p-6 flex items-center justify-between pointer-events-none">
         <Button 
            variant="white"
            size="icon" 
            onClick={() => navigate('/customer')}
            className="rounded-2xl pointer-events-auto shadow-xl"
          >
            <ChevronLeft className="w-6 h-6" />
         </Button>
         
         <div className="pointer-events-auto">
            <Badge variant="outline" className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-900 dark:text-white px-4 py-2 border-none shadow-xl font-bold uppercase tracking-widest text-[10px]">
               {status === 'searching' && <span className="animate-pulse flex items-center gap-2 text-indigo-600"><AlertCircle className="w-3 h-3" /> Finding Captain...</span>}
               {status === 'driver_assigned' && <span className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Captain Assigned</span>}
               {status === 'driver_arriving' && <span className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Arriving Shortly</span>}
               {status === 'ongoing' && <span className="flex items-center gap-2 text-amber-500">Ride In Progress</span>}
            </Badge>
         </div>

         <Button 
            variant="destructive"
            size="icon" 
            className="rounded-2xl pointer-events-auto shadow-xl"
          >
            <Shield className="w-6 h-6" />
         </Button>
      </div>

      {/* Content Panels */}
      <div className="mt-auto relative z-10 p-6 space-y-4">
         <AnimatePresence mode="wait">
            {status === 'searching' || !ride?.driver ? (
               <motion.div
                  key="searching"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 50 }}
                  className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 shadow-2xl text-center space-y-6"
               >
                  <div className="relative w-24 h-24 mx-auto">
                     <div className="absolute inset-0 bg-indigo-500/10 rounded-full animate-ping" />
                     <div className="relative w-full h-full bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center text-indigo-600">
                        <Navigation2 className="w-10 h-10 animate-bounce" />
                     </div>
                  </div>
                  <div>
                     <h2 className="text-2xl font-black uppercase tracking-tighter italic">Searching Nearby</h2>
                     <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Connecting with the perfect captain...</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ride Mode</p>
                        <p className="font-bold text-slate-900 dark:text-white uppercase tracking-tight italic">{ride?.vehicleCategory || 'Vazraa Mini'}</p>
                     </div>
                     <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fixed Fare</p>
                        <p className="font-bold text-slate-900 dark:text-white uppercase tracking-tight italic">₹{ride?.fare?.toFixed(0) || '0'}</p>
                     </div>
                  </div>
                  <Button onClick={handleCancel} variant="ghost" className="w-full py-4 text-red-500 font-black uppercase tracking-widest text-xs">Cancel Search</Button>
               </motion.div>
            ) : (
               <motion.div
                  key="driver-details"
                  initial={{ opacity: 0, scale: 0.9, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="space-y-4"
               >
                  {/* Driver Header Card */}
                  <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-2xl space-y-6 relative overflow-hidden group">
                     {/* Background Glow */}
                     <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-indigo-500/10 transition-all" />

                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="relative">
                              <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-600 flex items-center justify-center text-white text-2xl font-black italic shadow-lg">
                                 {ride.driver.name.charAt(0)}
                              </div>
                              <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white p-1 rounded-full border-2 border-white dark:border-slate-900">
                                 <Star className="w-3 h-3 fill-current" />
                              </div>
                           </div>
                           <div>
                              <h3 className="text-xl font-black uppercase tracking-tighter italic leading-none">{ride.driver.name}</h3>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">{ride.driver.vehicleColor} {ride.driver.vehicleModel}</p>
                              <div className="flex items-center gap-2 mt-1">
                                 <Badge className="bg-amber-100 text-amber-600 border-none px-1.5 font-bold">{ride.driver.rating?.toFixed(1) || '5.0'} ★</Badge>
                                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{ride.driver.totalRides || '0'} Rides</span>
                              </div>
                           </div>
                        </div>
                        <div className="text-right">
                           <Badge className="bg-indigo-600 text-white rounded-xl py-2 px-3 font-black text-xs border-none shadow-lg uppercase">{ride.driver.vehicleNumber}</Badge>
                           <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-2">Active Now</p>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-3">
                        <Button className="py-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-emerald-100 dark:shadow-none flex items-center gap-2 font-black uppercase tracking-widest text-xs">
                           <Phone className="w-4 h-4" />
                           Call
                        </Button>
                        <Button className="py-6 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-none hover:bg-indigo-100 flex items-center gap-2 font-black uppercase tracking-widest text-xs">
                           <MessageCircle className="w-4 h-4" />
                           Message
                        </Button>
                     </div>
                  </div>

                  {/* Secondary Actions */}
                  <div className="flex gap-3">
                     <Button className="flex-1 py-4 px-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl flex items-center justify-between text-slate-900 dark:text-white font-bold text-sm h-auto group">
                        <div className="flex items-center gap-3">
                           <Share2 className="w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform" />
                           <span className="uppercase tracking-tight">Share Trip</span>
                        </div>
                     </Button>
                     <Button onClick={handleCancel} className="py-4 px-6 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20 shadow-xl flex items-center justify-center text-red-500 font-bold group h-auto">
                        <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                     </Button>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>
      </div>

    </div>
  );
}
