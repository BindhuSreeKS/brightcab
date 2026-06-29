import React from 'react';
import { 
  Search, 
  MapPin, 
  Clock, 
  ArrowRight, 
  Star, 
  Gift, 
  Zap, 
  Navigation2,
  Calendar,
  History,
  TrendingUp,
  Map as MapIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Badge } from '../../components/ui';

import { customerSavedPlacesApi, customerRideApi, ridesApi, TokenStore } from '../../lib/api';

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [savedPlaces, setSavedPlaces] = React.useState<any[]>([]);
  const [recentTrips, setRecentTrips] = React.useState<any[]>([]);
  const [activeRide, setActiveRide] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const customer = TokenStore.getCustomer();

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [placesRes, ridesRes, activeRes] = await Promise.all([
          customerSavedPlacesApi.getAll(),
          ridesApi.getAll({ page: 0, size: 5 }), // Using ridesApi for history preview
          customerRideApi.getActive().catch(() => ({ data: null }))
        ]);
        setSavedPlaces(placesRes.data || []);
        setRecentTrips(ridesRes.data.content || []);
        setActiveRide(activeRes.data);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="space-y-8 pb-10">
      {/* Search Header */}
      <div className="px-6 pt-2">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-tight">
          Hello, {customer?.name?.split(' ')[0] || 'Customer'}! <br/> <span className="text-indigo-600">Where are you Going?</span>
        </h1>
        
        <div 
          onClick={() => navigate('/customer/book')}
          className="mt-6 p-4 bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 flex items-center gap-4 cursor-pointer group active:scale-95 transition-all"
        >
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600">
             <Search className="w-6 h-6" />
          </div>
          <div className="flex-1">
             <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Pick up location</p>
             <p className="font-black text-slate-900 dark:text-white text-lg tracking-tight">Search destination...</p>
          </div>
        </div>
      </div>

      {/* Main Actions Grid */}
      <div className="grid grid-cols-4 gap-4 px-6 overflow-x-auto pb-4 custom-scrollbar lg:grid-cols-4">
        {[
          { label: 'Mini', icon: Navigation2, color: 'indigo' },
          { label: 'Sedan', icon: Zap, color: 'emerald' },
          { label: 'SUV', icon: TrendingUp, color: 'amber' },
          { label: 'Auto', icon: MapIcon, color: 'rose' }
        ].map((item) => (
          <motion.div 
            key={item.label}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/customer/book')}
            className="flex flex-col items-center gap-2 flex-shrink-0"
          >
            <div className={`w-16 h-16 bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-lg shadow-slate-100 dark:shadow-none border border-slate-100 dark:border-slate-800 flex items-center justify-center text-indigo-500 transition-transform group-hover:-translate-y-1 cursor-pointer`}>
               <item.icon className="w-8 h-8" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{item.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Active Trip Widget */}
      {activeRide && (
        <div className="px-6">
          <Card className="bg-indigo-600 text-white overflow-hidden relative border-none shadow-2xl animate-pulse">
             <div className="p-6 relative z-10 flex items-center justify-between">
                <div>
                   <Badge className="bg-white/20 text-white border-none font-bold mb-3">ACTIVE TRIP</Badge>
                   <h3 className="text-xl font-black uppercase tracking-tight italic truncate max-w-[200px]">
                      {activeRide.pickupLocation}
                   </h3>
                   <p className="text-xs font-bold text-white/60 mt-1 uppercase tracking-widest flex items-center gap-2">
                      <Zap className="w-3 h-3" />
                      Status: {activeRide.status}
                   </p>
                </div>
                <Button 
                  onClick={() => navigate('/customer/tracking')}
                  size="icon" 
                  className="w-12 h-12 bg-white text-indigo-600 rounded-2xl hover:bg-slate-100 transition-all border-none"
                >
                   <Navigation2 className="w-6 h-6" />
                </Button>
             </div>
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
          </Card>
        </div>
      )}

      {/* Promotional Banners */}
      <div className="px-6 flex gap-4 overflow-x-auto pb-4 no-scrollbar">
         {[
           { title: 'Get 50% Off', desc: 'Valid on first 5 rides', bg: 'bg-emerald-500', icon: Gift },
           { title: 'Vazraa Pro', desc: 'Zero wait time booking', bg: 'bg-indigo-500', icon: Zap }
         ].map((promo, i) => (
           <div key={i} className={`flex-shrink-0 w-72 ${promo.bg} p-6 rounded-[2.5rem] text-white flex flex-col justify-between shadow-xl shadow-slate-200/20 dark:shadow-none`}>
              <div>
                 <promo.icon className="w-8 h-8 mb-4 opacity-50" />
                 <h4 className="text-2xl font-black uppercase tracking-tighter italic">{promo.title}</h4>
                 <p className="text-xs font-bold text-white/80 mt-1 uppercase tracking-widest">{promo.desc}</p>
              </div>
              <Button variant="ghost" className="mt-6 w-fit bg-white/20 hover:bg-white/30 text-white border-none rounded-xl font-bold uppercase tracking-widest text-[10px]">
                 Claim Now
              </Button>
           </div>
         ))}
      </div>

      {/* Saved Places */}
      <div className="px-6 space-y-4">
        <div className="flex items-center justify-between">
           <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Saved Places</h2>
           <Button variant="ghost" className="text-indigo-600 text-[10px] font-black uppercase tracking-widest" onClick={() => navigate('/customer/profile')}>Manage</Button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
           {savedPlaces.length > 0 ? (
             savedPlaces.map((place) => (
               <div key={place.name} className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:border-indigo-500 transition-all cursor-pointer group">
                  <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors mb-3">
                     <MapPin className="w-5 h-5" />
                  </div>
                  <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm">{place.name}</h3>
                  <p className="text-[10px] font-bold text-slate-400 truncate mt-1">{place.address}</p>
               </div>
             ))
           ) : (
             <div className="col-span-2 py-8 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                No saved places yet
             </div>
           )}
        </div>
      </div>

      {/* Recent Trips */}
      <div className="px-6 space-y-4 pb-4">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Recent Trips</h2>
        <div className="space-y-3">
           {recentTrips.length > 0 ? (
             recentTrips.map((trip, i) => (
               <div key={i} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400">
                        <History className="w-5 h-5" />
                     </div>
                     <div>
                        <h4 className="font-black text-sm uppercase tracking-tight italic truncate max-w-[150px]">
                           {trip.pickupLocation?.split(',')[0]} ➔ {trip.dropLocation?.split(',')[0]}
                        </h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5 tracking-[0.1em]">
                           {new Date(trip.bookingTime).toLocaleDateString()}
                        </p>
                     </div>
                  </div>
                  <p className="font-black text-indigo-600 text-sm tracking-tight italic">₹{trip.estimatedFare}</p>
               </div>
             ))
           ) : (
             <div className="py-8 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                No recent trips found
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
