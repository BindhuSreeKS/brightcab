import React, { useEffect, useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Eye, 
  Activity, 
  Zap, 
  Lock, 
  UserX, 
  Map,
  CheckCircle2,
  XCircle,
  Bell,
  RefreshCw
} from 'lucide-react';
import { Card, CardHeader, CardContent, Button, Badge, StatsCard } from '../../components/ui';

export default function SecurityMonitoring() {
  const [monitorData, setMonitorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchMonitoringData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/super-admin/monitoring');
      const data = await response.json();
      setMonitorData(data);
    } catch (err) {
      console.error('Error fetching monitoring data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitoringData();
  }, []);

  const services = monitorData?.services || [
    { name: "Auth Service", status: "Healthy", uptime: "14d 6h" },
    { name: "Payment Gateway", status: "Healthy", uptime: "30d 12h" },
    { name: "Map API", status: "Healthy", uptime: "125d 2h" },
    { name: "Notification Engine", status: "Warning", uptime: "2h 15m" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Security & Monitoring</h1>
          <p className="text-slate-500 dark:text-slate-400">Platform health, fraud detection, and system uptime</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchMonitoringData} disabled={loading} className="flex gap-2">
            <RefreshCw className={loading ? 'animate-spin' : ''} />
            Refresh
          </Button>
          <Badge variant={monitorData?.dbStatus === 'Connected' ? "success" : "warning"} className="h-8 px-4 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            DB: {monitorData?.dbStatus || "Unknown"}
          </Badge>
          <Button className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Alert Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Security Score" value="98/100" icon={ShieldAlert} color="green" />
        <StatsCard title="Fraud Alerts" value="2" icon={AlertTriangle} color="orange" trend={{ value: '-5', positive: true }} />
        <StatsCard title="Suspicious Logins" value="15" icon={Lock} color="blue" />
        <StatsCard title="System Uptime" value="99.99%" icon={Zap} color="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent System Audit Logs</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">Active Alerts</Button>
              <Button variant="ghost" size="sm">History</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(monitorData?.recentLogs?.length > 0 ? monitorData.recentLogs : [
                { 
                  type: 'Multi-device Login', 
                  user: 'Driver ID: #DR9021', 
                  status: 'Critical', 
                  time: '2 mins ago',
                  description: 'Login attempt from 3 different cities within 10 minutes.' 
                },
                { 
                  type: 'Unusually High Refunds', 
                  user: 'Customer ID: #CU1102', 
                  status: 'Warning', 
                  time: '15 mins ago',
                  description: '10 refund requests processed in the last 24 hours.' 
                },
                { 
                  type: 'Geo-Spoofing Detected', 
                  user: 'Driver ID: #DR4432', 
                  status: 'Monitoring', 
                  time: '1 hour ago',
                  description: 'GPS coordinates were manually updated multiple times.' 
                }
              ]).map((alert: any, i: number) => (
                <div key={i} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        alert.status === 'Critical' || alert.level === 'ERROR' ? 'bg-red-500' :
                        alert.status === 'Warning' || alert.level === 'WARNING' ? 'bg-orange-500' : 'bg-blue-500'
                      }`} />
                      <span className="font-bold text-slate-900 dark:text-white">{alert.type || alert.service}</span>
                    </div>
                    <Badge variant={
                      alert.status === 'Critical' || alert.level === 'ERROR' ? 'error' :
                      alert.status === 'Warning' || alert.level === 'WARNING' ? 'warning' : 'secondary'
                    }>{alert.status || alert.level}</Badge>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{alert.description || alert.message}</p>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-medium text-slate-500">{alert.user || 'System Bot'}</span>
                    <div className="flex items-center gap-4">
                      <span>{alert.time || new Date(alert.timestamp).toLocaleTimeString()}</span>
                      <Button variant="ghost" size="sm" className="h-6 text-indigo-600">Investigate</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Service Health</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {services.map((service: any, i: number) => (
                <div key={i} className="flex items-center gap-4">
                  <div className={`w-10 h-10 ${service.status === 'Healthy' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Activity className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white truncate">{service.name}</p>
                    <p className="text-xs text-slate-500">{service.uptime} uptime • {service.status}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Uptime Overview</h3>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 28 }).map((_, i) => (
                  <div key={i} className={`h-6 rounded-sm ${i === 24 ? 'bg-orange-300' : 'bg-emerald-400'}`} title={`Day ${i+1}: 100%`} />
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2 text-center">Platform availability last 28 days</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="flex flex-col items-center justify-center p-8 text-center bg-emerald-50/30 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/20">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-400">Database Integrity</h3>
          <p className="text-sm text-emerald-700 dark:text-emerald-500/80 mb-4">All core data structures are synced and secure. No mismatches found in last scan.</p>
          <Button size="sm" variant="outline" className="text-emerald-600 border-emerald-200">Run Full Scan</Button>
        </Card>

        <Card className="flex flex-col items-center justify-center p-8 text-center bg-indigo-50/30 border-indigo-100 dark:bg-indigo-900/10 dark:border-indigo-900/20">
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-400">API Key Rotation</h3>
          <p className="text-sm text-indigo-700 dark:text-indigo-500/80 mb-4">Map services and Payment gateway keys were rotated 5 days ago.</p>
          <Button size="sm" variant="outline" className="text-indigo-600 border-indigo-200">Manage Keys</Button>
        </Card>

        <Card className="flex flex-col items-center justify-center p-8 text-center bg-blue-50/30 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/20">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <Map className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-blue-900 dark:text-blue-400">Live Server Status</h3>
          <p className="text-sm text-blue-700 dark:text-blue-500/80 mb-4">8/8 Regional API servers are online. Response time: 45ms average.</p>
          <Button size="sm" variant="outline" className="text-blue-600 border-blue-200">View Infrastructure</Button>
        </Card>
      </div>
    </div>
  );
}
