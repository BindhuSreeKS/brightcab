import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart2, TrendingUp, DollarSign, Car, Users, UserCheck,
  Download, RefreshCw, Calendar, AlertTriangle, ArrowUpRight,
  ArrowDownRight, FileText, PieChart, Activity
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Card, CardHeader, CardContent, Button, Badge, StatsCard } from '../../components/ui';
import { formatCurrency, formatDate } from '../../lib/utils';
import { dashboardApi, ridesApi, paymentsApi, driversApi, customersApi } from '../../lib/api';

// ─── Fallback data ────────────────────────────────────────────────────────────
const REVENUE_WEEKLY = [
  { name: 'Mon', revenue: 42000, rides: 210 },
  { name: 'Tue', revenue: 38500, rides: 190 },
  { name: 'Wed', revenue: 51200, rides: 256 },
  { name: 'Thu', revenue: 47800, rides: 238 },
  { name: 'Fri', revenue: 62100, rides: 305 },
  { name: 'Sat', revenue: 71400, rides: 357 },
  { name: 'Sun', revenue: 59300, rides: 294 },
];

const MONTHLY_DATA = [
  { name: 'Jan', revenue: 380000, rides: 1820 },
  { name: 'Feb', revenue: 420000, rides: 2010 },
  { name: 'Mar', revenue: 510000, rides: 2450 },
  { name: 'Apr', revenue: 490000, rides: 2340 },
  { name: 'May', revenue: 625000, rides: 2980 },
  { name: 'Jun', revenue: 580000, rides: 2760 },
];

const RIDE_STATUS_DATA = [
  { name: 'Completed', value: 68, color: '#10b981' },
  { name: 'Cancelled',  value: 18, color: '#ef4444' },
  { name: 'Active',     value: 8,  color: '#6366f1' },
  { name: 'Pending',    value: 6,  color: '#f59e0b' },
];

const VEHICLE_DATA = [
  { name: 'Mini',    value: 42, color: '#6366f1' },
  { name: 'Sedan',   value: 31, color: '#10b981' },
  { name: 'SUV',     value: 18, color: '#f59e0b' },
  { name: 'Auto',    value: 9,  color: '#ec4899' },
];

