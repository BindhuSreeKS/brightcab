import React from 'react';
import { MapPin, Navigation, Car, Layers, ZoomIn, ZoomOut, Search, Activity } from 'lucide-react';
import { Card, CardContent, Button, Badge } from '../../components/ui';
import { MOCK_DRIVERS, MOCK_RIDES } from '../../mockData';

const LiveTracking = () => {
  return (
    <div className="h-[calc(100vh-160px)] flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Live Tracking</h1>
          <p className="text-slate-500 dark:text-slate-400">Real-time monitoring of all active rides and drivers.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="success" className="flex items-center gap-2 py-2 px-3">
            <Activity className="w-4 h-4 animate-pulse" />
            <span>Live System Active</span>
          </Badge>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Map Placeholder */}
        <div className="flex-1 bg-slate-200 dark:bg-slate-800 rounded-2xl relative overflow-hidden group border border-slate-300 dark:border-slate-700">
          {/* Simulated Map Background */}
          <div className="absolute inset-0 bg-[#f0f2f5] dark:bg-[#1a1c1e] grid grid-cols-[repeat(20,minmax(0,1fr))] grid-rows-[repeat(20,minmax(0,1fr))] opacity-20">
            {Array.from({ length: 400 }).map((_, i) => (
              <div key={i} className="border border-slate-900/10"></div>
            ))}
          </div>

          {/* Simulated Roads */}
          <div className="absolute top-1/4 h-12 w-full bg-slate-300 dark:bg-slate-700/50 -rotate-2"></div>
          <div className="absolute left-1/3 w-12 h-full bg-slate-300 dark:bg-slate-700/50 rotate-3"></div>

          {/* Map Markers */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative group cursor-pointer">
              <div className="p-2 bg-indigo-600 rounded-full text-white shadow-xl animate-bounce">
                <Car className="w-5 h-5" />
              </div>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white dark:bg-slate-900 p-2 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                <p className="text-xs font-bold text-slate-900 dark:text-white">Rajesh Kumar (D1)</p>
                <p className="text-[10px] text-emerald-500 font-bold uppercase">Moving • 24 km/h</p>
              </div>
            </div>
          </div>

          <div className="absolute bottom-1/4 right-1/4">
            <div className="p-2 bg-emerald-500 rounded-full text-white shadow-xl">
              <Car className="w-5 h-5" />
            </div>
          </div>

          <div className="absolute top-10 left-10">
            <div className="p-2 bg-slate-400 rounded-full text-white shadow-xl opacity-50">
              <Car className="w-5 h-5" />
            </div>
          </div>

          {/* Map Controls */}
          <div className="absolute top-6 right-6 flex flex-col gap-2">
            <Button variant="secondary" size="icon" className="shadow-lg bg-white dark:bg-slate-900"><ZoomIn className="w-4 h-4" /></Button>
            <Button variant="secondary" size="icon" className="shadow-lg bg-white dark:bg-slate-900"><ZoomOut className="w-4 h-4" /></Button>
            <Button variant="secondary" size="icon" className="shadow-lg bg-white dark:bg-slate-900"><Layers className="w-4 h-4" /></Button>
          </div>

          <div className="absolute top-6 left-6 w-72">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Find a driver or location..." 
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm shadow-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-2.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Active Ride</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Offline</span>
            </div>
          </div>
        </div>

        {/* Floating Info Panels */}
        <div className="lg:w-80 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
          <Card>
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Active Sessions</h3>
              <Badge variant="info">42</Badge>
            </div>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {MOCK_RIDES.map(ride => (
                  <div key={ride.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">#{ride.id}</span>
                      <Badge variant="success" className="text-[10px]">Moving</Badge>
                    </div>
                    <div className="space-y-1 ml-1">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
                         <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>
                         {ride.driverName}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                         <div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div>
                         {ride.customerName}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-indigo-600 border-none">
            <CardContent className="p-6">
              <h4 className="text-white font-bold mb-1">System Health</h4>
              <p className="text-indigo-100/70 text-xs mb-4">All services are operating normally across Bengaluru.</p>
              <div className="space-y-3">
                 <div className="flex items-center justify-between text-xs">
                   <span className="text-indigo-100">API Latency</span>
                   <span className="text-white font-bold">24ms</span>
                 </div>
                 <div className="w-full h-1 bg-indigo-500 rounded-full overflow-hidden">
                   <div className="w-3/4 h-full bg-white"></div>
                 </div>
                 <div className="flex items-center justify-between text-xs">
                   <span className="text-indigo-100">Server Load</span>
                   <span className="text-white font-bold">12%</span>
                 </div>
                 <div className="w-full h-1 bg-indigo-500 rounded-full overflow-hidden">
                   <div className="w-1/4 h-full bg-white"></div>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LiveTracking;
