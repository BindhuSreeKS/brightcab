import React, { useState } from 'react';
import { Megaphone, Plus, Search, Filter, Calendar, Tag, Users, ArrowUpRight, Copy, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardContent, Button, Input, Badge, StatsCard } from '../../components/ui';

interface PromoCode {
  id: string;
  code: string;
  type: 'Percentage' | 'Fixed Amount';
  value: string;
  expiryDate: string;
  usageCount: number;
  limit: number;
  status: 'Active' | 'Expired' | 'Scheduled';
  category: 'First Ride' | 'Seasonal' | 'Referral';
}

const PROMO_CODES: PromoCode[] = [
  { id: '1', code: 'WELCOME50', type: 'Percentage', value: '50%', expiryDate: '2024-12-31', usageCount: 1240, limit: 5000, status: 'Active', category: 'First Ride' },
  { id: '2', code: 'SUMMER24', type: 'Percentage', value: '20%', expiryDate: '2024-08-31', usageCount: 4500, limit: 10000, status: 'Active', category: 'Seasonal' },
  { id: '3', code: 'REF500', type: 'Fixed Amount', value: '₹500', expiryDate: '2025-01-01', usageCount: 890, limit: 2000, status: 'Active', category: 'Referral' },
  { id: '4', code: 'DIWALI24', type: 'Percentage', value: '30%', expiryDate: '2024-11-15', usageCount: 0, limit: 5000, status: 'Scheduled', category: 'Seasonal' },
];

export default function PromotionManagement() {
  const [promos, setPromos] = useState<PromoCode[]>(PROMO_CODES);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Promotions & Campaigns</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage promo codes, referrals, and marketing campaigns</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Marketing Calendar
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Campaign
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Active Promos" value="12" icon={Tag} color="indigo" trend={{ value: '+2', positive: true }} />
        <StatsCard title="Campaign Conversions" value="18.5%" icon={ArrowUpRight} color="green" trend={{ value: '+1.2%', positive: true }} />
        <StatsCard title="Total Discounts Given" value="₹4.2L" icon={Users} color="blue" trend={{ value: '+12%', positive: true }} />
        <StatsCard title="Upcoming Campaigns" value="3" icon={Megaphone} color="orange" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input className="pl-10" placeholder="Search promo codes..." />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="pb-4 pt-2 font-semibold text-slate-900 dark:text-white">Promo Code</th>
                  <th className="pb-4 pt-2 font-semibold text-slate-900 dark:text-white">Details</th>
                  <th className="pb-4 pt-2 font-semibold text-slate-900 dark:text-white">Category</th>
                  <th className="pb-4 pt-2 font-semibold text-slate-900 dark:text-white">Usage (Count/Limit)</th>
                  <th className="pb-4 pt-2 font-semibold text-slate-900 dark:text-white">Expiry</th>
                  <th className="pb-4 pt-2 font-semibold text-slate-900 dark:text-white">Status</th>
                  <th className="pb-4 pt-2 font-semibold text-slate-900 dark:text-white text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {promos.map(promo => (
                  <tr key={promo.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-2 capitalize">
                        <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded font-mono text-indigo-600 font-bold">{promo.code}</code>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{promo.value} {promo.type === 'Percentage' ? 'Off' : ''}</span>
                    </td>
                    <td className="py-4">
                      <Badge variant="secondary">{promo.category}</Badge>
                    </td>
                    <td className="py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span>{promo.usageCount} / {promo.limit}</span>
                          <span>{Math.round((promo.usageCount / promo.limit) * 100)}%</span>
                        </div>
                        <div className="w-32 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-500" 
                            style={{ width: `${(promo.usageCount / promo.limit) * 100}%` }} 
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-slate-600 dark:text-slate-400">
                      {promo.expiryDate}
                    </td>
                    <td className="py-4">
                      <Badge variant={
                        promo.status === 'Active' ? 'success' : 
                        promo.status === 'Scheduled' ? 'secondary' : 'error'
                      }>
                        {promo.status}
                      </Badge>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm"><Edit2 className="w-4 h-4 text-slate-400" /></Button>
                        <Button variant="ghost" size="sm"><Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500" /></Button>
                        <Button variant="ghost" size="sm"><MoreVertical className="w-4 h-4 text-slate-400" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Referral Program</h2>
            <p className="text-sm text-slate-500">Configure global referral rewards for customers and drivers</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/30">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-slate-900 dark:text-white">Customer Referral</span>
                <Badge variant="success">Active</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Referrer Gets</label>
                  <p className="font-bold text-slate-900 dark:text-white">₹100 Coupon</p>
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Friend Gets</label>
                  <p className="font-bold text-slate-900 dark:text-white">50% off first ride</p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/30">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-slate-900 dark:text-white">Driver Referral</span>
                <Badge variant="success">Active</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Referrer Gets</label>
                  <p className="font-bold text-slate-900 dark:text-white">₹500 Bonus</p>
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Friend Requirement</label>
                  <p className="font-bold text-slate-900 dark:text-white">Complete 50 rides</p>
                </div>
              </div>
            </div>
            <Button className="w-full">Update Referral Settings</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Upcoming Campaigns</h2>
            <p className="text-sm text-slate-500">Marketing initiatives scheduled for the next 30 days</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Monsoon Magic', period: 'July (Full Month)', discount: 'Flat 15% off', targeted: 'All Users' },
                { name: 'Night Owl Series', period: 'Every Weekend', discount: 'Flat ₹50 off', targeted: 'Late Night Riders' },
                { name: 'Loyalty Upgrade', period: 'Ongoing', discount: 'Point Multipliers', targeted: 'Top 10% Users' }
              ].map((campaign, i) => (
                <div key={i} className="flex items-center gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer">
                  <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 dark:text-white">{campaign.name}</p>
                    <p className="text-xs text-slate-500">{campaign.period} • {campaign.discount}</p>
                  </div>
                  <Badge variant="outline">{campaign.targeted}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
