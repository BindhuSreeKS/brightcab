/**
 * admin/LiveTracking.tsx  (upgraded)
 * Features:
 *  - Leaflet map via LiveMap component
 *  - WebSocket (STOMP) → /topic/admin/rides updates all driver markers live
 *  - When a ride is selected, fetches RideTracking doc to get real route polyline
 *  - Right sidebar: active ride list + per-ride ETA / status info
 *  - Stats bar: total active, drivers online, avg ETA
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  RefreshCw,
  Activity,
  Search,
  Car,
  Clock,
  Ruler,
  MapPin,
  Navigation2,
  AlertTriangle,
  X,
} from 'lucide-react';
import { Card, CardContent, Button, Badge } from '../../components/ui';
import LiveMap, { LatLng } from '../../components/LiveMap';
import { ridesApi, rideTrackingApi } from '../../lib/api';
import { Client } from '@stomp/stompjs';
import L from 'leaflet';
import toast from 'react-hot-toast';

// ── Types ─────────────────────────────────────────────────────────────────────
interface DriverPin {
  driverId: string;
  rideId?: string;
  lat: number;
  lng: number;
  etaMinutes?: number;
  distanceKm?: number;
  status?: string;
  ts: number;
}

// ── Status helpers ─────────────────────────────────────────────────────────────
const statusColor: Record<string, string> = {
  SEARCHING: 'bg-amber-100 text-amber-700',
  ACCEPTED: 'bg-blue-100 text-blue-700',
  DRIVER_ASSIGNED: 'bg-indigo-100 text-indigo-700',
  DRIVER_ARRIVING: 'bg-violet-100 text-violet-700',
  ARRIVED: 'bg-teal-100 text-teal-700',
  RIDE_STARTED: 'bg-emerald-100 text-emerald-700',
  ONGOING: 'bg-emerald-100 text-emerald-700',
};

function statusBadge(status: string) {
  const cls = statusColor[status?.toUpperCase()] ?? 'bg-slate-100 text-slate-600';
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide ${cls}`}>
      {status}
    </span>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function LiveTracking() {
  const [searchParams] = useSearchParams();
  const rideIdParam = searchParams.get('rideId');

  const [activeRides, setActiveRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRideId, setSelectedRideId] = useState<string | null>(rideIdParam);
  const [selectedTracking, setSelectedTracking] = useState<any>(null);
  const [driverPins, setDriverPins] = useState<Record<string, DriverPin>>({});

  // Leaflet refs (used for non-selected driver markers only; selected ride uses LiveMap)
  const leafletMarkersRef = useRef<Record<string, L.Marker>>({});
  const leafletMapRef = useRef<L.Map | null>(null);
  const stompRef = useRef<Client | null>(null);

  // ── Fetch active rides ────────────────────────────────────────────────────
  const fetchActiveRides = useCallback(async () => {
    try {
      setLoading(true);
      const res = await ridesApi.getAll({ page: 0, size: 100 });
      const content = res.data?.content ?? [];
      setActiveRides(
        content.filter((r: any) =>
          ['SEARCHING', 'ACCEPTED', 'DRIVER_ASSIGNED', 'DRIVER_ARRIVING', 'ARRIVED', 'RIDE_STARTED', 'ONGOING'].includes(
            r.status,
          ),
        ),
      );
    } catch {
      toast.error('Failed to load active rides.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveRides();
    const t = setInterval(fetchActiveRides, 30_000);
    return () => clearInterval(t);
  }, [fetchActiveRides]);

  // ── Fetch RideTracking doc when selection changes ──────────────────────────
  useEffect(() => {
    if (!selectedRideId) {
      setSelectedTracking(null);
      return;
    }
    rideTrackingApi
      .getTracking(selectedRideId)
      .then((res) => setSelectedTracking(res.data ?? null))
      .catch(() => setSelectedTracking(null));
  }, [selectedRideId]);

  // ── WebSocket ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const wsProto = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const brokerUrl = `${wsProto}://${window.location.hostname}:8080/api/ws`;

    const client = new Client({
      brokerURL: brokerUrl,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      setWsConnected(true);

      // General admin tracking
      client.subscribe('/topic/admin/rides', (msg) => {
        const p = JSON.parse(msg.body) as {
          driverId: string;
          rideId?: string;
          latitude: number;
          longitude: number;
          timestamp: number;
        };
        setDriverPins((prev) => ({
          ...prev,
          [p.driverId]: {
            driverId: p.driverId,
            rideId: p.rideId,
            lat: p.latitude,
            lng: p.longitude,
            ts: p.timestamp,
          },
        }));
      });

      // Subscribe to selected ride specific topic for ETA updates
      if (selectedRideId) {
        client.subscribe(`/topic/ride/${selectedRideId}/location`, (msg) => {
          const p = JSON.parse(msg.body);
          setSelectedTracking((prev: any) => ({
            ...prev,
            driverLatitude: p.latitude,
            driverLongitude: p.longitude,
            etaMinutes: p.etaMinutes ?? prev?.etaMinutes,
            distanceKm: p.distanceKm ?? prev?.distanceKm,
            etaText: p.etaText ?? prev?.etaText,
            distanceText: p.distanceText ?? prev?.distanceText,
            status: p.status ?? prev?.status,
          }));
        });
      }
    };

    client.onDisconnect = () => setWsConnected(false);
    client.activate();
    stompRef.current = client;

    return () => {
      client.deactivate();
      stompRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRideId]);

  // ── Derived map props for selected ride ───────────────────────────────────
  const selectedRide = activeRides.find((r) => r.id === selectedRideId) ?? null;

  const driverPos: LatLng | null =
    selectedTracking?.driverLatitude && selectedTracking?.driverLongitude
      ? { lat: selectedTracking.driverLatitude, lng: selectedTracking.driverLongitude }
      : driverPins[selectedRide?.driverId ?? '']
      ? { lat: driverPins[selectedRide!.driverId].lat, lng: driverPins[selectedRide!.driverId].lng }
      : null;

  const pickupPos: LatLng | null =
    selectedRide?.pickupLatitude && selectedRide?.pickupLongitude
      ? { lat: selectedRide.pickupLatitude, lng: selectedRide.pickupLongitude }
      : null;

  const dropPos: LatLng | null =
    selectedRide?.dropLatitude && selectedRide?.dropLongitude
      ? { lat: selectedRide.dropLatitude, lng: selectedRide.dropLongitude }
      : null;

  const routePoints: LatLng[] = Array.isArray(selectedTracking?.routePoints)
    ? selectedTracking.routePoints
    : [];

  const mapCenter: LatLng = driverPos ?? pickupPos ?? { lat: 12.9716, lng: 77.5946 };

  // ── Stats ─────────────────────────────────────────────────────────────────
  const onlineDrivers = (Object.values(driverPins) as DriverPin[]).filter(
    (p) => Date.now() - p.ts < 2 * 60_000,
  ).length;

  const avgEta =
    activeRides.length > 0
      ? Math.round(
          activeRides.reduce((s, r) => s + (r.etaMinutes ?? 0), 0) / activeRides.length,
        )
      : null;

  const filteredRides = activeRides.filter(
    (r) =>
      r.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.driverName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col gap-4 overflow-hidden">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Live Vehicle Tracking
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time driver location and customer trip mapping
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchActiveRides}
            disabled={loading}
            className="flex gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Badge
            variant={wsConnected ? 'success' : 'error'}
            className="flex items-center gap-2 py-2 px-3"
          >
            <Activity className={`w-3.5 h-3.5 ${wsConnected ? 'animate-pulse' : ''}`} />
            {wsConnected ? 'Live Active' : 'Disconnected'}
          </Badge>
        </div>
      </div>

      {/* ── Stats Bar ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 shrink-0">
        {[
          { label: 'Active Rides', value: activeRides.length, icon: <Car className="w-4 h-4" />, color: 'text-indigo-600' },
          { label: 'Drivers Online', value: onlineDrivers, icon: <Navigation2 className="w-4 h-4" />, color: 'text-emerald-600' },
          { label: 'Avg ETA', value: avgEta != null ? `${avgEta} min` : '—', icon: <Clock className="w-4 h-4" />, color: 'text-amber-600' },
        ].map((stat) => (
          <div key={stat.label}>
            <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center ${stat.color}`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white leading-none mt-0.5">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* ── Main Body ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">

        {/* Map Panel */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <LiveMap
            className="w-full h-full"
            center={mapCenter}
            zoom={13}
            driverPosition={driverPos}
            pickupPosition={pickupPos}
            dropPosition={dropPos}
            routePoints={routePoints}
            pickupLabel={selectedRide?.pickupLocation ?? 'Pickup'}
            dropLabel={selectedRide?.dropLocation ?? 'Drop'}
            onMapReady={(map) => { leafletMapRef.current = map; }}
          />

          {/* Search overlay */}
          <div className="absolute top-4 left-4 w-72 z-10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search driver / customer / ID…"
                className="w-full pl-10 pr-4 py-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-xl text-sm shadow-xl focus:ring-2 focus:ring-indigo-500 dark:text-white outline-none"
              />
            </div>
          </div>

          {/* Selected ride ETA chip */}
          {selectedTracking && (
            <div className="absolute bottom-4 left-4 right-4 z-10 pointer-events-none">
              <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-2xl p-3 shadow-2xl flex items-center gap-4 pointer-events-auto">
                <div className="flex items-center gap-2 text-indigo-600">
                  <Clock className="w-4 h-4" />
                  <span className="font-black text-sm">
                    {selectedTracking.etaText ?? (selectedTracking.etaMinutes ? `${selectedTracking.etaMinutes} min` : '—')}
                  </span>
                </div>
                <div className="w-px h-5 bg-slate-200 dark:bg-slate-700" />
                <div className="flex items-center gap-2 text-emerald-600">
                  <Ruler className="w-4 h-4" />
                  <span className="font-black text-sm">
                    {selectedTracking.distanceText ?? (selectedTracking.distanceKm ? `${Number(selectedTracking.distanceKm).toFixed(1)} km` : '—')}
                  </span>
                </div>
                <div className="w-px h-5 bg-slate-200 dark:bg-slate-700" />
                <div className="flex-1 truncate text-xs font-semibold text-slate-500">
                  Ride #{selectedRideId?.slice(-6).toUpperCase()}
                </div>
                <button
                  onClick={() => setSelectedRideId(null)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="lg:w-80 shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col min-h-0 shadow-sm">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between shrink-0 rounded-t-2xl">
            <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
              Active Rides ({filteredRides.length})
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <div className="p-8 text-center text-slate-400 text-xs">Loading rides…</div>
            ) : filteredRides.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <AlertTriangle className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-slate-400 text-xs font-bold">No active rides to track.</p>
              </div>
            ) : (
              filteredRides.map((ride) => {
                const isSelected = ride.id === selectedRideId;
                const pin = driverPins[ride.driverId ?? ''];
                const pinAlive = pin && Date.now() - pin.ts < 2 * 60_000;
                return (
                  <div
                    key={ride.id}
                    onClick={() => setSelectedRideId(ride.id)}
                    className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer flex flex-col gap-2 border-l-4 ${
                      isSelected
                        ? 'bg-indigo-50/60 dark:bg-indigo-950/20 border-l-indigo-600'
                        : 'border-l-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                        #{ride.id.slice(-6).toUpperCase()}
                      </span>
                      {statusBadge(ride.status)}
                    </div>

                    <div className="space-y-1 pl-0.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                        <Car className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="truncate">{ride.driverName || 'Matching…'}</span>
                        {pinAlive && (
                          <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" title="Live location" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                        <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                        <span className="truncate">{ride.customerName || 'WhatsApp User'}</span>
                      </div>
                    </div>

                    {isSelected && selectedTracking && (
                      <div className="mt-1 grid grid-cols-2 gap-2">
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-2 flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-indigo-500" />
                          <span className="text-[11px] font-black text-indigo-700 dark:text-indigo-300">
                            {selectedTracking.etaText ?? (selectedTracking.etaMinutes ? `${selectedTracking.etaMinutes}m` : '—')}
                          </span>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-2 flex items-center gap-1.5">
                          <Ruler className="w-3 h-3 text-emerald-500" />
                          <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-300">
                            {selectedTracking.distanceText ?? (selectedTracking.distanceKm ? `${Number(selectedTracking.distanceKm).toFixed(1)}km` : '—')}
                          </span>
                        </div>
                      </div>
                    )}

                    {isSelected && (
                      <div className="text-[10px] space-y-1 bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl mt-1">
                        <div className="flex items-start gap-1">
                          <MapPin className="w-3 h-3 text-indigo-500 mt-0.5 shrink-0" />
                          <span className="text-slate-600 dark:text-slate-300 line-clamp-1">{ride.pickupLocation}</span>
                        </div>
                        <div className="flex items-start gap-1">
                          <MapPin className="w-3 h-3 text-rose-500 mt-0.5 shrink-0" />
                          <span className="text-slate-600 dark:text-slate-300 line-clamp-1">{ride.dropLocation}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
