import React from 'react';
import { 
  Building2, 
  Shield, 
  Bell, 
  Lock, 
  Globe, 
  Smartphone,
  CreditCard,
  Mail,
  AppWindow,
  Database
} from 'lucide-react';
import { Card, CardHeader, CardContent, Button, Input, Badge } from '../../components/ui';

export default function PlatformSettings() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Platform Settings</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage global configurations, branding, and system policies</p>
        </div>
        <Button className="bg-indigo-600 text-white border-none">Save All Changes</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation */}
        <div className="lg:col-span-1 space-y-2">
          {[
            { label: 'General', icon: Building2, active: true },
            { label: 'Security', icon: Shield },
            { label: 'Notifications', icon: Bell },
            { label: 'Branding', icon: AppWindow },
            { label: 'Payments', icon: CreditCard },
            { label: 'Language & Region', icon: Globe },
            { label: 'Mobile App', icon: Smartphone },
            { label: 'Data & Backup', icon: Database },
          ].map((item, i) => (
            <button
              key={i}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                item.active 
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' 
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </div>

        {/* Form Content */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Global Platform Configuration</h2>
              <p className="text-sm text-slate-500">Core settings that affect the entire ecosystem</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Platform Name</label>
                  <Input defaultValue="Vazraa mobility" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Support Email</label>
                  <Input defaultValue="support@vazraamobility.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Operational Currency</label>
                  <select className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
                    <option>INR (₹)</option>
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Default Radius (km)</label>
                  <Input type="number" defaultValue="15" />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Ride Policies</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Auto-cancel inactive rides</p>
                      <p className="text-xs text-slate-500 font-medium">Cancel if driver doesn't accept within 5 minutes</p>
                    </div>
                    <div className="w-12 h-6 bg-indigo-600 rounded-full relative cursor-pointer">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Emergency Button (SOS)</p>
                      <p className="text-xs text-slate-500 font-medium">Enabled in mobile app for all customers</p>
                    </div>
                    <div className="w-12 h-6 bg-indigo-600 rounded-full relative cursor-pointer">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Security & Access Control</h2>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 border border-slate-100 dark:border-slate-800 rounded-xl">
                  <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Two-Factor Authentication</h4>
                    <p className="text-sm text-slate-500 mb-3">Require 2FA for all Super Admin and Admin logins. Currently enforced for Super Admins only.</p>
                    <Button variant="outline" size="sm">Modify Policy</Button>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 border border-slate-100 dark:border-slate-800 rounded-xl">
                  <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Session Timeout</h4>
                    <p className="text-sm text-slate-500 mb-3">Automatically logout idle administrative users after a set period.</p>
                    <div className="flex items-center gap-2">
                       <Input className="w-24 h-8" type="number" defaultValue="30" />
                       <span className="text-sm text-slate-500 font-medium">minutes</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
