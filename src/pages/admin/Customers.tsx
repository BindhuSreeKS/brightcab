import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Mail, Phone, Ban, History, Eye, RefreshCw } from 'lucide-react';
import { Card, CardContent, Button, Badge, Table } from '../../components/ui';
import { formatCurrency } from '../../lib/utils';
import { customersApi } from '../../lib/api';

const CustomerManagement = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [custRes, statsRes] = await Promise.all([
        customersApi.getAll({ search: searchTerm, size: 50 }),
        customersApi.getStats()
      ]);
      setCustomers(custRes.data.content);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, fetchData]);

  const toggleBlock = async (id: string, currentlyBlocked: boolean) => {
    try {
      if (currentlyBlocked) {
        await customersApi.unblock(id);
      } else {
        await customersApi.block(id);
      }
      fetchData();
    } catch (err) {
      alert('Action failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Customer Management</h1>
          <p className="text-slate-500 dark:text-slate-400">Total {stats?.total || 0} registered passengers.</p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={loading} className="flex gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Sync
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search customers..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </Button>
          </div>

          <Table headers={['Customer', 'Contact', 'Rides', 'Rating', 'Wallet', 'Status', 'Actions']}>
            {loading ? (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-400">Loading customers...</td></tr>
            ) : customers.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-400">No customers found</td></tr>
            ) : customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold shrink-0">
                      {customer.firstName?.charAt(0) || customer.name?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{customer.firstName} {customer.lastName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">ID: {customer.id?.slice(-6)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                      <Mail className="w-3 h-3" /> {customer.email}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                      <Phone className="w-3 h-3" /> {customer.phone}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{customer.totalRides || 0}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-amber-500">★</span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{customer.rating?.toFixed(1) || '5.0'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">
                  {formatCurrency(customer.walletBalance || 0)}
                </td>
                <td className="px-6 py-4">
                  <Badge variant={customer.status === 'ACTIVE' ? 'success' : 'error'}>
                    {customer.status}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => toggleBlock(customer.id, customer.status !== 'ACTIVE')} title={customer.status === 'ACTIVE' ? "Block" : "Unblock"} className={customer.status === 'ACTIVE' ? "text-red-500 hover:text-red-600 hover:bg-red-50" : "text-green-500"}>
                      <Ban className="w-4 h-4" />
                    </Button>
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

export default CustomerManagement;
