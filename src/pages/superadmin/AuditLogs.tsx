import React, { useState } from 'react';
import { History, Search, Filter, Download, User, Settings, Database, ShieldAlert, Monitor, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardContent, Button, Input, Badge } from '../../components/ui';

interface AuditLog {
  id: string;
  adminName: string;
  adminEmail: string;
  action: string;
  module: string;
  timestamp: string;
  ipAddress: string;
  device: string;
  severity: 'low' | 'medium' | 'high';
}

const AUDIT_LOGS: AuditLog[] = [
  { id: '1', adminName: 'Sarah Connor', adminEmail: 'sarah@vazraamobility.com', action: 'Created new Admin role', module: 'Access Control', timestamp: '2024-05-20 14:24:12', ipAddress: '192.168.1.1', device: 'Chrome / macOS', severity: 'medium' },
  { id: '2', adminName: 'John Doe', adminEmail: 'john@vazraamobility.com', action: 'Changed commission rate for Mumbai', module: 'Pricing', timestamp: '2024-05-20 13:15:00', ipAddress: '103.45.21.90', device: 'Firefox / Windows', severity: 'high' },
  { id: '3', adminName: 'System', adminEmail: 'system@vazraamobility.com', action: 'Automatically suspended 12 drivers', module: 'Automation', timestamp: '2024-05-20 12:00:00', ipAddress: '-', device: 'Server', severity: 'medium' },
  { id: '4', adminName: 'Mike Ross', adminEmail: 'mike@vazraamobility.com', action: 'Updated terms and conditions', module: 'Settings', timestamp: '2024-05-20 11:45:22', ipAddress: '172.16.0.4', device: 'Safari / iOS', severity: 'low' },
  { id: '5', adminName: 'Sarah Connor', adminEmail: 'sarah@vazraamobility.com', action: 'Login successful', module: 'Auth', timestamp: '2024-05-20 09:30:15', ipAddress: '192.168.1.1', device: 'Chrome / macOS', severity: 'low' },
];

export default function AuditLogs() {
  const [logs] = useState<AuditLog[]>(AUDIT_LOGS);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Audit Logs & Activity</h1>
          <p className="text-slate-500 dark:text-slate-400">Track all administrative actions and system-level changes</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download Full History
          </Button>
          <Button className="flex items-center gap-2 text-red-600 border-red-200 bg-red-50 hover:bg-red-100">
            <ShieldAlert className="w-4 h-4" />
            Security Alerts
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Filter Logs</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input className="pl-10" placeholder="Action or admin..." />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Module</label>
              <select className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
                <option>All Modules</option>
                <option>Access Control</option>
                <option>Pricing</option>
                <option>Auth</option>
                <option>Settings</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Severity</label>
              <div className="flex flex-wrap gap-2 text-xs">
                <button className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium">All</button>
                <button className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200">Low</button>
                <button className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200">Medium</button>
                <button className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200">High</button>
              </div>
            </div>

            <Button className="w-full flex items-center justify-center gap-2 mt-4" variant="outline">
              <Filter className="w-4 h-4" />
              Apply Filters
            </Button>
          </CardContent>
        </Card>

        {/* Logs Timeline */}
        <div className="lg:col-span-3 space-y-4">
          {logs.map((log) => (
            <div key={log.id}>
              <Card className="hover:border-indigo-200 transition-colors cursor-pointer group">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className={`mt-1 h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      log.severity === 'high' ? 'bg-red-50 text-red-600' :
                      log.severity === 'medium' ? 'bg-orange-50 text-orange-600' :
                      'bg-indigo-50 text-indigo-600'
                    }`}>
                      {log.module === 'Auth' ? <Monitor className="w-5 h-5" /> : 
                       log.module === 'Pricing' ? <Database className="w-5 h-5" /> :
                       log.module === 'Access Control' ? <ShieldAlert className="w-5 h-5" /> :
                       <Settings className="w-5 h-5" />}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                          {log.action}
                        </h3>
                        <span className="text-xs text-slate-400">{log.timestamp}</span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                          <User className="w-3.5 h-3.5" />
                          <span>{log.adminName} ({log.adminEmail})</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 border-l border-slate-200 dark:border-slate-800 pl-4">
                          <Monitor className="w-3.5 h-3.5" />
                          <span>{log.device} • {log.ipAddress}</span>
                        </div>
                        <Badge variant={
                          log.severity === 'high' ? 'error' :
                          log.severity === 'medium' ? 'warning' :
                          'secondary'
                        } className="ml-auto">
                          {log.severity.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="hidden md:flex flex-shrink-0 items-center justify-center p-2">
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
          
          <div className="flex items-center justify-center py-6">
            <Button variant="ghost" className="text-indigo-600 font-medium hover:bg-indigo-50">
              Load More Activity Logs
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
