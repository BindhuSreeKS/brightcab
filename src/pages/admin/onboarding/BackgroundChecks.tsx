import React from 'react';
import { 
  ShieldCheck, AlertTriangle, Fingerprint, History, 
  Search, ShieldAlert, CheckCircle2, XCircle, 
  AlertCircle, Info, MoreVertical
} from 'lucide-react';
import { Card, CardHeader, CardContent, Button, Badge, StatsCard, Table } from '../../../components/ui';
import { MOCK_APPLICATIONS } from './mockData';
import { cn } from '../../../lib/utils';

export default function BackgroundChecks() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Background Checks</h1>
          <p className="text-slate-500 dark:text-slate-400">Security screening, criminal record checks, and fraud detection.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">Screening Settings</Button>
          <Button size="sm">Refresh Live Feed</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Security Clearance" 
          value="85%" 
          icon={ShieldCheck}
          color="indigo"
        />
        <StatsCard 
          title="Flagged Profiles" 
          value="12" 
          icon={AlertTriangle}
          color="red"
        />
        <StatsCard 
          title="Fraud Alerts" 
          value="04" 
          icon={ShieldAlert}
          color="amber"
        />
        <StatsCard 
          title="Checks in Progress" 
          value="45" 
          icon={Fingerprint}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Screening List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="text-lg font-bold">Screening Queue</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Filter drivers..." 
                  className="pl-10 pr-4 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-sm"
                />
              </div>
            </CardHeader>
            <Table headers={['Driver', 'Risk Level', 'Verification Status', 'Fraud Alerts', 'Action']}>
              {MOCK_APPLICATIONS.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={app.documents.driverSelfie} className="w-10 h-10 rounded-full object-cover" alt="" />
                      <div>
                        <p className="text-sm font-bold">{app.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{app.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full",
                            app.riskScore > 70 ? "bg-red-500" : app.riskScore > 30 ? "bg-amber-500" : "bg-emerald-500"
                          )} 
                          style={{ width: `${app.riskScore}%` }} 
                        />
                      </div>
                      <span className={cn(
                        "text-[10px] font-bold",
                        app.riskScore > 70 ? "text-red-500" : app.riskScore > 30 ? "text-amber-500" : "text-emerald-500"
                      )}>
                        {app.riskScore}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={
                      app.backgroundCheckStatus === 'CLEARED' ? 'success' : 
                      app.backgroundCheckStatus === 'FLAGGED' ? 'warning' : 
                      app.backgroundCheckStatus === 'REJECTED' ? 'error' : 'default'
                    }>
                      {app.backgroundCheckStatus}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    {app.fraudAlerts.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="error" className="text-[8px] py-0">{app.fraudAlerts.length} Alerts</Badge>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">None</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                      <MoreVertical className="w-4 h-4 text-slate-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </Table>
          </Card>
        </div>

        {/* Intelligence Side Panel */}
        <div className="space-y-6">
          <Card className="bg-indigo-600 text-white border-none overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <ShieldCheck className="w-32 h-32" />
            </div>
            <CardContent className="p-6 relative z-10">
              <h3 className="text-lg font-bold mb-2">Automated Screening</h3>
              <p className="text-indigo-100 text-sm mb-6">Our AI engine scans 50+ public records and databases for security verification.</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-indigo-300 rounded-full animate-pulse" />
                  <span className="text-xs font-medium">Scanning criminal records...</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-indigo-300 rounded-full" />
                  <span className="text-xs font-medium">Validating DL credentials...</span>
                </div>
                <div className="flex items-center gap-3 text-emerald-300">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-xs font-medium">Address history verified</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                Recent Risk Flags
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: 'Rahul Verma', reason: 'Multiple account detected', severity: 'high' },
                { name: 'Sanjay Dutt', reason: 'License mismatch error', severity: 'medium' },
                { name: 'Vijay K', reason: 'Identity verification failed', severity: 'high' },
              ].map((flag, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
                  <div className={cn(
                    "w-1 h-8 rounded-full",
                    flag.severity === 'high' ? "bg-red-500" : "bg-amber-500"
                  )} />
                  <div>
                    <p className="text-sm font-bold">{flag.name}</p>
                    <p className="text-[10px] text-slate-500">{flag.reason}</p>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full text-xs py-2">View Risk Report</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-bold">Fraud Heatmap</h3>
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-slate-100 dark:bg-slate-950 rounded-xl flex items-center justify-center border border-dashed border-slate-300 dark:border-slate-700">
                <div className="text-center p-6">
                  <Info className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-medium">Fraud attempts by location visual data is being processed.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
