import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../../lib/utils';
import { 
  Users, UserCheck, ShieldCheck, Car, Clock, 
  AlertCircle, TrendingUp, MapPin, CheckCircle2 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart as RePieChart, Pie, Cell,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { Card, CardHeader, CardContent, StatsCard, Badge } from '../../../components/ui';
import { ONBOARDING_STATS, MOCK_APPLICATIONS } from './mockData';

import { onboardingApi } from '../../../lib/api';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function OnboardingOverview() {
  const [stats, setStats] = React.useState<any>(null);
  const [applications, setApplications] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, appsRes] = await Promise.all([
        onboardingApi.getStats(),
        onboardingApi.getApplications()
      ]);
      setStats(statsRes.data);
      setApplications(appsRes.data.slice(0, 5)); // Just take top 5 for recent
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch onboarding data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Clock className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  const STATUS_DATA = stats ? [
    { name: 'Approved', value: stats.approvedDrivers },
    { name: 'Pending', value: stats.pendingVerification },
    { name: 'Rejected', value: stats.rejectedApplications },
  ] : [];
const TREND_DATA = [
  { name: 'Mon', applications: 45, approved: 32 },
  { name: 'Tue', applications: 52, approved: 38 },
  { name: 'Wed', applications: 48, approved: 35 },
  { name: 'Thu', applications: 61, approved: 42 },
  { name: 'Fri', applications: 55, approved: 40 },
  { name: 'Sat', applications: 42, approved: 30 },
  { name: 'Sun', applications: 38, approved: 28 },
];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Onboarding Overview</h1>
          <p className="text-slate-500 dark:text-slate-400">Monitor and manage driver registration & verification pipeline.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="info" className="py-1.5 px-3">Live Feed</Badge>
          <span className="text-sm text-slate-500">Updated just now</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Total Applications" 
          value={stats?.totalRequests || 0} 
          icon={Users}
          trend={{ value: '12%', positive: true }}
          color="indigo"
        />
        <StatsCard 
          title="Pending Verification" 
          value={stats?.pendingVerification || 0} 
          icon={Clock}
          trend={{ value: '5%', positive: false }}
          color="amber"
        />
        <StatsCard 
          title="Approved Drivers" 
          value={stats?.approvedDrivers || 0} 
          icon={UserCheck}
          trend={{ value: '8%', positive: true }}
          color="green"
        />
        <StatsCard 
          title="Rejected Applications" 
          value={stats?.rejectedApplications || 0} 
          icon={AlertCircle}
          trend={{ value: '2%', positive: false }}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard 
          title="Vehicle Verification" 
          value={stats?.pendingVehicleVerification || 0} 
          icon={Car}
          color="blue"
        />
        <StatsCard 
          title="Awaiting Activation" 
          value={stats?.awaitingActivation || 0} 
          icon={ShieldCheck}
          color="indigo"
        />
        <StatsCard 
          title="Expired Documents" 
          value={stats?.expiredDocuments || 0} 
          icon={AlertCircle}
          color="red"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="text-lg font-bold">Registration Trends</h2>
            <select className="bg-transparent text-sm border-none focus:ring-0 text-slate-500">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={TREND_DATA}>
                  <defs>
                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="applications" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorApps)" />
                  <Area type="monotone" dataKey="approved" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorApproved)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-bold">Onboarding Funnel</h2>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row items-center justify-around">
            <div className="h-[300px] w-full max-w-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={STATUS_DATA}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {STATUS_DATA.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4 w-full max-w-[200px]">
              {STATUS_DATA.map((item: any, index: number) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                    <span className="text-sm text-slate-600 dark:text-slate-400">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="text-lg font-bold">Recent Applications</h2>
            <Link to="/admin/onboarding/applications" className="text-sm text-indigo-600 font-medium hover:underline">View All</Link>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Driver</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Vehicle</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Progress</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={app.driverSelfieImage || app.documents?.driverSelfie} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" alt="" />
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{app.name}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[100px]">{app.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium">{app.vehicleModel}</p>
                      <p className="text-xs text-slate-500">{app.vehicleNumber}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-full max-w-[100px]">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold text-indigo-600">{app.verificationProgress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 transition-all" style={{ width: `${app.verificationProgress}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={app.verificationStatus === 'APPROVED' ? 'success' : app.verificationStatus === 'REJECTED' ? 'error' : 'warning'}>
                        {app.verificationStatus.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Link to={`/admin/onboarding/applications/${app.id}`} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-indigo-600 inline-block">
                        <TrendingUp className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-bold">Verification Alerts</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { title: 'Invalid RC Image', driver: 'Suresh Patil', time: '10m ago', type: 'error' },
              { title: 'DL Expiring Soon', driver: 'Amit Verma', time: '45m ago', type: 'warning' },
              { title: 'Background Flag', driver: 'Rahul Kumar', time: '1h ago', type: 'error' },
              { title: 'Address Mismatch', driver: 'Priya S', time: '2h ago', type: 'warning' },
            ].map((alert, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className={cn("p-2 rounded-lg shrink-0", alert.type === 'error' ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600")}>
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold">{alert.title}</p>
                  <p className="text-xs text-slate-500">{alert.driver} • {alert.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
