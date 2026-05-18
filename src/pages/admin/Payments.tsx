import React, { useState, useEffect, useCallback } from 'react';
import { CreditCard, DollarSign, ArrowUpRight, ArrowDownRight, Search, Download, Filter, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardContent, Button, Badge, Table, StatsCard } from '../../components/ui';
import { formatCurrency, formatDate } from '../../lib/utils';
import { paymentsApi } from '../../lib/api';

const PaymentManagement = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [revenueStats, setRevenueStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [payRes, revRes] = await Promise.all([
        paymentsApi.getAll({ size: 50 }),
        paymentsApi.getRevenue()
      ]);
      setPayments(payRes.data.content);
      setRevenueStats(revRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Payment Management</h1>
          <p className="text-slate-500 dark:text-slate-400">Track all financial transactions and platform revenue.</p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={loading} className="flex gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Sync
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Revenue" value={formatCurrency(revenueStats?.totalRevenue || 0)} icon={DollarSign} color="green" />
        <StatsCard title="Platform Commission" value={formatCurrency(revenueStats?.totalCommission || 0)} icon={CreditCard} color="indigo" />
        <StatsCard title="Total Transactions" value={revenueStats?.totalTransactions || 0} icon={ArrowUpRight} color="blue" />
        <StatsCard title="Refunds Issued" value={revenueStats?.refundedTransactions || 0} icon={ArrowDownRight} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <Card className="lg:col-span-2">
            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h3 className="font-bold text-slate-900 dark:text-white">Transaction History</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Download className="w-4 h-4" /> Export
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
               <Table headers={['Transaction ID', 'Details', 'Amount', 'Comm.', 'Status', 'Date']}>
                  {loading ? (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">Loading transactions...</td></tr>
                  ) : payments.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">No transactions found</td></tr>
                  ) : payments.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-indigo-600 dark:text-indigo-400">#{tx.id?.slice(-6)}</td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900 dark:text-white">{tx.paymentMethod || 'WALLET'}</p>
                        <p className="text-xs text-slate-500">Ride: {tx.rideId?.slice(-6) || 'N/A'}</p>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{formatCurrency(tx.amount || 0)}</td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-500 dark:text-slate-400">{formatCurrency(tx.platformCommission || 0)}</td>
                      <td className="px-6 py-4">
                        <Badge variant={tx.status === 'COMPLETED' ? 'success' : tx.status === 'PENDING' ? 'warning' : 'error'}>
                          {tx.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">{formatDate(tx.createdAt)}</td>
                    </tr>
                  ))}
               </Table>
            </CardContent>
         </Card>

         <div className="space-y-6">
            <Card className="bg-slate-900 text-white border-none">
              <CardContent className="p-6">
                 <div className="flex items-center gap-3 mb-4">
                   <div className="p-2 bg-indigo-600 rounded-lg">
                     <CreditCard className="w-5 h-5" />
                   </div>
                   <h3 className="font-bold">Platform Wallet</h3>
                 </div>
                 <p className="text-slate-400 text-xs mb-1">Total Commission Earned</p>
                 <h4 className="text-3xl font-bold mb-6">{formatCurrency(revenueStats?.totalCommission || 0)}</h4>
                 <div className="flex gap-4">
                   <div className="flex-1">
                     <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Gross Vol</p>
                     <p className="text-sm font-bold text-emerald-400">{formatCurrency(revenueStats?.totalRevenue || 0)}</p>
                   </div>
                 </div>
              </CardContent>
            </Card>
         </div>
      </div>
    </div>
  );
};

export default PaymentManagement;
