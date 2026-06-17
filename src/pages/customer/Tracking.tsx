/**
 * customer/Tracking.tsx
 * Full real-time ride tracking page.
 * - REST poll to bootstrap ride data
 * - WebSocket (STOMP) subscription to /topic/ride/{rideId}/location for live updates
 * - Leaflet map via LiveMap component
 * - ETA dashboard via EtaDashboard component
 * - SOS button triggers customer safety API
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Shield,
  Phone,
  MessageCircle,
  Share2,
  X,
} from 'lucide-react';
import { Client } from '@stomp/stompjs';
import { Button, Badge } from '../../components/ui';
import LiveMap, { LatLng } from '../../components/LiveMap';
import EtaDashboard from '../../components/EtaDashboard';
import { customerRideApi, customerSafetyApi, rideTrackingApi } from '../../lib/api';
import { toast } from 'react-hot-toast';

interface TrackingState {
  driverPosition: LatLng | null;
  etaMinutes: number | null;
  etaText: string | null;
  distanceKm: number | null;
  distanceText: string | null;
  routePoints: LatLng[];
  status: string;
  isLive: boolean;
}

export default function RideTracking() {
  const navigate = useNavigate();
  const [ride, setRide] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tracking, setTracking] = useState<TrackingState>({
    driverPosition: null,
    etaMinutes: null,
    etaText: null,
    distanceKm: null,
    distanceText: null,
    routePoints: [],
    status: 'SEARCHING',
    isLive: false,
  });

  const stompRef = useRef<Client | null>(null);
  const rideIdRef = useRef<string | null>(null);

  // ── Fetch active ride (bootstrap) ──────────────────────────────────────────
  const fetchRide = useCallback(async () => {
    try {
      const res = await customerRideApi.getActive();
      const data = res.data;
      setRide(data);

      if (data?.status === 'COMPLETED') {
        toast.success('Ride completed! Hope you had a great trip. 🎉');
        navigate('/customer');
        return;
      }

      // Update base tracking state from ride
      setTracking((prev) => ({
        ...prev,
        status: data?.status ?? 'SEARCHING',
      }));

      rideIdRef.current = data?.id ?? null;

      // Also fetch the RideTracking doc if ride ID is known
      if (data?.id) {
        fetchTrackingDoc(data.id);
      }
    } catch (err) {
      console.error('Failed to fetch active ride', err);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // ── Fetch RideTracking document from backend ───────────────────────────────
  const fetchTrackingDoc = async (rideId: string) => {
    try {
      const res = await rideTrackingApi.getTracking(rideId);
      const doc = res.data;
      if (!doc) return;

      setTracking((prev) => ({
        ...prev,
        driverPosition:
          doc.driverLatitude && doc.driverLongitude
            ? { lat: doc.driverLatitude, lng: doc.driverLongitude }
            : prev.driverPosition,
        etaMinutes: doc.etaMinutes ?? prev.etaMinutes,
        distanceKm: doc.distanceKm ?? prev.distanceKm,
        routePoints: Array.isArray(doc.routePoints) ? doc.routePoints : prev.routePoints,
        status: doc.status ?? prev.status,
      }));
    } catch {
      // Tracking doc may not exist yet if ride is still SEARCHING
    }
  };

  // ── Initial load + polling fallback every 8 s ──────────────────────────────
  useEffect(() => {
    fetchRide();
    const interval = setInterval(fetchRide, 8000);
    return () => clearInterval(interval);
  }, [fetchRide]);

  // ── WebSocket subscription once rideId is known ────────────────────────────
  useEffect(() => {
    if (!ride?.id) return;
    if (stompRef.current) return; // Already connected

    const wsProto = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const brokerUrl = `${wsProto}://${window.location.hostname}:8080/api/ws`;

    const client = new Client({
      brokerURL: brokerUrl,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log('[Tracking] STOMP connected');
      setTracking((prev) => ({ ...prev, isLive: true }));

      // Per-ride location topic
      client.subscribe(`/topic/ride/${ride.id}/location`, (msg) => {
        const payload = JSON.parse(msg.body);
        setTracking((prev) => ({
          ...prev,
          driverPosition: { lat: payload.latitude, lng: payload.longitude },
          etaMinutes: payload.etaMinutes ?? prev.etaMinutes,
          etaText: payload.etaText ?? prev.etaText,
          distanceKm: payload.distanceKm ?? prev.distanceKm,
          distanceText: payload.distanceText ?? prev.distanceText,
          status: payload.status ?? prev.status,
          isLive: true,
        }));
      });
    };

    client.onDisconnect = () => {
      setTracking((prev) => ({ ...prev, isLive: false }));
    };

    client.activate();
    stompRef.current = client;

    return () => {
      client.deactivate();
      stompRef.current = null;
    };
  }, [ride?.id]);

  // ── Cancel ride ────────────────────────────────────────────────────────────
  const handleCancel = async () => {
    if (!ride?.id) return;
    try {
      await customerRideApi.cancel(ride.id);
      toast.success('Ride cancelled');
      navigate('/customer');
    } catch {
      toast.error('Failed to cancel ride');
    }
  };

  // ── SOS ────────────────────────────────────────────────────────────────────
  const handleSos = async () => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await customerSafetyApi.triggerSos({
            rideId: ride?.id,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
          toast.error('🚨 SOS Alert sent to emergency contacts!', {
            duration: 6000,
            style: { background: '#ef4444', color: '#fff', fontWeight: 700 },
          });
        } catch {
          toast.error('Failed to send SOS. Call 112 directly.');
        }
      },
      () => toast.error('Location access required for SOS.'),
    );
  };

  // ── Map props ──────────────────────────────────────────────────────────────
  const pickupPosition: LatLng | null =
    ride?.pickupLatitude && ride?.pickupLongitude
      ? { lat: ride.pickupLatitude, lng: ride.pickupLongitude }
      : null;

  const dropPosition: LatLng | null =
    ride?.dropLatitude && ride?.dropLongitude
      ? { lat: ride.dropLatitude, lng: ride.dropLongitude }
      : null;

  const mapCenter: LatLng =
    tracking.driverPosition ??
    pickupPosition ?? { lat: 12.9716, lng: 77.5946 };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">
            Loading ride…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col relative overflow-hidden">
      {/* ── Map fills the background ──────────────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <LiveMap
          className="w-full h-full"
          center={mapCenter}
          zoom={14}
          driverPosition={tracking.driverPosition}
          pickupPosition={pickupPosition}
          dropPosition={dropPosition}
          routePoints={tracking.routePoints}
          pickupLabel={ride?.pickupLocation ?? 'Pickup'}
          dropLabel={ride?.dropLocation ?? 'Drop'}
        />
        {/* Dark gradient overlay so bottom panel is readable */}
        <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent pointer-events-none" />
      </div>

      {/* ── Top Controls ─────────────────────────────────────────────────── */}
      <div className="relative z-10 p-5 flex items-center justify-between pointer-events-none">
        <Button
          variant="white"
          size="icon"
          onClick={() => navigate('/customer')}
          className="rounded-2xl pointer-events-auto shadow-2xl backdrop-blur-md bg-white/90"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>

        {tracking.isLive && (
          <Badge className="pointer-events-auto bg-emerald-500 text-white border-none px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 bg-white rounded-full animate-ping" />
            Live Tracking
          </Badge>
        )}

        <Button
          variant="destructive"
          size="icon"
          onClick={handleSos}
          className="rounded-2xl pointer-events-auto shadow-2xl bg-red-600 hover:bg-red-700"
          title="SOS Emergency"
        >
          <Shield className="w-5 h-5" />
        </Button>
      </div>

      {/* ── Bottom Info Panel ─────────────────────────────────────────────── */}
      <div className="mt-auto relative z-10 p-5 space-y-4">
        {/* ETA Dashboard */}
        <EtaDashboard
          status={tracking.status}
          etaMinutes={tracking.etaMinutes}
          etaText={tracking.etaText}
          distanceKm={tracking.distanceKm}
          distanceText={tracking.distanceText}
          driverName={ride?.driver?.name}
          vehicleModel={ride?.driver ? `${ride.driver.vehicleColor ?? ''} ${ride.driver.vehicleModel ?? ''}`.trim() : undefined}
          vehicleNumber={ride?.driver?.vehicleNumber}
          rating={ride?.driver?.rating}
          fare={ride?.fare}
          isLive={tracking.isLive}
        />

        {/* Action Buttons */}
        <motion.div
          className="grid grid-cols-3 gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Button
            className="py-5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-lg flex flex-col items-center gap-1"
            disabled={!ride?.driver?.phone}
          >
            <Phone className="w-5 h-5" />
            <span className="text-[9px] font-black uppercase tracking-widest">Call</span>
          </Button>

          <Button className="py-5 rounded-2xl bg-slate-800/80 border border-slate-700 text-white hover:bg-slate-700 flex flex-col items-center gap-1 backdrop-blur-md">
            <MessageCircle className="w-5 h-5" />
            <span className="text-[9px] font-black uppercase tracking-widest">Message</span>
          </Button>

          <Button
            onClick={handleCancel}
            className="py-5 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 flex flex-col items-center gap-1"
          >
            <X className="w-5 h-5" />
            <span className="text-[9px] font-black uppercase tracking-widest">Cancel</span>
          </Button>
        </motion.div>

        {/* Route Summary */}
        {(ride?.pickupLocation || ride?.dropLocation) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 space-y-2"
          >
            <div className="flex items-start gap-3">
              <div className="mt-1 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-2 ring-indigo-400/30 shrink-0" />
              <p className="text-xs font-semibold text-slate-300 line-clamp-1">
                {ride.pickupLocation}
              </p>
            </div>
            <div className="ml-[5px] w-px h-5 bg-slate-600" />
            <div className="flex items-start gap-3">
              <div className="mt-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-400/30 shrink-0" />
              <p className="text-xs font-semibold text-slate-300 line-clamp-1">
                {ride.dropLocation}
              </p>
            </div>
          </motion.div>
        )}

        {/* Share Trip */}
        <Button className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest backdrop-blur-md">
          <Share2 className="w-4 h-4" />
          Share Live Trip
        </Button>
      </div>
    </div>
  );
}
