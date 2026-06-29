import React from 'react';
import { User, Bell, Shield, Smartphone, Globe, CreditCard, Save } from 'lucide-react';
import { Card, CardHeader, CardContent, Button, Badge } from '../components/ui';

const SettingsPage = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage your account preferences and platform configuration.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1 space-y-1">
           <button className="w-full flex items-center gap-3 px-4 py-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold rounded-lg text-sm text-left">
             <User className="w-4 h-4" /> Profile
           </button>
           <button className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-sm text-left transition-colors">
             <Bell className="w-4 h-4" /> Notifications
           </button>
           <button className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-sm text-left transition-colors">
             <Shield className="w-4 h-4" /> Security
           </button>
           <button className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-sm text-left transition-colors">
             <Smartphone className="w-4 h-4" /> App Settings
           </button>
        </div>

        <div className="md:col-span-3 space-y-6">
           <Card>
             <CardHeader>
               <h3 className="font-bold text-slate-900 dark:text-white">Profile Information</h3>
             </CardHeader>
             <CardContent className="space-y-6">
                <div className="flex items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 font-bold text-2xl">A</div>
                  <div>
                     <Button variant="outline" size="sm">Change Avatar</Button>
                     <p className="text-xs text-slate-500 mt-2">JPG, GIF or PNG. Max size of 800K</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Full Name</label>
                    <input type="text" defaultValue="Admin User" className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Email Address</label>
                    <input type="email" defaultValue="admin@vazraamobility.com" className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Phone Number</label>
                    <input type="text" defaultValue="+91 9876543210" className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
                
                <div className="pt-4">
                   <Button className="flex items-center gap-2">
                     <Save className="w-4 h-4" /> Save Changes
                   </Button>
                </div>
             </CardContent>
           </Card>

           <Card>
             <CardHeader>
               <h3 className="font-bold text-slate-900 dark:text-white">Regional Preferences</h3>
             </CardHeader>
             <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                   <div>
                     <p className="text-sm font-bold text-slate-900 dark:text-white">Default Currency</p>
                     <p className="text-xs text-slate-500">Currency used for all financial reports</p>
                   </div>
                   <select className="bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm font-bold p-2 focus:ring-2 focus:ring-indigo-500">
                     <option>INR (₹)</option>
                     <option>USD ($)</option>
                   </select>
                </div>
                <div className="flex items-center justify-between">
                   <div>
                     <p className="text-sm font-bold text-slate-900 dark:text-white">Time Zone</p>
                     <p className="text-xs text-slate-500">Used for ride history and logs</p>
                   </div>
                   <select className="bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm font-bold p-2 focus:ring-2 focus:ring-indigo-500">
                     <option>Asia/Kolkata (GMT+5:30)</option>
                     <option>UTC (GMT+0:00)</option>
                   </select>
                </div>
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
