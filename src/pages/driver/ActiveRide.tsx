import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  Phone, 
  MessageCircle, 
  AlertTriangle,
  ChevronUp,
  Clock,
  Shield,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Flag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Badge, Card, CardContent } from '../../components/ui';
import { useNavigate } from 'react-router-dom';
import { driverRideApi, driverSafetyApi } from '../../lib/api';
import toast from 'react-hot-toast';

export default function ActiveRide() {
  const [ride, setRide] = useState<any>(null);
  const [status, setStatus] = useState<string>('ACCEPTED');
  const [showSafetySheet, setShowSafetySheet] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchActiveRide = async () => {
      try {
        const res = await driverRideApi.getActive();
        if (res.data) {
          setRide(res.data);
          setStatus(res.data.status);
        } else {
          toast.error('No active ride found');
          navigate('/driver');
        }
      } catch (err) {
        console.error('Failed to fetch active ride', err);
        navigate('/driver');
      } finally {
        setLoading(false);
      }
    };
    fetchActiveRide();
  }, []);

  const handleNextStep = async () => {
    let nextStatus = '';
    if (status === 'ACCEPTED') nextStatus = 'ARRIVED';
    else if (status === 'ARRIVED') nextStatus = 'ONGOING';
    else if (status === 'ONGOING') nextStatus = 'COMPLETED';
    else {
      navigate('/driver');
      return;
    }

    try {
      const res = await driverRideApi.updateStatus(ride.id, nextStatus);
      setStatus(nextStatus);
      toast.success(`Ride status: ${nextStatus}`);
      if (nextStatus === 'COMPLETED') {
        navigate('/driver/earnings');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const handleSOS = async () => {
    try {
      // Get current location (mocked or browser geolocation)
      const location = { latitude: 19.076, longitude: 72.877 };
      await driverSafetyApi.triggerSos(location, ride?.id);
      toast.success('SOS Alert Sent! Help is on the way.');
      setShowSafetySheet(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to trigger SOS');
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading Active Ride...</div>;
  if (!ride) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col font-sans">
      
      {/* Real-time Map Background (Simulation) */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-slate-800 relative overflow-hidden">
          {/* Mock Map Grid */}
          <div className="absolute inset-0 opacity-20" style={{ 
            backgroundImage: 'radial-gradient(circle, #4f46e5 1px, transparent 1px)', 
            backgroundSize: '40px 40px' 
          }} />
          
          {/* Animated Route Line */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
             <motion.path
                d="M 100 600 Q 200 400 400 300 T 700 100"
                fill="none"
                stroke="#4f46e5"
                strokeWidth="12"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
             />
             <motion.path
                d="M 100 600 Q 200 400 400 300 T 700 100"
                fill="none"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="10 20"
                animate={{ strokeDashoffset: -100 }}
                transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
             />
          </svg>

          {/* Map Markers */}
          <motion.div 
            className="absolute top-[100px] right-[100px] z-10"
            initial={{ scale: 0 }} animate={{ scale: 1 }}
          >
            <div className="bg-emerald-500 p-3 rounded-full shadow-2xl ring-4 ring-emerald-500/30">
               <Flag className="w-6 h-6 text-white" />
            </div>
          </motion.div>

          <motion.div 
            className="absolute bottom-[200px] left-[150px] z-20 flex flex-col items-center"
            animate={{ 
              x: status === 'ONGOING' ? [0, 100, 200] : 0, 
              y: status === 'ONGOING' ? [0, -50, -100] : 0 
            }}
            transition={{ duration: 20, repeat: Infinity }}
          >
            <div className="bg-white p-1 rounded-full shadow-2xl relative">
              <div className="bg-indigo-600 p-4 rounded-full shadow-inner">
                <Navigation className="w-8 h-8 text-white rotate-45" />
              </div>
              {/* Radar Effect */}
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500 animate-ping opacity-20" />
            </div>
            <Badge className="mt-4 bg-indigo-600 text-white font-bold px-4 py-1.5 shadow-xl border-none">YOU</Badge>
          </motion.div>
        </div>
      </div>

      {/* Top Navigation Instructions */}
      <AnimatePresence>
        {showInstructions && (
          <motion.div 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="absolute top-4 inset-x-4 z-40"
          >
            <div className="bg-slate-900/90 backdrop-blur-md text-white p-5 rounded-[2rem] shadow-2xl flex items-start gap-4 border border-white/10">
              <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center flex-shrink-0 animate-pulse">
                <Navigation className="w-8 h-8 rotate-[135deg]" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black">200m</h3>
                <p className="text-sm font-medium opacity-80 uppercase tracking-wide">Turn right onto Central Avenue</p>
                <div className="flex items-center gap-3 mt-2 text-xs font-bold text-slate-400">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 8 min</span>
                  <span className="flex items-center gap-1"><Flag className="w-3.5 h-3.5" /> 2.4 km</span>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowInstructions(false)} className="text-slate-500">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Buttons */}
      <div className="absolute right-4 bottom-[400px] z-30 flex flex-col gap-3">
         <Button size="icon" className="w-14 h-14 rounded-2xl bg-white text-slate-900 shadow-xl border-none hover:bg-slate-50">
            <Navigation className="w-6 h-6" />
         </Button>
         <Button 
            size="icon" 
            className="w-14 h-14 rounded-2xl bg-red-600 text-white shadow-xl border-none hover:bg-red-700"
            onClick={() => setShowSafetySheet(true)}
          >
            <Shield className="w-6 h-6" />
         </Button>
      </div>

      {/* Bottom Interaction Panel */}
      <div className="mt-auto relative z-40 bg-white dark:bg-slate-950 rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.3)] pb-safe px-6 pt-8">
        {/* Handle */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full" />
        
        <div className="space-y-8">
          {/* Rider Info Card */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
               <div className="relative">
                 <img 
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100" 
                    alt="Rider" 
                    className="w-16 h-16 rounded-3xl border-2 border-indigo-500 shadow-lg object-cover"
                 />
                 <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white">
                    <CheckCircle2 className="w-3 h-3" />
                 </div>
               </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white">{ride.customerName}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-bold">★ 4.8</Badge>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Premium Member</span>
                  </div>
               </div>
            </div>
            <div className="flex gap-2">
               <Button size="icon" className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 hover:bg-emerald-200 border-none">
                 <Phone className="w-5 h-5" />
               </Button>
               <Button size="icon" className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 hover:bg-indigo-200 border-none">
                 <MessageCircle className="w-5 h-5" />
               </Button>
            </div>
          </div>

          {/* Location Info */}
          <div className="space-y-6">
             <div className="flex items-start gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2.5 shadow-[0_0_10px_rgba(79,70,229,0.5)]" />
                <div className="flex-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">
                      {status === 'ACCEPTED' || status === 'ARRIVED' ? 'Pickup Location' : 'Destination'}
                    </p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                      {status === 'ACCEPTED' || status === 'ARRIVED' ? ride.pickupLocation : ride.dropLocation}
                    </p>
                   <p className="text-sm text-slate-500 font-medium mt-1 italic">Gate 4, Departure Level</p>
                </div>
             </div>
          </div>

          {/* Main Action Button */}
          <div className="py-2">
            <Button 
               className={cn(
                 "w-full py-8 rounded-[2rem] text-xl font-black shadow-2xl transition-all active:scale-95 border-none",
                 status === 'PICKUP' && "bg-slate-900 hover:bg-slate-800 text-white",
                 status === 'ARRIVED' && "bg-emerald-500 hover:bg-emerald-600 text-white",
                 status === 'ONGOING' && "bg-indigo-600 hover:bg-indigo-700 text-white",
                 status === 'COMPLETED' && "bg-slate-900 hover:bg-slate-800 text-white"
               )}
               onClick={handleNextStep}
            >
              <motion.span 
                 key={status}
                 initial={{ opacity: 0, scale: 0.8 }}
                 animate={{ opacity: 1, scale: 1 }}
              >
                {status === 'ACCEPTED' && 'ARRIVED AT PICKUP'}
                {status === 'ARRIVED' && `START RIDE #${ride.id?.slice(-4)}`}
                {status === 'ONGOING' && 'COMPLETE TRIP'}
                {status === 'COMPLETED' && 'VIEW EARNINGS'}
              </motion.span>
            </Button>
          </div>
        </div>
      </div>

      {/* Safety Bottom Sheet */}
      <AnimatePresence>
        {showSafetySheet && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[55]"
              onClick={() => setShowSafetySheet(false)}
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 inset-x-0 z-[60] bg-white dark:bg-slate-950 rounded-t-[3rem] p-8 space-y-8"
            >
              <div className="flex items-center gap-4 text-red-600">
                <div className="w-14 h-14 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center">
                  <Shield className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase italic">Emergency Tools</h3>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Available 24/7</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <Button 
                  onClick={handleSOS}
                  className="w-full py-6 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold gap-3 border-none shadow-xl shadow-red-200 dark:shadow-none"
                >
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  TRIGGER SOS PANIC BUTTON
                </Button>
                <Button variant="outline" className="w-full py-6 rounded-2xl border-2 border-slate-100 font-bold gap-3 text-slate-600">
                  <Phone className="w-5 h-5 flex-shrink-0" />
                  CALL EMERGENCY CONTACTS
                </Button>
                <Button variant="outline" className="w-full py-6 rounded-2xl border-2 border-slate-100 font-bold gap-3 text-slate-600">
                  <Flag className="w-5 h-5 flex-shrink-0" />
                  REPORT RIDER BEHAVIOR
                </Button>
              </div>

              <Button 
                variant="ghost" 
                onClick={() => setShowSafetySheet(false)}
                className="w-full font-bold text-slate-400"
              >
                DISMISS
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
