import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, UserPlus, Search, MoreVertical, Edit, Trash2, Key, RefreshCw, X, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardContent, Button, Badge, Table } from '../../components/ui';
import { adminsApi } from '../../lib/api';
import { formatDate } from '../../lib/utils';

const AdminManagement = () => {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', role: 'ADMIN' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminsApi.getAll({ search: searchTerm, size: 50 });
      setAdmins(res.data.content);
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this admin?')) return;
    try {
      await adminsApi.delete(id);
      fetchData();
    } catch (err) {
      alert('Failed to delete admin');
    }
  };

  const handleStatusChange = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await adminsApi.changeStatus(id, newStatus);
      fetchData();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminsApi.create(formData);
      setShowModal(false);
      setFormData({ name: '', email: '', phone: '', password: '', role: 'ADMIN' });
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to create admin');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Management</h1>
          <p className="text-slate-500 dark:text-slate-400">Create, edit and manage platform administrators.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData} disabled={loading} className="flex gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Sync
          </Button>
          <Button className="flex items-center gap-2" onClick={() => setShowModal(true)}>
            <UserPlus className="w-4 h-4" />
            <span>Create New Admin</span>
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
                placeholder="Search admins by name or email..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Table headers={['Admin Name', 'Role', 'Email', 'Status', 'Last Login', 'Actions']}>
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">Loading admins...</td></tr>
            ) : admins.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">No admins found</td></tr>
            ) : admins.map((admin) => (
              <tr key={admin.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold">
                      {admin.name?.charAt(0) || 'A'}
                    </div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{admin.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={admin.role === 'SUPER_ADMIN' ? 'success' : 'info'} className="text-[10px]">{admin.role}</Badge>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                  {admin.email}
                </td>
                <td className="px-6 py-4">
                  <Badge variant={admin.status === 'ACTIVE' ? 'success' : 'error'}>
                    {admin.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-xs text-slate-500">
                  {admin.lastLogin ? formatDate(admin.lastLogin) : 'Never'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleStatusChange(admin.id, admin.status)} title="Toggle Status"><Key className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(admin.id)} title="Delete" className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        </CardContent>
      </Card>

      {/* Add Admin Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white dark:bg-slate-900 border-none shadow-2xl">
            <CardHeader className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Create New Admin</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}><X className="w-4 h-4" /></Button>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                  <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Phone Number</label>
                  <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Role</label>
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-indigo-500">
                    <option value="ADMIN">ADMIN</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Temporary Password</label>
                  <input required type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="pt-4">
                  <Button type="submit" disabled={saving} className="w-full flex justify-center items-center gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Administrator'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;
