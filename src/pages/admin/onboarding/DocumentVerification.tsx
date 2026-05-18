import React, { useState } from 'react';
import { 
  ShieldCheck, FileText, CheckCircle2, XCircle, 
  ChevronRight, ZoomIn, Download, ExternalLink,
  User, Smartphone, CreditCard, Mail, Clock
} from 'lucide-react';
import { Card, CardHeader, CardContent, Button, Badge, StatsCard, Input } from '../../../components/ui';
import { MOCK_APPLICATIONS } from './mockData';
import { cn } from '../../../lib/utils';

export default function DocumentVerification() {
  const [selectedDriver, setSelectedDriver] = useState(MOCK_APPLICATIONS[0]);
  const [activeDoc, setActiveDoc] = useState<'aadhaar' | 'license' | 'pan' | 'rc' | 'insurance' | 'pollution'>('aadhaar');

  const docConfig = {
    aadhaar: { title: 'Aadhaar Card', url: selectedDriver.documents.aadhaarFront, expiry: 'N/A' },
    license: { title: 'Driving License', url: selectedDriver.documents.drivingLicense, expiry: '2028-12-31' },
    pan: { title: 'PAN Card', url: selectedDriver.documents.panCard, expiry: 'N/A' },
    rc: { title: 'RC Book', url: selectedDriver.documents.rcBook, expiry: '2030-05-20' },
    insurance: { title: 'Insurance', url: selectedDriver.documents.insurance, expiry: '2025-06-15' },
    pollution: { title: 'Pollution (PUC)', url: selectedDriver.documents.pollution, expiry: '2024-11-10' },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Document Verification</h1>
          <p className="text-slate-500 dark:text-slate-400">Review and verify driver identity and legal documents.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Verification History</Button>
          <Button size="sm">Verification Guidelines</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Driver Queue */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="overflow-visible">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-800/30">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                Pending Queue (12)
              </h2>
            </CardHeader>
            <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
              {MOCK_APPLICATIONS.map((driver) => (
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
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">{driver.id}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={driver.verificationStatus === 'UNDER_REVIEW' ? 'info' : 'warning'} className="text-[9px]">
                      {driver.verificationStatus.split('_')[0]}
                    </Badge>
                    <p className="text-[10px] text-slate-400">10m ago</p>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Right: Verification Interface */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 flex gap-4">
                <img src={selectedDriver.documents.driverSelfie} className="w-16 h-16 rounded-xl object-cover" alt="" />
                <div className="space-y-1">
                  <h3 className="text-lg font-bold">{selectedDriver.name}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Smartphone className="w-3.5 h-3.5" />
                      {selectedDriver.phone}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Mail className="w-3.5 h-3.5" />
                      {selectedDriver.email}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Verification Score</p>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold text-indigo-600">85%</span>
                    <span className="text-xs text-emerald-600 font-medium pb-1">High Trust</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full border-4 border-indigo-100 dark:border-indigo-900 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-indigo-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <div className="flex flex-col md:flex-row">
              {/* Doc Tabs */}
              <div className="w-full md:w-56 border-r border-slate-100 dark:border-slate-800">
                <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <p className="text-xs font-bold text-slate-500 uppercase">Documents</p>
                </div>
                <nav className="p-2 space-y-1">
                  {Object.entries(docConfig).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => setActiveDoc(key as any)}
                      className={cn(
                        "w-full flex items-center justify-between p-2.5 rounded-lg text-sm transition-all",
                        activeDoc === key 
                          ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 font-bold" 
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        {config.title}
                      </div>
                      <ChevronRight className={cn("w-4 h-4", activeDoc === key ? "opacity-100" : "opacity-0")} />
                    </button>
                  ))}
                </nav>
              </div>

              {/* Doc Preview */}
              <div className="flex-1 flex flex-col">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold">{docConfig[activeDoc].title}</h3>
                    <p className="text-xs text-slate-500">Expires on: {docConfig[activeDoc].expiry}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-6 flex items-center justify-center min-h-[400px]">
                  <div className="relative group">
                    <img 
                      src={docConfig[activeDoc].url} 
                      className="max-h-[350px] rounded-lg shadow-2xl border border-slate-200 dark:border-slate-800 transition-transform duration-300 group-hover:scale-[1.02]" 
                      alt={docConfig[activeDoc].title} 
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                      <Button variant="primary" size="sm" className="bg-white/20 backdrop-blur-md border-white/30 hover:bg-white/30">
                        View Full Screen
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button variant="danger" className="gap-2">
                      <XCircle className="w-4 h-4" />
                      Reject Document
                    </Button>
                    <Button variant="primary" className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Approve Document
                    </Button>
                  </div>
                  <button className="text-sm text-indigo-600 font-medium hover:underline">Request Re-upload</button>
                </div>
              </div>
            </div>
          </Card>

          {/* Verification Log */}
          <Card>
            <CardHeader>
              <h3 className="font-bold">Verification Comments</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0">AD</div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold">Admin User <span className="text-[10px] font-normal text-slate-400 font-mono ml-2">May 14, 10:30 AM</span></p>
                    <Badge variant="success" className="text-[9px]">Approved PAN</Badge>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">PAN details match with the identity proof provided. Verification successful.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Input placeholder="Add a comment or rejection reason..." className="flex-1" />
                <Button>Post</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

