import React, { useState, useEffect, useCallback } from 'react';
import { Globe, Plus, Search, Map, CheckCircle2, XCircle, Loader2, Save, X } from 'lucide-react';
import { Card, CardHeader, CardContent, Button, Badge, Table } from '../../components/ui';
import { citiesApi } from '../../lib/api';

const CityAreaManagement = () => {
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', state: '', country: 'India', active: true, radiusKm: 50 });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await citiesApi.getAll(0, 50);
      setCities(res.data.content);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await citiesApi.create(formData);
      setShowModal(false);
      setFormData({ name: '', state: '', country: 'India', active: true, radiusKm: 50 });
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to create city');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await citiesApi.toggle(id, !currentStatus);
      fetchData();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">City & Area Management</h1>
          <p className="text-slate-500 dark:text-slate-400">Configure regions where services are available.</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>Add New City</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader className="flex items-center justify-between border-b-0 pb-0">
             <h3 className="font-bold text-slate-900 dark:text-white">Service Cities</h3>
             <Button variant="ghost" size="sm" onClick={fetchData} disabled={loading}>Refresh</Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table headers={['City Name', 'State/Country', 'Radius', 'Status', 'Actions']}>
               {loading ? (
                 <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">Loading cities...</td></tr>
               ) : cities.length === 0 ? (
                 <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">No cities configured</td></tr>
               ) : cities.map(city => (
                 <tr key={city.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                   <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{city.name}</td>
                   <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{city.state}, {city.country}</td>
                   <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">{city.radiusKm} KM</td>
                   <td className="px-6 py-4">
                     <Badge variant={city.active ? 'success' : 'default'}>
                       {city.active ? 'ACTIVE' : 'INACTIVE'}
                     </Badge>
                   </td>
                   <td className="px-6 py-4 flex gap-2">
                     <Button variant="outline" size="sm" onClick={() => handleToggleStatus(city.id, city.active)}>
                       Toggle Status
                     </Button>
                   </td>
                 </tr>
               ))}
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
           <Card>
             <CardHeader>
               <h3 className="font-bold text-slate-900 dark:text-white">Geofencing Stats</h3>
             </CardHeader>
             <CardContent>
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/30 mb-4">
                   <Map className="w-8 h-8 text-indigo-600 mb-2" />
                   <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-100">Live Regions</h4>
                   <p className="text-[10px] text-indigo-700 dark:text-indigo-300">You have {cities.filter(c => c.active).length} active operational zones.</p>
                </div>
             </CardContent>
           </Card>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white dark:bg-slate-900">
            <CardHeader className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-lg">Add New City</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}><X className="w-4 h-4" /></Button>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">City Name</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">State</label>
                  <input required value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Operating Radius (KM)</label>
                  <input type="number" required value={formData.radiusKm} onChange={e => setFormData({...formData, radiusKm: Number(e.target.value)})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg" />
                </div>
                <Button type="submit" disabled={saving} className="w-full mt-4 flex justify-center items-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save City
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CityAreaManagement;
