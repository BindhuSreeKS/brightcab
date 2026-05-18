import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, MapPin, Navigation, Eye, User, Car, RefreshCw } from 'lucide-react';
import { Card, CardContent, Button, Badge, Table } from '../../components/ui';
import { formatCurrency, formatDate } from '../../lib/utils';
import { ridesApi } from '../../lib/api';

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'COMPLETED': return 'success';
    case 'CANCELLED': return 'error';
    case 'ONGOING': return 'info';
    case 'REQUESTED': return 'warning';
    default: return 'default';
  }
};

const RideManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ridesApi.getAll({ search: searchTerm, status: statusFilter || undefined, size: 50 });
      setRides(res.data.content);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, fetchData]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Ride Management</h1>
          <p className="text-slate-500 dark:text-slate-400">Monitor and manage all ride bookings.</p>
        </div>
        <div className="flex gap-4 items-center">
          <Button variant="outline" onClick={fetchData} disabled={loading} className="flex gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Sync
          </Button>
          <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1 shadow-sm">
            {['All', 'REQUESTED', 'ONGOING', 'COMPLETED'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab === 'All' ? '' : tab)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${(statusFilter === tab || (tab === 'All' && !statusFilter)) ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                {tab === 'All' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by ID, customer..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Table headers={['Ride ID', 'Participants', 'Route Info', 'Fare & Type', 'Status', 'Actions']}>
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">Loading rides...</td></tr>
            ) : rides.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">No rides found</td></tr>
            ) : rides.map((ride) => (
              <tr key={ride.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">#{ride.id?.slice(-6)}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(ride.createdAt)}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                        <User className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                      </div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{ride.customerName || 'Customer'}</span>
                    </div>
                    {ride.driverName && (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                          <Car className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <span className="text-sm text-slate-600 dark:text-slate-300">{ride.driverName}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1 max-w-[250px]">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">{ride.pickupLocation || 'N/A'}</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <Navigation className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                      <span className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">{ride.dropLocation || 'N/A'}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(ride.fare || 0)}</p>
                  <Badge variant="default" className="text-[10px] mt-1">{ride.paymentMethod || ride.paymentType || 'CASH'}</Badge>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={getStatusVariant(ride.status)}>
                    {ride.status}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <Button variant="ghost" size="icon" title="View Details">
                    <Eye className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default RideManagement;
