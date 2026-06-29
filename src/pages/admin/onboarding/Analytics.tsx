import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart as RePieChart, Pie, Cell,
  LineChart, Line, AreaChart, Area, ComposedChart, Legend
} from 'recharts';
import { Card, CardHeader, CardContent, StatsCard, Badge } from '../../../components/ui';
import { ONBOARDING_STATS } from './mockData';
import { TrendingUp, Users, CheckCircle2, XCircle, Clock } from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const MONTHLY_DATA = [
  { month: 'Jan', apps: 120, approved: 95 },
  { month: 'Feb', apps: 150, approved: 110 },
  { month: 'Mar', apps: 200, approved: 140 },
  { month: 'Apr', apps: 180, approved: 135 },
  { month: 'May', apps: 250, approved: 180 },
  { month: 'Jun', apps: 300, approved: 210 },
];

const CATEGORY_DATA = [
  { name: 'Bike', value: 400 },
  { name: 'Auto', value: 300 },
  { name: 'Mini', value: 500 },
  { name: 'Sedan', value: 350 },
  { name: 'SUV', value: 150 },
];

const TIME_DATA = [
  { name: 'Docs', time: 24 },
  { name: 'Vehicle', time: 18 },
  { name: 'Background', time: 36 },
  { name: 'Final Review', time: 12 },
];

export default function OnboardingAnalytics() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Onboarding Analytics</h1>
          <p className="text-slate-500 dark:text-slate-400">Deep dive into conversion rates, processing times, and city-wise growth.</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="py-2 px-4">Q2 Performance: +18%</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Conversion Rate" value="78.4%" icon={TrendingUp} trend={{ value: '3.2%', positive: true }} color="indigo" />
        <StatsCard title="Avg. Onboarding Time" value="4.2 Days" icon={Clock} trend={{ value: '0.5d', positive: true }} color="blue" />
        <StatsCard title="Approval Velocity" value="45/day" icon={CheckCircle2} trend={{ value: '12%', positive: true }} color="green" />
        <StatsCard title="Drop-off Rate" value="12.5%" icon={XCircle} trend={{ value: '1.2%', positive: false }} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-bold">Growth & Approvals</h2>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={MONTHLY_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="top" align="right" height={36}/>
                  <Bar dataKey="apps" name="Applications" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                  <Line type="monotone" dataKey="approved" name="Approved" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-bold">Category Distribution</h2>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CATEGORY_DATA} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} width={60} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {CATEGORY_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="text-lg font-bold">Verification Bottlenecks (Avg. Hours)</h2>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={TIME_DATA}>
                  <defs>
                    <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip />
                  <Area type="monotone" dataKey="time" stroke="#f59e0b" strokeWidth={3} fill="url(#colorTime)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-bold">Processing Efficiency</h2>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-medium">Automatic Approval</span>
                <span className="font-bold">65%</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500" style={{ width: '65%' }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-medium">Manual Review</span>
                <span className="font-bold">28%</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: '28%' }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-medium">Flagged/Rejected</span>
                <span className="font-bold">7%</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-red-500" style={{ width: '7%' }} />
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center text-emerald-600">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold uppercase">Efficiency Peak</p>
                  <p className="text-sm font-bold">12% higher than last month</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
