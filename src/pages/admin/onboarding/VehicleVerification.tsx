import React, { useState } from 'react';
import { 
  Car, ShieldCheck, CheckCircle2, XCircle, 
  Settings, Info, Calendar, Palette, Tag,
  Maximize2, ChevronRight, ChevronLeft
} from 'lucide-react';
import { Card, CardHeader, CardContent, Button, Badge, Input } from '../../../components/ui';
import { MOCK_APPLICATIONS } from './mockData';
import { cn } from '../../../lib/utils';

export default function VehicleVerification() {
  const [selectedApp, setSelectedApp] = useState(MOCK_APPLICATIONS[0]);
  const [activeImage, setActiveImage] = useState(0);

  const vehicleImages = [
    { title: 'Front View', url: selectedApp.documents.vehicleFront },
    { title: 'Rear View', url: selectedApp.documents.vehicleBack },
    { title: 'Side View', url: selectedApp.documents.vehicleSide },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Vehicle Verification</h1>
          <p className="text-slate-500 dark:text-slate-400">Inspect vehicle images and technical details before approval.</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="info" className="py-2 px-4">6 Vehicles Pending</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Vehicle Info & Inspection */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="text-lg font-bold">Vehicle Inspection</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setActiveImage(prev => (prev > 0 ? prev - 1 : vehicleImages.length - 1))}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-xs font-bold text-slate-500">{activeImage + 1} / {vehicleImages.length}</span>
                <Button variant="outline" size="icon" onClick={() => setActiveImage(prev => (prev < vehicleImages.length - 1 ? prev + 1 : 0))}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-video bg-slate-100 dark:bg-slate-950 rounded-2xl overflow-hidden group">
                <img 
                  src={vehicleImages[activeImage].url} 
                  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.02]" 
                  alt={vehicleImages[activeImage].title} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                  <div className="flex-1">
                    <p className="text-white font-bold">{vehicleImages[activeImage].title}</p>
                    <p className="text-white/70 text-xs">High Resolution Capture</p>
                  </div>
                  <Button size="icon" variant="outline" className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 text-white">
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-4">
                {vehicleImages.map((img, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveImage(i)}
                    className={cn(
                      "aspect-video rounded-xl overflow-hidden border-2 transition-all",
                      activeImage === i ? "border-indigo-600 ring-2 ring-indigo-600/20" : "border-transparent opacity-60 hover:opacity-100"
                    )}
                  >
                    <img src={img.url} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <h3 className="font-bold flex items-center gap-2">
                  <Info className="w-4 h-4 text-indigo-600" />
                  Technical Details
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Brand</p>
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-slate-400" />
                      <p className="text-sm font-semibold">{selectedApp.vehicleBrand}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Model</p>
                    <div className="flex items-center gap-2">
                      <Car className="w-3.5 h-3.5 text-slate-400" />
                      <p className="text-sm font-semibold">{selectedApp.vehicleModel}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Mfg Year</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <p className="text-sm font-semibold">{selectedApp.manufacturingYear}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Color</p>
                    <div className="flex items-center gap-2">
                      <Palette className="w-3.5 h-3.5 text-slate-400" />
                      <p className="text-sm font-semibold">{selectedApp.vehicleColor}</p>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Registration Number</p>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-lg font-mono font-bold tracking-widest">{selectedApp.vehicleNumber}</span>
                    <Badge variant="success">Verified RC</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="font-bold flex items-center gap-2">
                  <Settings className="w-4 h-4 text-indigo-600" />
                  Category Assignment
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <p className="text-xs text-slate-500">Based on vehicle details, assign the appropriate service category.</p>
                  <div className="space-y-2">
                    {['Bike', 'Auto', 'Mini', 'Sedan', 'SUV'].map((cat) => (
                      <label key={cat} className={cn(
                        "flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all",
                        selectedApp.vehicleType === cat 
                          ? "bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800" 
                          : "bg-white border-slate-100 dark:bg-slate-900 dark:border-slate-800 hover:border-indigo-200"
                      )}>
                        <div className="flex items-center gap-3">
                          <input 
                            type="radio" 
                            name="category" 
                            checked={selectedApp.vehicleType === cat} 
                            onChange={() => setSelectedApp({...selectedApp, vehicleType: cat})}
                            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-sm font-medium">{cat}</span>
                        </div>
                        {selectedApp.vehicleType === cat && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right: Driver Info & Action */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="font-bold">Driver Information</h3>
            </CardHeader>
            <CardContent className="text-center pb-6">
              <img src={selectedApp.documents.driverSelfie} className="w-24 h-24 rounded-full mx-auto border-4 border-white dark:border-slate-800 shadow-xl mb-4 object-cover" alt="" />
              <h4 className="text-lg font-bold">{selectedApp.name}</h4>
              <p className="text-xs text-slate-500 font-medium mb-4">{selectedApp.id}</p>
              <div className="flex justify-center gap-2">
                <Badge variant="outline">{selectedApp.city}</Badge>
                <Badge variant="outline">{selectedApp.zone}</Badge>
              </div>
            </CardContent>
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">Doc Verification</span>
                  <span className="text-emerald-600 font-bold">100% Passed</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">Insurance Status</span>
                  <span className="text-emerald-600 font-bold">Valid</span>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-bold">Verification Decision</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Inspector Comments</p>
                <textarea 
                  className="w-full min-h-[100px] p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="Note any visible damage or discrepancies..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="danger" className="gap-2">
                  <XCircle className="w-4 h-4" />
                  Reject
                </Button>
                <Button variant="primary" className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Approve
                </Button>
              </div>
              <button className="w-full text-sm text-indigo-600 font-medium py-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 rounded-lg transition-colors">
                Request Better Images
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
