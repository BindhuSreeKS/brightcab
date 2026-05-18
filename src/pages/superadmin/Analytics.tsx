import React from 'react';
import { 
  PieChart as PieChartIcon, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Car, 
  Users, 
  MapPin, 
  Download, 
  Calendar,
  ChevronDown
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';
import { Card, CardHeader, CardContent, Button, StatsCard } from '../../components/ui';

const REVENUE_DATA = [
  { name: 'Jan', revenue: 450000, rides: 1200 },
  { name: 'Feb', revenue: 520000, rides: 1400 },
  { name: 'Mar', revenue: 480000, rides: 1300 },
  { name: 'Apr', revenue: 610000, rides: 1800 },
  { name: 'May', revenue: 550000, rides: 1600 },
  { name: 'Jun', revenue: 670000, rides: 2100 },
];

const CATEGORY_DATA = [
  { name: 'Economy', value: 45, color: '#6366f1' },
  { name: 'Sedan', value: 30, color: '#10b981' },
  { name: 'SUV', value: 15, color: '#f59e0b' },
  { name: 'Auto', value: 10, color: '#ec4899' },
];

const CITY_PERFORMANCE = [
  { city: 'Mumbai', revenue: '₹42.5L', growth: '+12%', rides: '45k' },
  { city: 'Delhi', revenue: '₹38.2L', growth: '+8%', rides: '38k' },
  { city: 'Bangalore', revenue: '₹35.8L', growth: '+15%', rides: '32k' },
  { city: 'Pune', revenue: '₹18.4L', growth: '-2%', rides: '15k' },
];

export default function PlatformAnalytics() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Revenue & Platform Analytics</h1>
          <p className="text-slate-500 dark:text-slate-400">Comprehensive insights into platform performance and growth</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Last 30 Days
            <ChevronDown className="w-4 h-4" />
          </Button>
          <Button className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Reports
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Revenue" value="₹1.2Cr" icon={DollarSign} color="indigo" trend={{ value: '+14%', positive: true }} />
        <StatsCard title="Platform Commission" value="₹24.5L" icon={TrendingUp} color="green" trend={{ value: '+11%', positive: true }} />
        <StatsCard title="Total Ride Requests" value="1.5M" icon={Car} color="blue" trend={{ value: '+22%', positive: true }} />
        <StatsCard title="Customer Spending" value="₹850 / ride" icon={Users} color="orange" trend={{ value: '+4%', positive: true }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trends */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Revenue Trends</h2>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500" />
                <span>Gross Revenue</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={REVENUE_DATA}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `₹${value/1000}k`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Ride Category Distribution */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Ride Categories</h2>
            <p className="text-sm text-slate-500">Distribution by vehicle type</p>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={CATEGORY_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {CATEGORY_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 space-y-3">
              {CATEGORY_DATA.map((cat, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-sm text-slate-600 dark:text-slate-400">{cat.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{cat.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* City Performance Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Top Performing Cities</h2>
            <Button variant="ghost" size="sm" className="text-indigo-600">View All Cities</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {CITY_PERFORMANCE.map((city, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">{city.city}</h4>
                      <p className="text-xs text-slate-500">{city.rides} rides this month</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 dark:text-white">{city.revenue}</p>
                    <p className={`text-xs font-medium ${city.growth.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
                      {city.growth} growth
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Growth Forecast */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Growth Forecast</h2>
            <p className="text-sm text-slate-500">Predicted platform metrics based on current trends</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { label: 'Projected Monthly Revenue', target: '₹1.5Cr', progress: 80, color: 'bg-indigo-500' },
                { label: 'Active Driver Growth', target: '25,000', progress: 65, color: 'bg-emerald-500' },
                { label: 'Customer Retention Rate', target: '70%', progress: 92, color: 'bg-blue-500' }
              ].map((metric, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{metric.label}</span>
                    <span className="text-sm font-bold text-indigo-600">{metric.target}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${metric.color} transition-all duration-1000`} style={{ width: `${metric.progress}%` }} />
                  </div>
                  <p className="text-xs text-slate-500 text-right">{metric.progress}% of goal achieved</p>
                </div>
              ))}

              <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/20 mt-4">
                <div className="flex gap-3">
                  <TrendingUp className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                  <p className="text-sm text-indigo-900 dark:text-indigo-400">
                    Platform health is <strong>Excellent</strong>. Predicted 12% revenue increase next month due to upcoming holiday season campaigns.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
