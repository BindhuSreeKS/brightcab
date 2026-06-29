import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, Eye, CheckCircle, XCircle, Clock, Download, ShieldCheck, Car } from 'lucide-react';
import { Card, CardHeader, CardContent, Input, Button, Badge, Table } from '../../../components/ui';
import { MOCK_APPLICATIONS } from './mockData';
import { cn } from '../../../lib/utils';

import { onboardingApi } from '../../../lib/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function ApplicationsList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await onboardingApi.getApplications();
      setApplications(res.data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'ALL' || app.verificationStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Driver Applications</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage and review incoming driver registration requests.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button size="sm">
            Bulk Action
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="border-none pb-0">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search by name, ID, phone..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <select 
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="AWAITING_VERIFICATION">Awaiting Verification</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table headers={['Driver Information', 'Vehicle Details', 'Applied On', 'Progress', 'Status', 'Actions']}>
            {filteredApplications.map((app) => (
              <tr key={app.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img src={app.driverSelfieImage || app.documents?.driverSelfie} className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-sm" alt="" />
                      <div className={cn(
                        "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center",
                        app.backgroundCheckStatus === 'CLEARED' ? "bg-emerald-500" : app.backgroundCheckStatus === 'FLAGGED' ? "bg-amber-500" : "bg-slate-400"
                      )}>
                        <ShieldCheck className="w-2 h-2 text-white" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{app.name}</p>
                      <p className="text-xs text-slate-500 font-medium">{app.phone}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{app.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400">
                      <Car className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{app.vehicleBrand} {app.vehicleModel}</p>
                      <p className="text-xs text-slate-500">{app.vehicleNumber} • {app.vehicleType || app.vehicleCategory}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Clock className="w-4 h-4" />
                    <p className="text-sm">{new Date(app.createdAt || app.joinedAt).toLocaleDateString()}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="w-32">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-slate-500">{app.verificationProgress}% Complete</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full transition-all duration-500",
                          app.verificationProgress > 80 ? "bg-emerald-500" : 
                          app.verificationProgress > 40 ? "bg-indigo-500" : "bg-amber-500"
                        )} 
                        style={{ width: `${app.verificationProgress}%` }} 
                      />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={
                    app.verificationStatus === 'APPROVED' ? 'success' : 
                    app.verificationStatus === 'REJECTED' ? 'error' : 
                    app.verificationStatus === 'UNDER_REVIEW' ? 'info' : 'warning'
                  }>
                    {app.verificationStatus.replace('_', ' ')}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link to={`/admin/onboarding/applications/${app.id}`}>
                      <Button variant="ghost" size="icon" title="View Details">
                        <Eye className="w-4 h-4 text-slate-500" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="icon" title="Quick Approve" className="text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/10">
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Reject" className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10">
                      <XCircle className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4 text-slate-400" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
          
          <div className="flex items-center justify-between mt-6 px-2">
            <p className="text-sm text-slate-500">Showing 1 to {filteredApplications.length} of {filteredApplications.length} applications</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm" className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600">1</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
