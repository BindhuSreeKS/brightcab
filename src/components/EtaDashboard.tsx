/**
 * EtaDashboard.tsx
 * Compact ETA + distance + ride-status card used by the Customer Tracking page.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Ruler, Navigation2, CheckCircle2, AlertCircle, Car } from 'lucide-react';

export type RideStatus =
  | 'SEARCHING'
  | 'DRIVER_ASSIGNED'
  | 'DRIVER_ARRIVING'
  | 'ARRIVED'
  | 'RIDE_STARTED'
  | 'ONGOING'
  | 'COMPLETED'
  | string;

export interface EtaDashboardProps {
  status: RideStatus;
  etaMinutes?: number | null;
  etaText?: string | null;
  distanceKm?: number | null;
  distanceText?: string | null;
  driverName?: string | null;
  vehicleModel?: string | null;
  vehicleNumber?: string | null;
  rating?: number | null;
  fare?: number | null;
  isLive?: boolean;
}

const statusConfig: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  SEARCHING: {
    label: 'Finding Captain…',
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    icon: <AlertCircle className="w-4 h-4 animate-pulse" />,
  },
  DRIVER_ASSIGNED: {
    label: 'Captain Assigned',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  DRIVER_ARRIVING: {
    label: 'Captain On the Way',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    icon: <Navigation2 className="w-4 h-4 animate-bounce" />,
  },
  ARRIVED: {
    label: 'Captain Arrived',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  RIDE_STARTED: {
    label: 'Ride in Progress',
    color: 'text-violet-600',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    icon: <Car className="w-4 h-4" />,
  },
  ONGOING: {
    label: 'Ride in Progress',
    color: 'text-violet-600',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    icon: <Car className="w-4 h-4" />,
  },
};

function getStatusCfg(status: string) {
  return (
    statusConfig[status?.toUpperCase()] ?? {
      label: status ?? 'Unknown',
      color: 'text-slate-500',
      bg: 'bg-slate-50 dark:bg-slate-800',
      icon: <AlertCircle className="w-4 h-4" />,
    }
  );
}

export default function EtaDashboard({
  status,
  etaMinutes,
  etaText,
  distanceKm,
  distanceText,
  driverName,
  vehicleModel,
  vehicleNumber,
  rating,
  fare,
  isLive = false,
}: EtaDashboardProps) {
  const cfg = getStatusCfg(status);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.25 }}
        className="space-y-3"
      >
        {/* Status Badge */}
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${cfg.color} ${cfg.bg}`}>
          {cfg.icon}
          {cfg.label}
          {isLive && (
            <span className="ml-1 flex items-center gap-1 text-emerald-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Live
            </span>
          )}
        </div>

        {/* ETA + Distance Row */}
        {(etaMinutes != null || distanceKm != null) && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                <Clock className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">ETA</p>
                <p className="font-black text-slate-900 dark:text-white">
                  {etaText ?? (etaMinutes != null ? `${etaMinutes} min` : '—')}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                <Ruler className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Distance</p>
                <p className="font-black text-slate-900 dark:text-white">
                  {distanceText ?? (distanceKm != null ? `${distanceKm.toFixed(1)} km` : '—')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Driver Info Row */}
        {driverName && (
          <div className="bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-[14px] bg-indigo-600 flex items-center justify-center text-white text-lg font-black">
                {driverName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight">
                  {driverName}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  {vehicleModel ?? 'Vehicle'}
                </p>
                {rating != null && (
                  <p className="text-[10px] font-bold text-amber-500">★ {rating.toFixed(1)}</p>
                )}
              </div>
            </div>
            <div className="text-right space-y-1">
              {vehicleNumber && (
                <span className="inline-block bg-indigo-600 text-white text-xs font-black px-3 py-1 rounded-xl">
                  {vehicleNumber}
                </span>
              )}
              {fare != null && (
                <p className="text-xs font-black text-slate-500 dark:text-slate-400">
                  ₹{fare.toFixed(0)}
                </p>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
