import React, { useState } from 'react';
import { 
  DollarSign, 
  Car, 
  Star, 
  MapPin, 
  Clock, 
  TrendingUp, 
  ChevronRight,
  Zap,
  Power,
  Activity,
  Award,
  ShieldCheck,
  FileText,
  Camera,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, Button, Badge, StatsCard } from '../../components/ui';
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from 'recharts';

const EARNINGS_PREVIEW_DATA = [
  { time: '6am', amount: 120 },
  { time: '9am', amount: 450 },
  { time: '12pm', amount: 200 },
  { time: '3pm', amount: 550 },
  { time: '6pm', amount: 890 },
  { time: '9pm', amount: 320 },
];

import { useNavigate } from 'react-router-dom';
import { driverProfileApi, driverAnalyticsApi, driverRideApi, TokenStore } from '../../lib/api';
import toast from 'react-hot-toast';

export default function DriverDashboard() {
  const [driver, setDriver] = useState<any>(TokenStore.getDriver());
  const [isOnline, setIsOnline] = useState(driver?.status === 'ONLINE');
  const [stats, setStats] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [availableRides, setAvailableRides] = useState<any[]>([]);
  const [currentRequest, setCurrentRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load Initial Data
  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [profileRes, analyticsRes, historyRes] = await Promise.all([
          driverProfileApi.getProfile(),
          driverAnalyticsApi.getEarnings(),
          driverAnalyticsApi.getHistory(0, 5)
        ]);
        setDriver(profileRes.data);
        TokenStore.setDriver(profileRes.data);
        setIsOnline(profileRes.data.status === 'ONLINE');
        setStats(analyticsRes.data);
        setHistory(historyRes.data.content || []);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Poll for Ride Requests when online
  React.useEffect(() => {
    let interval: any;
    if (isOnline) {
      const pollRides = async () => {
        try {
          const res = await driverRideApi.getRequests();
          if (res.data && res.data.length > 0) {
            setAvailableRides(res.data);
            setCurrentRequest(res.data[0]);
          } else {
            setCurrentRequest(null);
          }
        } catch (err) {
          console.error('Polling failed', err);
        }
      };
      pollRides();
      interval = setInterval(pollRides, 5000);
    } else {
      setCurrentRequest(null);
    }
    return () => clearInterval(interval);
  }, [isOnline]);

  const toggleStatus = async () => {
    const newStatus = isOnline ? 'OFFLINE' : 'ONLINE';
    try {
      await driverProfileApi.updateStatus(newStatus);
      const updatedDriver = { ...driver, status: newStatus };
      setDriver(updatedDriver);
      TokenStore.setDriver(updatedDriver);
      setIsOnline(!isOnline);
      toast.success(`You are now ${newStatus}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const handleAcceptRide = async (rideId: string) => {
    try {
      await driverRideApi.accept(rideId);
      toast.success('Ride accepted!');
      navigate('/driver/active-ride');
    } catch (err: any) {
      toast.error(err.message || 'Failed to accept ride');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto lg:max-w-none">
      {/* Welcome Header */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Namaste, {driver?.name?.split(' ')[0] || 'Partner'}!</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant="outline" className="text-[10px] font-bold border-indigo-100 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-900/50">
              {driver?.vehicleNumber || 'No Vehicle'}
            </Badge>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">•</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{driver?.vehicleCategory || 'Category'}</span>
          </div>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-slate-800 flex items-center justify-center border border-indigo-100 dark:border-slate-700">
          <Award className="w-6 h-6 text-indigo-600" />
        </div>
      </div>

      {/* Online/Offline Status Banner */}
      <div className={cn(
        "p-4 rounded-3xl transition-all duration-500 shadow-lg border-2",
        isOnline 
          ? "bg-emerald-500 border-emerald-400 text-white" 
          : "bg-slate-800 border-slate-700 text-slate-300"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-md",
              isOnline && "animate-pulse"
            )}>
              <Power className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-xl">{isOnline ? 'You Are Online' : 'You Are Offline'}</h2>
              <p className="text-xs opacity-90 font-medium">
                {isOnline ? 'Waiting for ride requests...' : 'Go online to start earning'}
              </p>
            </div>
          </div>
          <Button 
            onClick={toggleStatus}
            className={cn(
              "rounded-full px-8 py-6 font-bold shadow-xl border-none transition-transform active:scale-95",
              isOnline ? "bg-white text-emerald-600 hover:bg-emerald-50" : "bg-emerald-500 text-white hover:bg-emerald-400"
            )}
          >
            {isOnline ? 'GO OFFLINE' : 'GO ONLINE'}
          </Button>
        </div>
      </div>

      {/* Daily Performance Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-transform active:scale-95 cursor-pointer">
          <div className="flex items-center gap-2 text-indigo-500 mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Total Earnings</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">₹{stats?.totalEarnings || 0}</p>
          <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>Active Balance</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-transform active:scale-95 cursor-pointer">
          <div className="flex items-center gap-2 text-blue-500 mb-2">
            <Car className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Total Rides</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.rideCount || 0}</p>
          <p className="text-[10px] text-slate-500 font-medium mt-1">Lifetime</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-transform active:scale-95 cursor-pointer">
          <div className="flex items-center gap-2 text-amber-500 mb-2">
            <Star className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Rating</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{driver?.rating?.toFixed(2) || 'N/A'}</p>
          <p className="text-[10px] text-emerald-500 font-bold mt-1">Quality Score</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-transform active:scale-95 cursor-pointer">
          <div className="flex items-center gap-2 text-emerald-500 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Online Time</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">4h 20m</p>
          <p className="text-[10px] text-slate-500 font-medium mt-1">Today's Shift</p>
        </div>
      </div>

      {/* Document Verification Section (Show only if not approved) */}
      {driver?.verificationStatus !== 'APPROVED' && (
        <Card className="border-none shadow-xl bg-indigo-600 text-white rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-8 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
            <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-black italic uppercase tracking-tight">Complete Your Profile</h3>
                <p className="text-sm opacity-80 mt-1 font-medium">Upload required documents to start accepting rides.</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-white/20 text-white border-none py-1 px-3">
                  {driver?.verificationStatus || 'PENDING'}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              {[
                { label: 'Driving License', id: 'license', isUploaded: !!driver?.licenseImage },
                { label: 'Vehicle RC', id: 'rc', isUploaded: !!driver?.rcImage },
                { label: 'Aadhaar Card', id: 'aadhaar', isUploaded: !!driver?.aadhaarImage }
              ].map((doc) => (
                <label 
                  key={doc.id} 
                  className={cn(
                    "relative overflow-hidden backdrop-blur-md p-4 rounded-2xl border flex items-center justify-between group transition-all duration-300 cursor-pointer shadow-sm",
                    doc.isUploaded 
                      ? "bg-emerald-500/10 border-emerald-400/40 hover:bg-emerald-500/20" 
                      : "bg-white/10 border-white/10 hover:bg-white/20"
                  )}
                >
                  {doc.isUploaded && (
                    <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none rounded-2xl" />
                  )}
                  
                  <div className="flex items-center gap-3 relative z-10">
                    <FileText className={cn("w-5 h-5 transition-colors duration-300", doc.isUploaded ? "text-emerald-400" : "opacity-70")} />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase tracking-widest">{doc.label}</span>
                      {doc.isUploaded && (
                        <span className="text-[9px] font-black tracking-widest text-emerald-400 uppercase mt-0.5 animate-pulse">✓ Uploaded</span>
                      )}
                    </div>
                  </div>
                  
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center border-none transition-all duration-300 relative z-10",
                    doc.isUploaded 
                      ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20" 
                      : "bg-white/10 group-hover:bg-white text-white group-hover:text-indigo-600"
                  )}>
                    {doc.isUploaded ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </div>
                  
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = async () => {
                        try {
                          const res = await driverProfileApi.uploadDocument(doc.id, reader.result as string);
                          setDriver(res.data);
                          TokenStore.setDriver(res.data);
                          import('react-hot-toast').then(m => m.default.success(`${doc.label} uploaded successfully!`));
                        } catch (err: any) {
                          import('react-hot-toast').then(m => m.default.error(err.message || 'Failed to upload document'));
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }} />
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Earnings Chart */}
        <Card className="lg:col-span-2 border-none shadow-xl bg-gradient-to-br from-indigo-600 to-blue-700 text-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold">Earnings Activity</h3>
                <p className="text-xs opacity-70">Peak activity at 6:00 PM</p>
              </div>
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-md">Last 24 Hours</Badge>
            </div>
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={EARNINGS_PREVIEW_DATA}>
                  <defs>
                    <linearGradient id="colorEarning" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fff" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#fff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: 'rgba(0,0,0,0.8)', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#fff" strokeWidth={3} fillOpacity={1} fill="url(#colorEarning)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest opacity-70">
              <span>6 AM</span>
              <span>12 PM</span>
              <span>6 PM</span>
              <span>12 AM</span>
            </div>
          </CardContent>
        </Card>

        {/* Hotspots / Demand */}
        <Card className="border-none shadow-xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-slate-900">
             <img 
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800" 
              alt="Map" 
              className="w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-1000"
            />
          </div>
          <CardContent className="relative p-6 h-full flex flex-col justify-between text-white">
            <div>
              <Badge className="bg-orange-500 text-white border-none animate-pulse mb-4">High Demand Zone</Badge>
              <h3 className="text-xl font-bold">BKC area is booming!</h3>
              <p className="text-sm opacity-80 mt-1">Earn 1.5x surge pricing now</p>
            </div>
            <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 mt-6 font-bold py-6 rounded-2xl group border-none">
              <MapPin className="w-4 h-4 mr-2 group-hover:animate-bounce" />
              Navigate to Hotspot
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Trips Section */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Trips</h3>
          <Button variant="ghost" className="text-indigo-600 text-sm font-bold">View History</Button>
        </div>
        
        <AnimatePresence>
          {history.length > 0 ? (
            history.map((trip, i) => (
              <motion.div 
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 group cursor-pointer hover:border-indigo-200 transition-colors"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-colors">
                  <Car className="w-6 h-6 text-slate-400 group-hover:text-indigo-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">{trip.pickupLocation?.split(',')[0]} → {trip.dropLocation?.split(',')[0]}</h4>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">₹{trip.fare}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(trip.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="flex items-center gap-1 border-l pl-3 border-slate-200 dark:border-slate-800"><Zap className="w-3 h-3" /> {trip.distance || '0.0'} km</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 transition-colors" />
              </motion.div>
            ))
          ) : (
            <div className="bg-slate-50 dark:bg-slate-800/50 p-12 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
                <Activity className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-900 dark:text-white font-bold">No trips yet</p>
              <p className="text-xs text-slate-500 mt-1">Go online and accept requests to see your activity here.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Ride Request Modal Placeholder (Full Screen Mobile Style) */}
      <AnimatePresence>
        {currentRequest && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md flex flex-col justify-end p-4 lg:p-12 lg:items-center lg:justify-center"
          >
            <motion.div 
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3rem] p-8 space-y-8 shadow-2xl relative overflow-hidden"
              whileHover={{ scale: 1.02 }}
            >
              {/* Animated Progress Bar (Timer) */}
              <div className="absolute top-0 left-0 h-2 bg-indigo-500 animate-[timer_15s_linear_forwards]" />
              
              <div className="flex items-center justify-between">
                <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 flex items-center justify-center">
                  <Activity className="w-8 h-8 animate-pulse" />
                </div>
                <div className="text-right">
                  <Badge variant="success" className="mb-1">{currentRequest.vehicleCategory}</Badge>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white">₹{currentRequest.fare}</h2>
                </div>
              </div>

              <div className="space-y-6">
                <div className="relative pl-6 space-y-6">
                  <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-dashed border-l-2 border-dashed border-slate-200 dark:border-slate-800" />
                  <div className="relative">
                    <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-indigo-100 dark:ring-indigo-900/30" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pickup</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{currentRequest.pickupLocation}</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-900/30" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Destination</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{currentRequest.dropLocation}</p>
                    <p className="text-xs text-slate-500">{currentRequest.distance} km trip</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 font-bold">
                    {currentRequest.customerName?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{currentRequest.customerName}</p>
                    <div className="flex items-center gap-2">
                       <span className="text-xs text-slate-500">★ 4.8</span>
                       <span className="text-[10px] py-0.5 px-2 bg-indigo-100 text-indigo-700 rounded-full font-bold">TOP RIDER</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-8 rounded-3xl text-xl shadow-xl shadow-indigo-200 dark:shadow-none border-none transition-all active:scale-95"
                  onClick={() => handleAcceptRide(currentRequest.id)}
                >
                  ACCEPT RIDE
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full font-bold text-slate-400 hover:text-slate-600"
                  onClick={() => setCurrentRequest(null)}
                >
                  DECLINE
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes timer {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}} />
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
