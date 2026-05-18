import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, MoreVertical, CheckCircle2, XCircle, Ban, Eye, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent, Button, Badge, Table } from '../../components/ui';
import { formatCurrency, formatDate } from '../../lib/utils';
import { driversApi } from '../../lib/api';

const DriverManagement = () => {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [driversRes, statsRes] = await Promise.all([
        driversApi.getAll({ search: searchTerm, size: 50 }),
        driversApi.getStats()
      ]);
      setDrivers(driversRes.data.content);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, fetchData]);

  const handleAction = async (action: 'verify' | 'suspend' | 'activate', id: string) => {
    try {
      if (action === 'verify') await driversApi.verify(id);
      if (action === 'suspend') await driversApi.suspend(id);
      if (action === 'activate') await driversApi.activate(id);
      fetchData();
    } catch (err) {
      alert('Action failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Driver Management</h1>
          <p className="text-slate-500 dark:text-slate-400">Total {stats?.total || 0} drivers registered on the platform.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData} disabled={loading} className="flex gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Sync
          </Button>
          <Button className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Approve Pending ({stats?.pending || 0})</span>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search drivers..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </Button>
            </div>
          </div>

          <Table headers={['Driver', 'Vehicle Details', 'Rating', 'Earnings', 'Status', 'Verification', 'Actions']}>
            {loading ? (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-400">Loading drivers...</td></tr>
            ) : drivers.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-400">No drivers found</td></tr>
            ) : drivers.map((driver) => (
              <tr key={driver.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold shrink-0">
                      {driver.firstName?.charAt(0) || driver.name?.charAt(0) || 'D'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{driver.firstName} {driver.lastName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{driver.phone}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{driver.vehicleDetails?.category || 'N/A'}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{driver.vehicleDetails?.plateNumber || 'N/A'}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-amber-500">★</span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{driver.rating?.toFixed(1) || '0.0'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">
                  {formatCurrency(driver.walletBalance || 0)}
                </td>
                <td className="px-6 py-4">
                  <Badge variant={driver.status === 'ONLINE' ? 'success' : driver.status === 'SUSPENDED' ? 'error' : 'default'}>
                    {driver.status}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={driver.verificationStatus === 'APPROVED' ? 'success' : driver.verificationStatus === 'REJECTED' ? 'error' : 'warning'}>
                    {driver.verificationStatus}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {driver.verificationStatus === 'PENDING' && (
                       <Button variant="ghost" size="icon" onClick={() => handleAction('verify', driver.id)} className="text-green-500" title="Approve">
                         <CheckCircle2 className="w-4 h-4" />
                       </Button>
                    )}
                    {driver.status === 'SUSPENDED' ? (
                       <Button variant="ghost" size="sm" onClick={() => handleAction('activate', driver.id)} className="text-indigo-500">Activate</Button>
                    ) : (
                       <Button variant="ghost" size="icon" onClick={() => handleAction('suspend', driver.id)} title="Suspend" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                         <Ban className="w-4 h-4" />
                       </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverManagement;
