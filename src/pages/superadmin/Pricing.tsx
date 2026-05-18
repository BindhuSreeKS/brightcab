import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, Save, RefreshCcw, TrendingUp, Clock, MapPin, Loader2, Car, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardContent, Button, Badge } from '../../components/ui';
import { pricingApi, citiesApi } from '../../lib/api';
import { formatCurrency } from '../../lib/utils';

export default function PricingCommission() {
  const [pricings, setPricings] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  // Selections
  const [selectedCategory, setSelectedCategory] = useState('MINI');
  const [selectedCityId, setSelectedCityId] = useState<string | 'GLOBAL'>('GLOBAL');

  // Form State
  const [formData, setFormData] = useState<any>({});

  const categories = ['MINI', 'SEDAN', 'SUV', 'AUTO', 'BIKE'];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [pricingRes, citiesRes] = await Promise.all([
        pricingApi.getAll(),
        citiesApi.getActive()
      ]);
      setPricings(pricingRes.data);
      setCities(citiesRes.data || []);
      
      // Select appropriate pricing based on default selections
      loadPricingToForm(pricingRes.data, selectedCategory, 'GLOBAL');
    } catch (err: any) {
      setError(err.message || 'Failed to load pricing data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const loadPricingToForm = (allPricing: any[], category: string, cityId: string) => {
    const targetCityId = cityId === 'GLOBAL' ? null : cityId;
    const match = allPricing.find(p => p.category === category && p.cityId === targetCityId);
    
    if (match) {
      setFormData(match);
    } else {
      // Default empty state if not found
      setFormData({
        category,
        cityId: targetCityId,
        baseFare: 0,
        perKmRate: 0,
        perMinuteRate: 0,
        minimumFare: 0,
        surgePricingEnabled: false,
        surgePriceMultiplier: 1.0,
        nightPricingEnabled: false,
        nightSurgeMultiplier: 1.0,
        nightStartHour: 22,
        nightEndHour: 6,
        commissionPercentage: 20
      });
    }
  };

  // Handle Selection Change
  useEffect(() => {
    if (pricings.length > 0) {
      loadPricingToForm(pricings, selectedCategory, selectedCityId);
    }
  }, [selectedCategory, selectedCityId, pricings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : parseFloat(value) || 0
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      if (formData.id) {
        await pricingApi.update(formData.id, formData);
      } else {
        await pricingApi.create(formData);
      }
      await fetchData(); // Refresh data
      alert('Pricing updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to save pricing configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500"><Loader2 className="w-8 h-8 animate-spin mx-auto" /> Loading Pricing Data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pricing & Commission Control</h1>
          <p className="text-slate-500 dark:text-slate-400">Configure global and area-wise fare structures and surge multipliers.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-500 mb-1">Area (City)</label>
            <select 
              value={selectedCityId}
              onChange={(e) => setSelectedCityId(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold shadow-sm"
            >
              <option value="GLOBAL">🌐 Global Default</option>
              {cities.map(city => (
                <option key={city.id} value={city.id}>📍 {city.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-500 mb-1">Vehicle Category</label>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold shadow-sm"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>🚗 {cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 text-sm font-semibold border border-red-100">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}

      {!formData.id && (
        <div className="p-4 bg-amber-50 text-amber-700 rounded-xl flex items-center gap-3 text-sm font-semibold border border-amber-100">
          <AlertCircle className="w-5 h-5" /> No pricing configuration found for this specific area and category combination. You are viewing default zero-values.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Core Fare Card */}
        <Card>
          <CardHeader className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              <h3 className="font-bold text-slate-900 dark:text-white">Core Fare Settings</h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Base Fare</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                    <input type="number" name="baseFare" value={formData.baseFare || 0} onChange={handleChange} className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 font-bold" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Per Kilometer Charge</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                    <input type="number" name="perKmRate" value={formData.perKmRate || 0} onChange={handleChange} className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 font-bold" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Waiting Charges (Per Min)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                    <input type="number" name="perMinuteRate" value={formData.perMinuteRate || 0} onChange={handleChange} className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 font-bold" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Minimum Trip Fare</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                    <input type="number" name="minimumFare" value={formData.minimumFare || 0} onChange={handleChange} className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 font-bold" />
                  </div>
                </div>
             </div>
          </CardContent>
        </Card>

        {/* Commission Card */}
        <Card>
          <CardHeader className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
             <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              <h3 className="font-bold text-slate-900 dark:text-white">Platform Commission</h3>
            </div>
            <Badge variant="info">Revenue Settings</Badge>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
             <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Standard Commission Percentage</label>
                  <p className="text-xs text-slate-500 mb-2">The percentage of the total fare that Vazraa mobility retains.</p>
                  <div className="relative">
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                    <input type="number" name="commissionPercentage" value={formData.commissionPercentage || 0} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold text-2xl" />
                  </div>
                </div>
             </div>
          </CardContent>
        </Card>

        {/* Dynamic Pricing Card */}
        <Card className="lg:col-span-2">
           <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
             <h3 className="font-bold text-slate-900 dark:text-white">Dynamic Pricing & Surge Automations</h3>
           </CardHeader>
           <CardContent className="space-y-8 pt-6">
              
              {/* Surge Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-slate-100 dark:border-slate-800 pb-8">
                 <div>
                    <div className="flex items-center justify-between mb-2">
                       <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><TrendingUp className="w-4 h-4 text-rose-500"/> Peak Hour Surge</h4>
                       <label className="relative inline-flex items-center cursor-pointer">
                         <input type="checkbox" name="surgePricingEnabled" checked={formData.surgePricingEnabled || false} onChange={handleChange} className="sr-only peer" />
                         <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                       </label>
                    </div>
                    <p className="text-xs text-slate-500 mb-4">Automatically multiply fares during high demand or driver shortages.</p>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Surge Multiplier</label>
                      <div className="relative">
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">x</span>
                        <input type="number" step="0.1" name="surgePriceMultiplier" value={formData.surgePriceMultiplier || 1.0} onChange={handleChange} disabled={!formData.surgePricingEnabled} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 font-bold disabled:opacity-50" />
                      </div>
                    </div>
                 </div>

                 {/* Night Pricing */}
                 <div>
                    <div className="flex items-center justify-between mb-2">
                       <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><Clock className="w-4 h-4 text-blue-500"/> Late Night Charges</h4>
                       <label className="relative inline-flex items-center cursor-pointer">
                         <input type="checkbox" name="nightPricingEnabled" checked={formData.nightPricingEnabled || false} onChange={handleChange} className="sr-only peer" />
                         <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                       </label>
                    </div>
                    <p className="text-xs text-slate-500 mb-4">Apply a flat multiplier to trips taken during scheduled night hours.</p>
                    
                    <div className="grid grid-cols-3 gap-2">
                       <div className="space-y-2">
                         <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Multiplier</label>
                         <div className="relative">
                           <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">x</span>
                           <input type="number" step="0.1" name="nightSurgeMultiplier" value={formData.nightSurgeMultiplier || 1.0} onChange={handleChange} disabled={!formData.nightPricingEnabled} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 font-bold text-sm disabled:opacity-50" />
                         </div>
                       </div>
                       <div className="space-y-2">
                         <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Start Hour (0-23)</label>
                         <input type="number" min="0" max="23" name="nightStartHour" value={formData.nightStartHour || 22} onChange={handleChange} disabled={!formData.nightPricingEnabled} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 font-bold text-sm disabled:opacity-50" />
                       </div>
                       <div className="space-y-2">
                         <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">End Hour (0-23)</label>
                         <input type="number" min="0" max="23" name="nightEndHour" value={formData.nightEndHour || 6} onChange={handleChange} disabled={!formData.nightPricingEnabled} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 font-bold text-sm disabled:opacity-50" />
                       </div>
                    </div>
                 </div>
              </div>

              <div className="flex justify-end gap-4">
                 <Button variant="outline" onClick={fetchData} disabled={saving}>Cancel</Button>
                 <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-8">
                   {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                   Save {selectedCategory} Pricing
                 </Button>
              </div>

           </CardContent>
        </Card>
      </div>
    </div>
  );
}
