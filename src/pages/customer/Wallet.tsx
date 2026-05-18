import React from 'react';
import { 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  Zap, 
  Gift, 
  MoreHorizontal,
  Wallet as WalletIcon,
  TrendingUp,
  History,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button, Card, Badge } from '../../components/ui';

import { customerWalletApi, TokenStore } from '../../lib/api';

export default function CustomerWallet() {
  const [balance, setBalance] = React.useState<number>(0);
  const [transactions, setTransactions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const customer = TokenStore.getCustomer();

  React.useEffect(() => {
    const loadWalletData = async () => {
      try {
        const [balanceRes, txRes] = await Promise.all([
          customerWalletApi.getBalance(),
          customerWalletApi.getTransactions(0, 10)
        ]);
        setBalance(balanceRes.data);
        setTransactions(txRes.data.content || []);
      } catch (err) {
        console.error('Failed to load wallet data', err);
      } finally {
        setLoading(false);
      }
    };
    loadWalletData();
  }, []);

  return (
    <div className="p-6 space-y-8 pb-10">
      
      {/* Header */}
      <div>
         <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Your Wallet</h1>
         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Manage your balance and rewards</p>
      </div>

      {/* Main Balance Card */}
      <Card className="bg-indigo-600 p-8 rounded-[3rem] text-white relative overflow-hidden transition-all hover:scale-[1.02] active:scale-95 cursor-pointer border-none shadow-2xl shadow-indigo-200 dark:shadow-none">
         <div className="relative z-10 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-white/20 rounded-[1.5rem] flex items-center justify-center backdrop-blur-md">
               <WalletIcon className="w-8 h-8" />
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Total Balance</p>
               <h2 className="text-5xl font-black italic tracking-tighter mt-1 leading-none italic">
                  ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
               </h2>
            </div>
            <div className="flex bg-white/10 backdrop-blur-md rounded-2xl p-1 gap-1">
               <Button className="bg-white text-indigo-600 hover:bg-slate-100 rounded-xl px-4 py-2 font-black text-[10px] uppercase tracking-widest h-auto border-none">
                  <Plus className="w-3 h-3 mr-1.5" /> ADD MONEY
               </Button>
               <Button variant="ghost" className="text-white hover:bg-white/10 rounded-xl px-4 py-2 font-black text-[10px] uppercase tracking-widest h-auto">
                  SEND
               </Button>
            </div>
         </div>
         {/* Decorative Circles */}
         <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
         <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-400/20 rounded-full -ml-12 -mb-12 blur-xl" />
      </Card>

      {/* Quick Actions / Stats */}
      <div className="grid grid-cols-2 gap-4">
         <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-[2.5rem] border border-emerald-100 dark:border-emerald-800 flex flex-col items-center text-emerald-600 gap-3">
            <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-md">
               <TrendingUp className="w-6 h-6" />
            </div>
            <div className="text-center">
               <p className="text-lg font-black italic tracking-tighter">₹{((customer?.totalRides || 0) * 15).toLocaleString()}</p>
               <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Total Savings</p>
            </div>
         </div>
         <div className="p-6 bg-amber-50 dark:bg-amber-900/10 rounded-[2.5rem] border border-amber-100 dark:border-amber-800 flex flex-col items-center text-amber-600 gap-3">
            <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-md">
               <Gift className="w-6 h-6" />
            </div>
            <div className="text-center">
               <p className="text-lg font-black italic tracking-tighter">{(customer?.totalRides || 0) * 10}</p>
               <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">Reward Points</p>
            </div>
         </div>
      </div>

      {/* Payment Methods */}
      <div className="space-y-4">
         <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">SAVED METHODS</h3>
            <Button variant="ghost" size="sm" className="text-indigo-600 text-[10px] font-black uppercase">+ NEW MAP</Button>
         </div>
         
         <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar no-scrollbar">
            {[
               { type: 'Visa', last4: '9021', color: 'bg-slate-900' },
               { type: 'MasterCard', last4: '8812', color: 'bg-slate-800' },
               { type: 'GPay UPI', last4: (customer?.name?.toLowerCase().replace(' ', '.') || 'user') + '@okaxis', color: 'bg-indigo-600' }
            ].map((card, i) => (
               <div key={i} className={`${card.color} text-white p-6 rounded-[2rem] w-64 h-36 flex flex-col justify-between flex-shrink-0 relative overflow-hidden shadow-xl shadow-slate-200/20 dark:shadow-none group cursor-pointer active:scale-95 transition-transform`}>
                  <div className="flex items-center justify-between relative z-10">
                     <CreditCard className="w-8 h-8 opacity-50" />
                     <Badge className="bg-white/20 text-white border-none font-bold text-[8px] tracking-widest uppercase">Default</Badge>
                  </div>
                  <div className="relative z-10">
                     <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest uppercase italic">{card.type}</p>
                     <p className="text-lg font-black tracking-tight mt-1">{card.type.includes('UPI') ? card.last4 : `•••• •••• •••• ${card.last4}`}</p>
                  </div>
                  {/* Decorative Spark */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
               </div>
            ))}
         </div>
      </div>

      {/* Transactions */}
      <div className="space-y-4">
         <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">RECENT TRANSACTIONS</h3>
            <History className="w-4 h-4 text-slate-300" />
         </div>
         
         <div className="space-y-3">
            {transactions.length > 0 ? (
               transactions.map((tx, i) => (
                 <motion.div 
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: i * 0.1 }}
                   key={tx.id}
                   className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm"
                 >
                    <div className="flex items-center gap-4">
                       <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center",
                          tx.type === 'CREDIT' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                       )}>
                          {tx.type === 'CREDIT' ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                       </div>
                       <div>
                          <h4 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-tight italic">{tx.description}</h4>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 tracking-[0.15em]">
                             {new Date(tx.timestamp).toLocaleString()}
                          </p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className={cn(
                          "font-black text-lg italic tracking-tighter",
                          tx.type === 'CREDIT' ? 'text-emerald-500' : 'text-slate-900 dark:text-white'
                       )}>
                          {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount}
                       </p>
                       <Badge variant="secondary" className="text-[8px] p-0 font-bold tracking-widest text-slate-300 bg-transparent">{tx.id.substring(tx.id.length - 6)}</Badge>
                    </div>
                 </motion.div>
               ))
            ) : (
               <div className="py-8 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                  No transactions yet
               </div>
            )}
         </div>
         
         <Button variant="ghost" className="w-full py-6 rounded-2xl font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">View All Transactions</Button>
      </div>

    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