type Period = 'week' | 'month';

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-xl text-white text-xs space-y-1">
      <p className="font-bold text-slate-300 mb-1">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-slate-400">{p.name}:</span>
          <span className="font-semibold">
            {p.dataKey === 'revenue' ? formatCurrency(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── StatDelta ────────────────────────────────────────────────────────────────
const StatDelta = ({ pct, positive }: { pct: string; positive: boolean }) => (
  <span className={`flex items-center gap-0.5 text-xs font-semibold ${positive ? 'text-emerald-500' : 'text-red-500'}`}>
    {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
    {pct}
  </span>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const ReportsAnalytics = () => {
  const [period, setPeriod] = useState<Period>('week');
  const [stats, setStats] = useState<any>(null);
  const [rideStats, setRideStats] = useState<any>(null);
  const [driverStats, setDriverStats] = useState<any>(null);
  const [customerStats, setCustomerStats] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [dashRes, rideRes, driverRes, customerRes] = await Promise.allSettled([
        dashboardApi.getAdminStats(),
        ridesApi.getStats(),
        driversApi.getStats(),
        customersApi.getStats(),
      ]);

      if (dashRes.status === 'fulfilled')    setStats(dashRes.value.data);
      if (rideRes.status === 'fulfilled')    setRideStats(rideRes.value.data);
      if (driverRes.status === 'fulfilled')  setDriverStats(driverRes.value.data);
      if (customerRes.status === 'fulfilled') setCustomerStats(customerRes.value.data);

      setRevenueData(period === 'week' ? REVENUE_WEEKLY : MONTHLY_DATA);
    } catch (e: any) {
      setError(e.message || 'Failed to load report data');
      setRevenueData(period === 'week' ? REVENUE_WEEKLY : MONTHLY_DATA);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleExport = (type: 'csv' | 'pdf') => {
    const rows = [
      ['Period', 'Revenue', 'Rides'],
      ...revenueData.map(r => [r.name, r.revenue, r.rides]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `cabgo-report-${period}.${type}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalRevenue   = stats?.totalRevenue    ?? 0;
  const totalRides     = stats?.totalRides       ?? 0;
  const onlineDrivers  = stats?.onlineDrivers    ?? 0;
  const totalCustomers = stats?.totalCustomers   ?? 0;

  const summaryCards = [
    { title: 'Total Revenue',    value: loading ? '...' : formatCurrency(totalRevenue),          icon: DollarSign, color: 'green',  delta: { pct: '12.4%', positive: true  } },
    { title: 'Total Rides',      value: loading ? '...' : totalRides.toLocaleString(),           icon: Car,        color: 'indigo', delta: { pct: '8.1%',  positive: true  } },
    { title: 'Active Drivers',   value: loading ? '...' : onlineDrivers.toLocaleString(),        icon: UserCheck,  color: 'blue',   delta: { pct: '3.2%',  positive: true  } },
    { title: 'Total Customers',  value: loading ? '...' : totalCustomers.toLocaleString(),       icon: Users,      color: 'amber',  delta: { pct: '0.8%',  positive: false } },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reports &amp; Analytics</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Comprehensive performance metrics and platform health overview.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Period toggle */}
          <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            {(['week', 'month'] as Period[]).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 text-xs font-semibold capitalize transition-colors ${
                  period === p
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {p === 'week' ? 'This Week' : 'This Month'}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading} className="flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('csv')} className="flex items-center gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-700 dark:text-amber-400 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {error} — showing demo data.
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map(card => (
          <React.Fragment key={card.title}>
            <Card className="hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{card.title}</p>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{card.value}</h3>
                  <div className="mt-1.5">
                    <StatDelta pct={card.delta.pct} positive={card.delta.positive} />
                  </div>
                </div>
                <div className={`p-3 rounded-xl ${
                  card.color === 'green'  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' :
                  card.color === 'indigo' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600'   :
                  card.color === 'blue'   ? 'bg-sky-50 dark:bg-sky-900/20 text-sky-600'             :
                                            'bg-amber-50 dark:bg-amber-900/20 text-amber-600'
                }`}>
                  <card.icon className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          </React.Fragment>
        ))}
      </div>

      {/* Revenue & Rides Area Chart */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
              <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Revenue &amp; Ride Trends</h3>
              <p className="text-xs text-slate-500">{period === 'week' ? 'Last 7 days' : 'Last 6 months'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-500"><span className="w-3 h-1 rounded bg-indigo-500 inline-block" />Revenue</span>
            <span className="flex items-center gap-1.5 text-slate-500"><span className="w-3 h-1 rounded bg-emerald-500 inline-block" />Rides</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}    />
                  </linearGradient>
                  <linearGradient id="rideGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={8} />
                <YAxis yAxisId="rev"   axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <YAxis yAxisId="rides" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} orientation="right" />
                <Tooltip content={<ChartTooltip />} />
                <Area yAxisId="rev"   type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#revGrad)"  name="Revenue" />
                <Area yAxisId="rides" type="monotone" dataKey="rides"   stroke="#10b981" strokeWidth={2.5} fill="url(#rideGrad)" name="Rides" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Pie charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Ride Status */}
        <Card>
          <CardHeader className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-900/20">
              <PieChart className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">Ride Status Distribution</h3>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="h-[200px] w-[200px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie data={RIDE_STATUS_DATA} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                      {RIDE_STATUS_DATA.map((entry, i) => (
                        <Cell key={i} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => [`${v}%`, '']} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3 flex-1">
                {RIDE_STATUS_DATA.map(item => (
                  <div key={item.name} className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
                        <span className="text-slate-500 font-semibold">{item.value}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Type */}
        <Card>
          <CardHeader className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
              <Car className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">Vehicle Type Breakdown</h3>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={VEHICLE_DATA} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `${v}%`} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} width={45} />
                  <Tooltip formatter={(v: any) => [`${v}%`, 'Share']} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                    {VEHICLE_DATA.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metrics table */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20">
              <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">Performance Summary</h3>
          </div>
          <Badge variant="info" className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {period === 'week' ? 'Weekly' : 'Monthly'}
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  {['Metric', 'Current Period', 'Previous Period', 'Change', 'Status'].map(h => (
                    <th key={h} className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {[
                  { metric: 'Gross Revenue',       curr: formatCurrency(totalRevenue),         prev: formatCurrency(totalRevenue * 0.87), delta: '+12.4%', positive: true  },
                  { metric: 'Completed Rides',      curr: (stats?.completedRides ?? 1842).toLocaleString(), prev: '1,703',                delta: '+8.1%',  positive: true  },
                  { metric: 'Cancellation Rate',    curr: '18.2%',                              prev: '20.1%',                            delta: '-1.9%',  positive: true  },
                  { metric: 'Avg Fare per Ride',    curr: formatCurrency(totalRevenue / Math.max(totalRides, 1)), prev: '₹245.00',        delta: '+4.3%',  positive: true  },
                  { metric: 'Driver Utilisation',   curr: `${onlineDrivers} online`,             prev: `${Math.max(onlineDrivers - 5, 0)} online`, delta: '+3.2%', positive: true },
                  { metric: 'New Customer Sign-ups',curr: (stats?.newCustomers ?? 312).toLocaleString(), prev: '289',                    delta: '+7.9%',  positive: true  },
                  { metric: 'Platform Commission',  curr: formatCurrency(totalRevenue * 0.15),  prev: formatCurrency(totalRevenue * 0.13), delta: '+15.1%', positive: true  },
                  { metric: 'Avg Rating',           curr: '4.7 ⭐',                             prev: '4.6 ⭐',                           delta: '+0.1',   positive: true  },
                ].map(row => (
                  <tr key={row.metric} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">{row.metric}</td>
                    <td className="px-6 py-4 text-sm font-bold text-indigo-600 dark:text-indigo-400">{row.curr}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{row.prev}</td>
                    <td className="px-6 py-4">
                      <StatDelta pct={row.delta} positive={row.positive} />
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={row.positive ? 'success' : 'error'}>{row.positive ? 'Improving' : 'Declining'}</Badge>
                    </td>
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

export default ReportsAnalytics;
