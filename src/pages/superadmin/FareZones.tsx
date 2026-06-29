import React, { useState, useEffect, useCallback } from 'react';
import {
  MapPin, Calendar, Plus, Trash2, Pencil, Loader2, Save, X,
  TrendingUp, Zap, Globe, Star
} from 'lucide-react';
import { Card, CardHeader, CardContent, Button, Badge, Table } from '../../components/ui';
import { fareZonesApi, citiesApi } from '../../lib/api';

// ─── Types ───────────────────────────────────────────────────────────────────
interface PopularDestination {
  id: string;
  city: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  demandMultiplier: number;
}

interface FestivalConfig {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  multiplier: number;
}

const defaultDest: Omit<PopularDestination, 'id'> = {
  city: 'Bengaluru', name: '', latitude: 12.9716, longitude: 77.5946,
  radius: 2.0, demandMultiplier: 1.1,
};

const defaultFest: Omit<FestivalConfig, 'id'> = {
  name: '', startDate: '', endDate: '', multiplier: 1.2,
};

// ─── Main Component ───────────────────────────────────────────────────────────
const FareZonesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'destinations' | 'festivals'>('destinations');

  // Destination state
  const [destinations, setDestinations] = useState<PopularDestination[]>([]);
  const [destLoading, setDestLoading] = useState(true);
  const [showDestModal, setShowDestModal] = useState(false);
  const [editingDest, setEditingDest] = useState<PopularDestination | null>(null);
  const [destForm, setDestForm] = useState<Omit<PopularDestination, 'id'>>(defaultDest);
  const [destSaving, setDestSaving] = useState(false);
  const [filterCity, setFilterCity] = useState('');
  const [cities, setCities] = useState<string[]>([]);

  // Festival state
  const [festivals, setFestivals] = useState<FestivalConfig[]>([]);
  const [festLoading, setFestLoading] = useState(true);
  const [showFestModal, setShowFestModal] = useState(false);
  const [editingFest, setEditingFest] = useState<FestivalConfig | null>(null);
  const [festForm, setFestForm] = useState<Omit<FestivalConfig, 'id'>>(defaultFest);
  const [festSaving, setFestSaving] = useState(false);

  // ─── Fetch data ─────────────────────────────────────────────────────────────
  const fetchDestinations = useCallback(async () => {
    setDestLoading(true);
    try {
      const data = await fareZonesApi.getDestinations(filterCity || undefined);
      setDestinations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load destinations', err);
    } finally {
      setDestLoading(false);
    }
  }, [filterCity]);

  const fetchFestivals = useCallback(async () => {
    setFestLoading(true);
    try {
      const data = await fareZonesApi.getFestivals();
      setFestivals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load festivals', err);
    } finally {
      setFestLoading(false);
    }
  }, []);

  const fetchCities = useCallback(async () => {
    try {
      const res = await citiesApi.getAll(0, 50);
      const list = res?.data?.content ?? [];
      setCities(list.map((c: any) => c.name));
    } catch {
      setCities(['Bengaluru', 'Mysuru', 'Tumakuru', 'Mangaluru']);
    }
  }, []);

  useEffect(() => { fetchDestinations(); }, [fetchDestinations]);
  useEffect(() => { fetchFestivals(); }, [fetchFestivals]);
  useEffect(() => { fetchCities(); }, [fetchCities]);

  // ─── Destination CRUD ────────────────────────────────────────────────────────
  const openNewDest = () => { setEditingDest(null); setDestForm(defaultDest); setShowDestModal(true); };
  const openEditDest = (d: PopularDestination) => {
    setEditingDest(d);
    setDestForm({ city: d.city, name: d.name, latitude: d.latitude, longitude: d.longitude, radius: d.radius, demandMultiplier: d.demandMultiplier });
    setShowDestModal(true);
  };

  const handleSaveDest = async (e: React.FormEvent) => {
    e.preventDefault();
    setDestSaving(true);
    try {
      if (editingDest) {
        await fareZonesApi.updateDestination(editingDest.id, destForm);
      } else {
        await fareZonesApi.createDestination(destForm as any);
      }
      setShowDestModal(false);
      fetchDestinations();
    } catch (err: any) {
      alert(err.message || 'Failed to save destination zone');
    } finally {
      setDestSaving(false);
    }
  };

  const handleDeleteDest = async (id: string) => {
    if (!window.confirm('Delete this popular destination zone?')) return;
    try {
      await fareZonesApi.deleteDestination(id);
      fetchDestinations();
    } catch { alert('Failed to delete zone'); }
  };

  // ─── Festival CRUD ────────────────────────────────────────────────────────────
  const openNewFest = () => { setEditingFest(null); setFestForm(defaultFest); setShowFestModal(true); };
  const openEditFest = (f: FestivalConfig) => {
    setEditingFest(f);
    setFestForm({ name: f.name, startDate: f.startDate, endDate: f.endDate, multiplier: f.multiplier });
    setShowFestModal(true);
  };

  const handleSaveFest = async (e: React.FormEvent) => {
    e.preventDefault();
    setFestSaving(true);
    try {
      if (editingFest) {
        await fareZonesApi.updateFestival(editingFest.id, festForm);
      } else {
        await fareZonesApi.createFestival(festForm as any);
      }
      setShowFestModal(false);
      fetchFestivals();
    } catch (err: any) {
      alert(err.message || 'Failed to save festival config');
    } finally {
      setFestSaving(false);
    }
  };

  const handleDeleteFest = async (id: string) => {
    if (!window.confirm('Delete this festival surge config?')) return;
    try {
      await fareZonesApi.deleteFestival(id);
      fetchFestivals();
    } catch { alert('Failed to delete festival'); }
  };

  // ─── Multiplier Badge ─────────────────────────────────────────────────────────
  const MultiplierBadge = ({ value }: { value: number }) => {
    const pct = Math.round((value - 1) * 100);
    const color = value <= 1.0 ? 'default' : value <= 1.1 ? 'warning' : value <= 1.3 ? 'warning' : 'danger';
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold
        ${color === 'default' ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' : ''}
        ${color === 'warning' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : ''}
        ${color === 'danger' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : ''}
      `}>
        <TrendingUp className="w-3 h-3" />
        {value}× {pct > 0 ? `(+${pct}%)` : ''}
      </span>
    );
  };

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-violet-500" />
            Fare Surge Zones
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-0.5">
            Configure demand zones and festival multipliers for dynamic pricing
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-violet-500">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{destinations.length}</p>
              <p className="text-xs text-slate-500">Active Demand Zones</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Star className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{festivals.length}</p>
              <p className="text-xs text-slate-500">Festival Configs</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Globe className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{new Set(destinations.map(d => d.city)).size}</p>
              <p className="text-xs text-slate-500">Cities Covered</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Selector */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
        <button
          id="tab-destinations"
          onClick={() => setActiveTab('destinations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'destinations'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <MapPin className="w-4 h-4" /> Popular Destination Zones
        </button>
        <button
          id="tab-festivals"
          onClick={() => setActiveTab('festivals')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'festivals'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Calendar className="w-4 h-4" /> Festival Surge Configs
        </button>
      </div>

      {/* ── Destinations Tab ──────────────────────────────────────────────────── */}
      {activeTab === 'destinations' && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Popular Destination Zones</h3>
              <p className="text-xs text-slate-500 mt-0.5">High-demand areas that apply a surge multiplier</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <select
                value={filterCity}
                onChange={e => setFilterCity(e.target.value)}
                className="flex-1 sm:w-40 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                id="dest-city-filter"
              >
                <option value="">All Cities</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <Button id="add-destination-btn" onClick={openNewDest} className="flex items-center gap-2 shrink-0">
                <Plus className="w-4 h-4" /> Add Zone
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table headers={['Zone Name', 'City', 'Coordinates', 'Radius', 'Multiplier', 'Actions']}>
              {destLoading ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" /> Loading zones...
                </td></tr>
              ) : destinations.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                  <MapPin className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  No destination zones configured. Add one to enable surge pricing.
                </td></tr>
              ) : destinations.map(d => (
                <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{d.name}</td>
                  <td className="px-6 py-4">
                    <Badge variant="default">{d.city}</Badge>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                    {d.latitude.toFixed(4)}, {d.longitude.toFixed(4)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{d.radius} km</td>
                  <td className="px-6 py-4"><MultiplierBadge value={d.demandMultiplier} /></td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditDest(d)} className="text-slate-500 hover:text-blue-600">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteDest(d.id)} className="text-slate-500 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </Table>
          </CardContent>
        </Card>
      )}

      {/* ── Festivals Tab ─────────────────────────────────────────────────────── */}
      {activeTab === 'festivals' && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Festival Surge Configs</h3>
              <p className="text-xs text-slate-500 mt-0.5">Override pricing for festivals, holidays, and special events</p>
            </div>
            <Button id="add-festival-btn" onClick={openNewFest} className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Festival
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table headers={['Festival Name', 'Start Date', 'End Date', 'Surge Multiplier', 'Status', 'Actions']}>
              {festLoading ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" /> Loading festivals...
                </td></tr>
              ) : festivals.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  No festival configs. Add one to apply special pricing on event days.
                </td></tr>
              ) : festivals.map(f => {
                const now = new Date();
                const start = new Date(f.startDate);
                const end = new Date(f.endDate);
                const isActive = now >= start && now <= end;
                const isPast = now > end;
                return (
                  <tr key={f.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-400 shrink-0" />
                      {f.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{f.startDate}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{f.endDate}</td>
                    <td className="px-6 py-4"><MultiplierBadge value={f.multiplier} /></td>
                    <td className="px-6 py-4">
                      <Badge variant={isActive ? 'success' : isPast ? 'default' : 'warning'}>
                        {isActive ? '🟢 ACTIVE' : isPast ? 'PAST' : '⏳ UPCOMING'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditFest(f)} className="text-slate-500 hover:text-blue-600">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteFest(f.id)} className="text-slate-500 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </Table>
          </CardContent>
        </Card>
      )}

      {/* ── Destination Modal ─────────────────────────────────────────────────── */}
      {showDestModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg bg-white dark:bg-slate-900 shadow-2xl">
            <CardHeader className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                {editingDest ? 'Edit Destination Zone' : 'Add Destination Zone'}
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setShowDestModal(false)}><X className="w-4 h-4" /></Button>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSaveDest} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Zone Name *</label>
                    <input required value={destForm.name} onChange={e => setDestForm({...destForm, name: e.target.value})}
                      placeholder="e.g. Kempegowda Airport"
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">City *</label>
                    <select required value={destForm.city} onChange={e => setDestForm({...destForm, city: e.target.value})}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500">
                      {cities.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Latitude *</label>
                    <input required type="number" step="0.0001" value={destForm.latitude}
                      onChange={e => setDestForm({...destForm, latitude: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Longitude *</label>
                    <input required type="number" step="0.0001" value={destForm.longitude}
                      onChange={e => setDestForm({...destForm, longitude: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Radius (km)</label>
                    <input type="number" step="0.5" min="0.5" max="50" value={destForm.radius}
                      onChange={e => setDestForm({...destForm, radius: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Demand Multiplier
                      <span className="text-xs text-slate-400 ml-1">(e.g. 1.2 = +20%)</span>
                    </label>
                    <input type="number" step="0.05" min="1.0" max="3.0" value={destForm.demandMultiplier}
                      onChange={e => setDestForm({...destForm, demandMultiplier: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowDestModal(false)}>Cancel</Button>
                  <Button type="submit" disabled={destSaving} className="flex-1 flex justify-center items-center gap-2">
                    {destSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {editingDest ? 'Update Zone' : 'Save Zone'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Festival Modal ────────────────────────────────────────────────────── */}
      {showFestModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl">
            <CardHeader className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                {editingFest ? 'Edit Festival Config' : 'Add Festival Surge'}
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setShowFestModal(false)}><X className="w-4 h-4" /></Button>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSaveFest} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Festival / Event Name *</label>
                  <input required value={festForm.name} onChange={e => setFestForm({...festForm, name: e.target.value})}
                    placeholder="e.g. Diwali 2025"
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Start Date *</label>
                    <input required type="date" value={festForm.startDate}
                      onChange={e => setFestForm({...festForm, startDate: e.target.value})}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">End Date *</label>
                    <input required type="date" value={festForm.endDate}
                      onChange={e => setFestForm({...festForm, endDate: e.target.value})}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Surge Multiplier
                    <span className="text-xs text-slate-400 ml-1">(1.0 = no surge, 1.5 = +50%)</span>
                  </label>
                  <input type="number" step="0.05" min="1.0" max="5.0" value={festForm.multiplier}
                    onChange={e => setFestForm({...festForm, multiplier: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    ⚠️ A {festForm.multiplier}× surge will increase all fares by <strong>{Math.round((festForm.multiplier - 1) * 100)}%</strong> during this period.
                  </p>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowFestModal(false)}>Cancel</Button>
                  <Button type="submit" disabled={festSaving} className="flex-1 flex justify-center items-center gap-2 bg-amber-500 hover:bg-amber-600">
                    {festSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {editingFest ? 'Update Config' : 'Save Config'}
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

export default FareZonesPage;
