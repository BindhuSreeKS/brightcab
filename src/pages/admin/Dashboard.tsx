import React, { useEffect, useState, useCallback } from 'react';
import {
  Car, Users, UserCheck, DollarSign, Activity,
  TrendingUp, RefreshCw, Calendar, AlertTriangle
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { Card, CardHeader, CardContent, StatsCard, Badge, Button } from '../../components/ui';
import { formatCurrency, formatDate } from '../../lib/utils';
import { dashboardApi, ridesApi } from '../../lib/api';

const REVENUE_DATA = [
  { name: 'Mon', value: 4200 }, { name: 'Tue', value: 3800 },
  { name: 'Wed', value: 5100 }, { name: 'Thu', value: 4700 },
  { name: 'Fri', value: 6200 }, { name: 'Sat', value: 7100 },
  { name: 'Sun', value: 5900 },
];

const RIDE_STATS_DATA = [
  { name: 'Active', value: 0, color: '#6366f1' },
  { name: 'Completed', value: 0, color: '#10b981' },
  { name: 'Cancelled', value: 0, color: '#ef4444' },
];

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [recentRides, setRecentRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, ridesRes] = await Promise.all([
        dashboardApi.getAdminStats(),
        ridesApi.getAll({ page: 0, size: 5 }),
      ]);
      setStats(statsRes.data);
      setRecentRides(ridesRes.data?.content ?? []);
    } catch (e: any) {
      setError(e.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const rideBarData = stats ? [
    { name: 'Active', value: Number(stats.activeRides) || 0, color: '#6366f1' },
    { name: 'Completed', value: Number(stats.completedRides) || 0, color: '#10b981' },
    { name: 'Cancelled', value: Number(stats.cancelledRides) || 0, color: '#ef4444' },
  ] : RIDE_STATS_DATA;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h1>
          <p className="text-slate-500 dark:text-slate-400">Welcome back — here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading} className="flex gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Sync Data
          </Button>
          <Badge variant="info" className="py-2 px-4 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </Badge>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-700 dark:text-amber-400 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error} — showing cached data if available.
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Revenue"
          value={loading ? '...' : formatCurrency(stats?.totalRevenue ?? 0)}
          icon={DollarSign}
          trend={{ value: '12%', positive: true }}
          color="green"
        />
        <StatsCard
          title="Total Rides"
          value={loading ? '...' : (stats?.totalRides ?? 0).toLocaleString()}
          icon={Car}
          trend={{ value: '8%', positive: true }}
          color="indigo"
        />
        <StatsCard
          title="Online Drivers"
          value={loading ? '...' : (stats?.onlineDrivers ?? 0).toLocaleString()}
          icon={UserCheck}
          trend={{ value: '5%', positive: true }}
          color="blue"
        />
        <StatsCard
          title="Total Customers"
          value={loading ? '...' : (stats?.totalCustomers ?? 0).toLocaleString()}
          icon={Activity}
          trend={{ value: '2%', positive: true }}
          color="amber"
        />
      </div>

      {/* Secondary stats row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Active Rides', value: stats.activeRides, color: 'bg-indigo-500' },
            { label: 'Completed Today', value: stats.todayRides, color: 'bg-emerald-500' },
            { label: 'Open Complaints', value: stats.openComplaints, color: 'bg-amber-500' },
            { label: 'SOS Alerts', value: stats.sosAlerts, color: 'bg-red-500' },
          ].map((item) => (
            <div key={item.label} className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
              <div className={`w-2 h-2 rounded-full ${item.color} mb-2`} />
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{item.value ?? 0}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{item.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white">Weekly Revenue Trend</h3>
            <Badge variant="success" className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /><span>+14.5%</span>
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={REVENUE_DATA}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h3 className="font-bold text-slate-900 dark:text-white">Ride Breakdown</h3></CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rideBarData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {rideBarData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              {rideBarData.map(entry => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Rides */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white">Recent Rides</h3>
          <a href="/admin/rides" className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold hover:underline">View All →</a>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  {['Ride ID', 'Customer', 'Route', 'Status', 'Fare', 'Time'].map(h => (
                    <th key={h} className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400 text-sm">Loading rides...</td></tr>
                ) : recentRides.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400 text-sm">No rides yet</td></tr>
                ) : recentRides.map((ride: any) => (
                  <tr key={ride.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-indigo-600 dark:text-indigo-400">#{ride.id?.slice(-6)}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">{ride.customerName}</td>
                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 max-w-[200px]">
                      <p className="truncate">{ride.pickupLocation}</p>
                      <p className="truncate text-slate-400">→ {ride.dropLocation}</p>
                    </td>
                    <td className="px-6 py-4"><Badge variant="info">{ride.status}</Badge></td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(ride.fare)}</td>
                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">{formatDate(ride.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
