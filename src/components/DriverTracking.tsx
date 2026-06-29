/**
 * DriverTracking.tsx
 * Self-contained component embedded in the driver ActiveRide page.
 * Responsibilities:
 *  - Requests browser geolocation every 10 s
 *  - POSTs to /driver/location/update (authenticated)
 *  - Shows driver's own position on a LiveMap
 *  - Displays heartbeat status + accuracy info
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Navigation2, Wifi, WifiOff, Crosshair, Clock } from 'lucide-react';
import LiveMap, { LatLng } from './LiveMap';
import { driverLocationApi } from '../lib/api';

export interface DriverTrackingProps {
  rideId?: string;
  pickupLatitude?: number;
  pickupLongitude?: number;
  dropLatitude?: number;
  dropLongitude?: number;
  pickupLabel?: string;
  dropLabel?: string;
  /** Called each time a location update succeeds */
  onLocationUpdate?: (lat: number, lng: number) => void;
}

interface GeoState {
  position: LatLng | null;
  accuracy: number | null;
  lastUpdated: Date | null;
  sending: boolean;
  online: boolean;
  error: string | null;
}

const HEARTBEAT_INTERVAL_MS = 10_000; // 10 seconds

export default function DriverTracking({
  rideId,
  pickupLatitude,
  pickupLongitude,
  dropLatitude,
  dropLongitude,
  pickupLabel = 'Pickup',
  dropLabel = 'Drop',
  onLocationUpdate,
}: DriverTrackingProps) {
  const [geo, setGeo] = useState<GeoState>({
    position: null,
    accuracy: null,
    lastUpdated: null,
    sending: false,
    online: false,
    error: null,
  });

  const watchIdRef = useRef<number | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const latestPos = useRef<LatLng | null>(null);

  // ── Push location to backend ─────────────────────────────────────────────
  const pushLocation = async (lat: number, lng: number) => {
    setGeo((prev) => ({ ...prev, sending: true }));
    try {
      await driverLocationApi.updateLocation({ latitude: lat, longitude: lng, rideId });
      setGeo((prev) => ({
        ...prev,
        sending: false,
        online: true,
        lastUpdated: new Date(),
        error: null,
      }));
      onLocationUpdate?.(lat, lng);
    } catch (err: any) {
      setGeo((prev) => ({
        ...prev,
        sending: false,
        online: false,
        error: err?.message ?? 'Upload failed',
      }));
    }
  };

  // ── Start geo watch + heartbeat on mount ──────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeo((prev) => ({ ...prev, error: 'Geolocation not supported' }));
      return;
    }

    // Watch for position changes
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        latestPos.current = { lat: latitude, lng: longitude };
        setGeo((prev) => ({
          ...prev,
          position: { lat: latitude, lng: longitude },
          accuracy: Math.round(accuracy),
          error: null,
        }));
      },
      (err) => {
        setGeo((prev) => ({ ...prev, error: err.message }));
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 5_000 },
    );

    // Heartbeat: push every 10 s
    heartbeatRef.current = setInterval(() => {
      if (latestPos.current) {
        pushLocation(latestPos.current.lat, latestPos.current.lng);
      }
    }, HEARTBEAT_INTERVAL_MS);

    // Push immediately on first fix
    const firstPushTimer = setTimeout(() => {
      if (latestPos.current) {
        pushLocation(latestPos.current.lat, latestPos.current.lng);
      }
    }, 2_000);

    return () => {
      if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      clearTimeout(firstPushTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rideId]);

  // ── Map props ─────────────────────────────────────────────────────────────
  const pickupPos: LatLng | null =
    pickupLatitude && pickupLongitude
      ? { lat: pickupLatitude, lng: pickupLongitude }
      : null;

  const dropPos: LatLng | null =
    dropLatitude && dropLongitude
      ? { lat: dropLatitude, lng: dropLongitude }
      : null;

  const center: LatLng = geo.position ?? pickupPos ?? { lat: 12.9716, lng: 77.5946 };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const secondsSinceUpdate = geo.lastUpdated
    ? Math.round((Date.now() - geo.lastUpdated.getTime()) / 1000)
    : null;

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Map */}
      <div className="flex-1 min-h-0 relative">
        <LiveMap
          className="w-full h-full"
          center={center}
          zoom={15}
          driverPosition={geo.position}
          pickupPosition={pickupPos}
          dropPosition={dropPos}
          pickupLabel={pickupLabel}
          dropLabel={dropLabel}
        />

        {/* Status overlay */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-3 left-3 z-10"
        >
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2 shadow-xl flex items-center gap-2.5">
            {geo.online ? (
              <Wifi className="w-4 h-4 text-emerald-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500 animate-pulse" />
            )}
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none">
                Location
              </p>
              <p className={`text-xs font-black ${geo.online ? 'text-emerald-600' : 'text-red-500'}`}>
                {geo.online ? 'Broadcasting' : geo.error ?? 'Offline'}
              </p>
            </div>

            {geo.accuracy != null && (
              <>
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />
                <div className="flex items-center gap-1 text-slate-500">
                  <Crosshair className="w-3 h-3" />
                  <span className="text-[11px] font-bold">±{geo.accuracy}m</span>
                </div>
              </>
            )}

            {secondsSinceUpdate != null && (
              <>
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />
                <div className="flex items-center gap-1 text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span className="text-[11px] font-bold">{secondsSinceUpdate}s ago</span>
                </div>
              </>
            )}

            {geo.sending && (
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            )}
          </div>
        </motion.div>

        {/* Coordinates chip */}
        {geo.position && (
          <div className="absolute bottom-3 left-3 z-10">
            <div className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-mono px-3 py-1.5 rounded-xl flex items-center gap-2">
              <Navigation2 className="w-3 h-3 text-indigo-400" />
              {geo.position.lat.toFixed(5)}, {geo.position.lng.toFixed(5)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
