import React, { useState } from 'react';
import { 
  Rocket, MapPin, DollarSign, Settings, 
  CheckCircle2, Bell, ShieldCheck, UserCheck,
  ChevronRight, ArrowRight, Building2, Layers
} from 'lucide-react';
import { Card, CardHeader, CardContent, Button, Badge, Input } from '../../../components/ui';
import { MOCK_APPLICATIONS } from './mockData';
import { cn } from '../../../lib/utils';

export default function ActivationQueue() {
  const [selectedDriver, setSelectedDriver] = useState(MOCK_APPLICATIONS[1]); // Priya Singh

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Activation Queue</h1>
          <p className="text-slate-500 dark:text-slate-400">Final setup and service activation for approved drivers.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Activation History</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Queue */}
        <div className="lg:col-span-4 space-y-4">
          <Card>
            <CardHeader className="bg-slate-50/50 dark:bg-slate-800/30">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <Rocket className="w-4 h-4 text-indigo-600" />
                Ready for Activation (8)
              </h2>
            </CardHeader>
            <div className="max-h-[600px] overflow-y-auto">
              {MOCK_APPLICATIONS.filter(a => a.verificationStatus !== 'REJECTED').map((driver) => (
                <button
                  key={driver.id}
                  onClick={() => setSelectedDriver(driver)}
                  className={cn(
                    "w-full flex items-center gap-3 p-4 border-b border-slate-100 dark:border-slate-800 transition-all text-left",
                    selectedDriver.id === driver.id 
                      ? "bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-l-indigo-600" 
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  )}
                >
                  <img src={driver.documents.driverSelfie} className="w-10 h-10 rounded-full object-cover shrink-0" alt="" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold truncate">{driver.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{driver.id}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Right: Activation Workflow */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="bg-indigo-50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <img src={selectedDriver.documents.driverSelfie} className="w-20 h-20 rounded-2xl object-cover border-4 border-white dark:border-slate-900 shadow-lg" alt="" />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-xl font-bold">{selectedDriver.name}</h2>
                    <Badge variant="success">Fully Verified</Badge>
                  </div>
                  <p className="text-sm text-slate-500 mb-3">{selectedDriver.vehicleBrand} {selectedDriver.vehicleModel} • {selectedDriver.vehicleNumber}</p>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      Documents Clear
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                      Background Clear
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <h3 className="font-bold flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  Service Allocation
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Operational City</label>
                  <select className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                    <option>{selectedDriver.city}</option>
                    <option>Mumbai</option>
                    <option>Delhi</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Assigned Zone</label>
                  <select className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                    <option>{selectedDriver.zone}</option>
                    <option>Central District</option>
                    <option>Airport Terminal</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Vehicle Category</label>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-600" />
                      <span className="text-sm font-bold">{selectedDriver.vehicleType}</span>
                    </div>
                    <button className="text-[10px] text-indigo-600 font-bold hover:underline">Change</button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="font-bold flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-indigo-600" />
                  Financial Setup
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Commission Percentage</label>
                  <div className="flex items-center gap-3">
                    <input type="range" className="flex-1 accent-indigo-600" min="5" max="30" defaultValue="15" />
                    <span className="text-sm font-bold w-10">15%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Daily Bonus Eligibility</label>
                  <div className="flex gap-2">
                    {['Tier 1', 'Tier 2', 'Premium'].map((tier) => (
                      <button key={tier} className={cn(
                        "flex-1 py-2 rounded-lg text-[10px] font-bold border transition-all",
                        tier === 'Tier 1' ? "bg-indigo-600 text-white border-indigo-600" : "bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800"
                      )}>
                        {tier}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="pt-2">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Auto-Pay Enabled</span>
                    </div>
                    <Settings className="w-4 h-4 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <h3 className="font-bold flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-600" />
                Activation Notifications
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { label: 'SMS Notification', desc: 'Send login credentials via SMS' },
                  { label: 'Email Welcome Kit', desc: 'Send PDF guide and app links' },
                  { label: 'Push Alert', desc: 'Notify on driver partner app' },
                ].map((notif, i) => (
                  <label key={i} className="flex items-center justify-between group cursor-pointer">
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold group-hover:text-indigo-600 transition-colors">{notif.label}</p>
                      <p className="text-[10px] text-slate-500">{notif.desc}</p>
                    </div>
                    <div className="w-10 h-5 bg-indigo-600 rounded-full relative">
                      <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
                    </div>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-4">
            <Button variant="outline" className="flex-1 py-6 text-lg">
              Save for Later
            </Button>
            <Button variant="primary" className="flex-1 py-6 text-lg gap-3">
              <Rocket className="w-5 h-5" />
              Activate Driver Partner
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
