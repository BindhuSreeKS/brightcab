import React, { useEffect, useState, useCallback } from 'react';
import {
  Users, Car, DollarSign, TrendingUp, MapPin,
  AlertCircle, Clock, CheckCircle2, Trophy,
  ArrowUpRight, ShieldCheck, Zap, Activity, Map as MapIcon,
  RefreshCw
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardContent, Badge, StatsCard, Button } from '../../components/ui';
import { dashboardApi, auditApi } from '../../lib/api';
import { formatCurrency, formatDate } from '../../lib/utils';

export default function SuperAdminOverview() {
  const [stats, setStats] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, auditRes, chartRes, citiesRes] = await Promise.all([
        dashboardApi.getSuperAdminStats(),
        auditApi.getAll(0, 5),
        dashboardApi.getChartData(),
        dashboardApi.getCityPerformance()
      ]);
      setStats(statsRes.data);
      setAuditLogs(auditRes.data?.content || []);
      setChartData(chartRes.data || []);
      setCities(citiesRes.data || []);
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Platform Control Center</h1>
          <p className="text-slate-500 dark:text-slate-400">Holistic view across all cities and administrative domains</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading} className="flex gap-2 mr-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Sync
          </Button>
          <Badge variant="success" className="animate-pulse h-8 px-4 flex items-center">Live: {stats?.activeRides || 0} Online Rides</Badge>
          <Button variant="outline" size="sm">Download Global Report</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard title="Total Revenue" value={loading ? '...' : formatCurrency(stats?.totalRevenue || 0)} icon={DollarSign} color="indigo" trend={{ value: '+12.5%', positive: true }} />
        <StatsCard title="Total Rides" value={loading ? '...' : (stats?.totalRides || 0).toLocaleString()} icon={Car} color="blue" trend={{ value: '+8.2%', positive: true }} />
        <StatsCard title="Total Drivers" value={loading ? '...' : (stats?.totalDrivers || 0).toLocaleString()} icon={Users} color="purple" />
        <StatsCard title="Platform Commission" value={loading ? '...' : formatCurrency(stats?.platformCommission || 0)} icon={TrendingUp} color="green" />
        <StatsCard title="Sys Status" value="Healthy" icon={Zap} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Revenue Performance</h2>
              <p className="text-sm text-slate-500">Weekly platform gross revenue across all zones</p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost">Daily</Button>
              <Button size="sm" variant="outline">Weekly</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `₹${value}`} />
                  <Tooltip formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Live Activity Feed</h2>
            <p className="text-sm text-slate-500">Real-time administrative operations</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {loading ? (
                <p className="text-sm text-slate-500 text-center py-4">Loading logs...</p>
              ) : auditLogs.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">No recent activity</p>
              ) : auditLogs.map((log) => (
                <div key={log.id} className="relative pl-6 pb-6 last:pb-0 border-l border-slate-100 dark:border-slate-800">
                  <div className={`absolute -left-1.5 top-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${
                    log.action === 'UPDATE' ? 'bg-amber-500' :
                    log.action === 'DELETE' ? 'bg-red-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-slate-900 dark:text-white">{log.adminName || log.adminId?.slice(-6) || 'Admin'}</span>
                      <span className="text-xs text-slate-400">{formatDate(log.createdAt)}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{log.details || `${log.action} ${log.module}`}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4 text-xs" onClick={() => window.location.href = '/super-admin/audit'}>View All Logs</Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Top Performance Zones</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                 <p className="text-sm text-slate-500 text-center py-4">Loading zones...</p>
              ) : cities.length === 0 ? (
                 <p className="text-sm text-slate-500 text-center py-4">No zone data available</p>
              ) : cities.map((cityData, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="font-medium text-slate-900 dark:text-white">{cityData.city}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold">{cityData.rides} Rides</span>
                    <Badge variant="success">{cityData.growth}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Platform Health</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-emerald-50/20">
                <div className="flex items-center gap-2 mb-2 text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Payments</span>
                </div>
                <p className="text-lg font-bold text-slate-900 dark:text-white">Active</p>
                <p className="text-[10px] text-slate-500 line-clamp-1 text-xs">Last transaction: {stats?.todayRevenue > 0 ? 'Recently' : 'No data'}</p>
              </div>
              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-indigo-50/20">
                <div className="flex items-center gap-2 mb-2 text-indigo-600">
                  <Activity className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">SMS Gateway</span>
                </div>
                <p className="text-lg font-bold text-slate-900 dark:text-white">Ready</p>
                <p className="text-[10px] text-slate-500 line-clamp-1 text-xs">99.8% Success</p>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <div className="flex items-center justify-between text-sm text-xs">
                <span className="text-slate-500">API Response Time</span>
                <span className="font-bold text-emerald-500">{Math.floor(Math.random() * 20 + 30)}ms</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: '92%' }} />
              </div>
              <div className="flex items-center justify-between text-sm text-xs">
                <span className="text-slate-500">Active Rides Load</span>
                <span className="font-bold text-amber-500">{stats?.activeRides || 0}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: `${Math.min(((stats?.activeRides || 0) / 100) * 100, 100)}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-100 bg-amber-50/20 dark:bg-amber-900/10 dark:border-amber-900/20">
          <CardHeader className="flex flex-row items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-semibold text-amber-900 dark:text-amber-400">System Alerts</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-white dark:bg-slate-900 shadow-sm border border-amber-100 dark:border-amber-900/30 font-medium">
                <p className="font-bold text-sm text-slate-900 dark:text-white mb-1">New Driver Signups Pending</p>
                <p className="text-xs text-slate-500 mb-2 truncate">{stats?.pendingDriverVerifications || 0} drivers waiting for verification</p>
                <Badge variant="warning" className="text-[10px]">Action Required</Badge>
              </div>
              {stats?.openComplaints > 0 && (
                <div className="p-3 rounded-lg bg-white dark:bg-slate-900 shadow-sm border border-amber-100 dark:border-amber-900/30 font-medium">
                  <p className="font-bold text-sm text-slate-900 dark:text-white mb-1">Unresolved Complaints</p>
                  <p className="text-xs text-slate-500 mb-2 truncate">{stats?.openComplaints} tickets need attention</p>
                  <Badge variant="warning" className="text-[10px]">Urgent</Badge>
                </div>
              )}
            </div>
            <Button size="sm" className="w-full mt-4 bg-amber-600 hover:bg-amber-700 text-white border-none">Open Monitoring Center</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
