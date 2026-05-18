import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  ArrowUpRight, 
  CreditCard,
  History,
  TrendingDown,
  Gift,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, Button, Badge } from '../../components/ui';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

const WEEKLY_EARNINGS_DATA = [
  { day: 'Mon', amount: 840 },
  { day: 'Tue', amount: 1200 },
  { day: 'Wed', amount: 950 },
  { day: 'Thu', amount: 1560 },
  { day: 'Fri', amount: 2100 },
  { day: 'Sat', amount: 1800 },
  { day: 'Sun', amount: 1100 },
];

const TRANSACTIONS = [
  { id: 'TX49021', type: 'Ride Earning', amount: 420.50, status: 'Completed', date: 'Today, 2:45 PM' },
  { id: 'TX49020', type: 'Ride Earning', amount: 180.00, status: 'Completed', date: 'Today, 1:20 PM' },
  { id: 'TX48995', type: 'Bonus Incentive', amount: 500.00, status: 'Credited', date: 'Yesterday' },
  { id: 'TX48994', type: 'Ride Earning', amount: 310.20, status: 'Completed', date: 'Yesterday' },
  { id: 'TX48990', type: 'Cancellation Fee', amount: 50.00, status: 'Credited', date: 'Yesterday' },
];

import { driverAnalyticsApi } from '../../lib/api';

export default function DriverEarnings() {
  const [stats, setStats] = React.useState<any>(null);
  const [history, setHistory] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [statsRes, historyRes] = await Promise.all([
          driverAnalyticsApi.getEarnings(),
          driverAnalyticsApi.getHistory(0, 10)
        ]);
        setStats(statsRes.data);
        setHistory(historyRes.data.content || []);
      } catch (err) {
        console.error('Failed to load earnings data', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="space-y-6 max-w-2xl mx-auto lg:max-w-none pb-8">
      
      {/* Total Balance Card */}
      <Card className="bg-slate-900 text-white rounded-[2.5rem] border-none shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full -mr-32 -mt-32 blur-3xl" />
        <CardContent className="p-8 relative z-10">
          <div className="flex items-start justify-between mb-8">
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl">
               <DollarSign className="w-8 h-8 text-indigo-400" />
            </div>
            <div className="text-right">
               <Badge className="bg-emerald-500 text-white border-none font-bold mb-2">AUTO PAYOUT ON</Badge>
               <p className="text-xs opacity-60 font-bold uppercase tracking-widest">Next Payout: Monday</p>
            </div>
          </div>
          
          <div className="space-y-1">
             <p className="text-sm font-bold opacity-60 uppercase tracking-[0.2em]">Available Balance</p>
             <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black italic">₹{stats?.totalBalance?.toFixed(0) || '0'}</span>
                <span className="text-indigo-400 font-bold">.{(stats?.totalBalance % 1 * 100).toFixed(0).padStart(2, '0')}</span>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-10">
             <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-6 rounded-2xl border-none shadow-lg">
                WITHDRAW NOW
             </Button>
             <Button variant="ghost" className="bg-white/10 hover:bg-white/20 text-white font-bold py-6 rounded-2xl border-none">
                VIEW DETAILS
             </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Weekly Chart */}
        <Card className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-lg font-bold text-slate-900 dark:text-white">Weekly Performance</h3>
               <div className="flex items-center gap-1 text-emerald-500 font-bold text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>+0%</span>
               </div>
            </div>
            
            <div className="h-[240px] w-full flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
               <div className="text-center">
                  <TrendingDown className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Not enough data for chart</p>
               </div>
            </div>
          </CardContent>
        </Card>

        {/* Breakdown Widgets */}
        <div className="grid grid-cols-2 gap-4">
           <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-[2rem] flex flex-col justify-between group cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors">
              <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm mb-4">
                 <Gift className="w-5 h-5" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-indigo-600/60 uppercase tracking-widest mb-1">Incentives</p>
                 <p className="text-2xl font-black text-slate-900 dark:text-white">₹{stats?.totalIncentives?.toFixed(0) || '0'}</p>
                 <p className="text-[10px] font-bold text-indigo-600 mt-1">Daily goal bonuses</p>
              </div>
           </div>

           <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-[2rem] flex flex-col justify-between group cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors">
              <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-emerald-600 shadow-sm mb-4">
                 <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest mb-1">Ride Earnings</p>
                 <p className="text-2xl font-black text-slate-900 dark:text-white">₹{stats?.totalEarnings?.toFixed(0) || '0'}</p>
                 <p className="text-[10px] font-bold text-emerald-600 mt-1">Gross fare amount</p>
              </div>
           </div>
           
           <div className="col-span-2 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] flex items-center justify-between group cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                    <ArrowUpRight className="w-6 h-6" />
                 </div>
                 <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Referral Bonus</h4>
                    <p className="text-xs text-slate-500 font-medium">Refer a driver & earn ₹1000</p>
                 </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-all group-hover:translate-x-1" />
           </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between px-2">
           <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Recent Activity</h3>
           <Button variant="ghost" className="text-indigo-600 font-bold">Statement</Button>
        </div>

        <div className="space-y-3">
          {history.length > 0 ? (
            history.map((trip, i) => (
              <motion.div 
                 key={trip.id}
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: i * 0.05 }}
                 className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 group hover:border-indigo-200 transition-colors cursor-pointer"
              >
                 <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform bg-slate-50 dark:bg-slate-800 text-slate-400">
                   <History className="w-6 h-6" />
                 </div>
                 <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                       <p className="font-bold text-slate-900 dark:text-white truncate">Ride Earning</p>
                       <p className="font-black text-slate-900 dark:text-white">₹{trip.fare.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                       <span>{new Date(trip.createdAt).toLocaleString()}</span>
                       <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600">COMPLETED</span>
                    </div>
                 </div>
              </motion.div>
            ))
          ) : (
            <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
               No Recent Activity
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
