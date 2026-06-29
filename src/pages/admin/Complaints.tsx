import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, ShieldCheck, Ticket, MessageSquare, Search, Eye, AlertCircle, Phone, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardContent, Button, Badge, Table, StatsCard } from '../../components/ui';
import { formatDate } from '../../lib/utils';
import { complaintsApi } from '../../lib/api';

const ComplaintManagement = () => {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [sosAlerts, setSosAlerts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [compRes, statsRes, sosRes] = await Promise.all([
        complaintsApi.getAll({ size: 50 }),
        complaintsApi.getStats(),
        complaintsApi.getSos()
      ]);
      setComplaints(compRes.data.content);
      setStats(statsRes.data);
      setSosAlerts(sosRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleResolve = async (id: string) => {
    const resolution = prompt('Enter resolution notes:');
    if (!resolution) return;
    try {
      await complaintsApi.resolve(id, resolution);
      fetchData();
    } catch (err) {
      alert('Failed to resolve');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Complaints & Safety</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage support tickets and monitor passenger safety SOS alerts.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={fetchData} disabled={loading} className="flex gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Sync
          </Button>
          {sosAlerts.length > 0 && (
            <Button variant="danger" className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>Active SOS ({sosAlerts.length})</span>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Tickets" value={stats?.total || 0} icon={Ticket} color="indigo" />
        <StatsCard title="Open Tickets" value={stats?.open || 0} icon={MessageSquare} color="amber" />
        <StatsCard title="Safety Alerts" value={stats?.sos || 0} icon={AlertTriangle} color="red" />
        <StatsCard title="Resolved" value={stats?.resolved || 0} icon={ShieldCheck} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white">Support Tickets</h3>
            <div className="flex items-center gap-2">
               <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <input type="text" placeholder="Search tickets..." className="pl-9 pr-4 py-1.5 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-xs" />
               </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table headers={['Ticket ID', 'Issue Type', 'Participants', 'Status', 'Actions']}>
               {loading ? (
                 <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">Loading complaints...</td></tr>
               ) : complaints.length === 0 ? (
                 <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">No complaints found</td></tr>
               ) : complaints.map(c => (
                 <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                   <td className="px-6 py-4 font-bold text-indigo-600">#{c.id?.slice(-6)}</td>
                   <td className="px-6 py-4">
                     <p className="text-sm font-semibold text-slate-900 dark:text-white">{c.type}</p>
                     <p className="text-[10px] text-slate-500">{formatDate(c.createdAt)}</p>
                   </td>
                   <td className="px-6 py-4">
                     <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Customer: {c.customerId?.slice(-6)}</p>
                     {c.driverId && <p className="text-[10px] text-slate-500">Driver: {c.driverId?.slice(-6)}</p>}
                   </td>
                   <td className="px-6 py-4">
                     <Badge variant={c.status === 'RESOLVED' ? 'success' : c.status === 'OPEN' ? 'warning' : 'error'}>
                       {c.status}
                     </Badge>
                   </td>
                   <td className="px-6 py-4">
                     <div className="flex items-center gap-2">
                       <Button variant="ghost" size="icon"><Eye className="w-4 h-4" /></Button>
                       {c.status !== 'RESOLVED' && (
                         <Button variant="ghost" size="sm" onClick={() => handleResolve(c.id)} className="text-emerald-600 text-xs font-semibold">Resolve</Button>
                       )}
                     </div>
                   </td>
                 </tr>
               ))}
            </Table>
          </CardContent>
        </Card>

        <Card className="border-red-100 dark:border-red-900/30">
          <CardHeader className="bg-red-50 dark:bg-red-900/10 border-b border-red-100 dark:border-red-900/30">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold">Urgent SOS Alerts</h3>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {sosAlerts.length === 0 ? (
              <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl">
                 <p className="text-center text-xs text-slate-500">No active safety alerts. All safe.</p>
              </div>
            ) : sosAlerts.map(sos => (
              <div key={sos.id} className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-600">RIDE #{sos.rideId?.slice(-6) || 'N/A'}</span>
                  <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full animate-pulse">EMERGENCY</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Customer: {sos.customerId?.slice(-6)}</p>
                  <p className="text-xs text-slate-500">Subject: {sos.subject}</p>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Button variant="danger" size="sm" className="w-full flex items-center gap-2">
                     <Phone className="w-4 h-4" /> Call
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleResolve(sos.id)} className="w-full border-red-200 text-red-600">Resolve</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComplaintManagement;
