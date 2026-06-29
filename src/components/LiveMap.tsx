/**
 * LiveMap.tsx
 * Reusable Leaflet map that renders:
 *  - Driver marker (animated, green)
 *  - Pickup marker (indigo pin)
 *  - Drop marker (rose pin)
 *  - Route polyline (decoded from Google Maps routePoints)
 */

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

// ─── Icon helpers ─────────────────────────────────────────────────────────────
const makeIcon = (color: string, svg: string) =>
  L.divIcon({
    className: 'vazraa-map-icon',
    html: `<div style="
        background:${color};
        border-radius:50%;
        width:36px;height:36px;
        display:flex;align-items:center;justify-content:center;
        border:3px solid #fff;
        box-shadow:0 4px 14px rgba(0,0,0,0.25);
      ">${svg}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });

const DRIVER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
  viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"
  stroke-linecap="round" stroke-linejoin="round">
  <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10
    s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7
    0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
  <circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>
</svg>`;

const PIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
  viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"
  stroke-linecap="round" stroke-linejoin="round">
  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
  <circle cx="12" cy="10" r="3"/>
</svg>`;

const CIRCLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"
  viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"
  stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="2"/>
</svg>`;

// ─── Types ────────────────────────────────────────────────────────────────────
export interface LatLng { lat: number; lng: number; }

export interface LiveMapProps {
  center?: LatLng;
  zoom?: number;
  driverPosition?: LatLng | null;
  pickupPosition?: LatLng | null;
  dropPosition?: LatLng | null;
  /** Array of {lat,lng} decoded from Google Maps polyline */
  routePoints?: LatLng[];
  pickupLabel?: string;
  dropLabel?: string;
  /** Extra class applied to wrapper */
  className?: string;
  /** Called when map is ready */
  onMapReady?: (map: L.Map) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function LiveMap({
  center = { lat: 12.9716, lng: 77.5946 },
  zoom = 13,
  driverPosition,
  pickupPosition,
  dropPosition,
  routePoints = [],
  pickupLabel = 'Pickup',
  dropLabel = 'Drop',
  className = 'w-full h-full',
  onMapReady,
}: LiveMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);
  const pickupMarkerRef = useRef<L.Marker | null>(null);
  const dropMarkerRef = useRef<L.Marker | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const pulseTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Bootstrap map once ────────────────────────────────────────────────────
  useEffect(() => {
    // Inject Leaflet CSS once
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    if (containerRef.current && !mapRef.current) {
      const map = L.map(containerRef.current, { zoomControl: true }).setView(
        [center.lat, center.lng],
        zoom,
      );

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;
      onMapReady?.(map);
    }

    return () => {
      if (pulseTimerRef.current) clearInterval(pulseTimerRef.current);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Driver marker ─────────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!driverPosition) {
      driverMarkerRef.current?.remove();
      driverMarkerRef.current = null;
      return;
    }
    const latlng: L.LatLngExpression = [driverPosition.lat, driverPosition.lng];
    if (driverMarkerRef.current) {
      driverMarkerRef.current.setLatLng(latlng);
    } else {
      driverMarkerRef.current = L.marker(latlng, {
        icon: makeIcon('#22c55e', DRIVER_SVG),
        zIndexOffset: 1000,
      }).addTo(map);
    }
  }, [driverPosition]);

  // ── Pickup marker ─────────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!pickupPosition) {
      pickupMarkerRef.current?.remove();
      pickupMarkerRef.current = null;
      return;
    }
    const latlng: L.LatLngExpression = [pickupPosition.lat, pickupPosition.lng];
    if (pickupMarkerRef.current) {
      pickupMarkerRef.current.setLatLng(latlng);
    } else {
      pickupMarkerRef.current = L.marker(latlng, {
        icon: makeIcon('#6366f1', PIN_SVG),
      })
        .bindPopup(`<b>📍 ${pickupLabel}</b>`)
        .addTo(map);
    }
  }, [pickupPosition, pickupLabel]);

  // ── Drop marker ───────────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!dropPosition) {
      dropMarkerRef.current?.remove();
      dropMarkerRef.current = null;
      return;
    }
    const latlng: L.LatLngExpression = [dropPosition.lat, dropPosition.lng];
    if (dropMarkerRef.current) {
      dropMarkerRef.current.setLatLng(latlng);
    } else {
      dropMarkerRef.current = L.marker(latlng, {
        icon: makeIcon('#f43f5e', CIRCLE_SVG),
      })
        .bindPopup(`<b>🏁 ${dropLabel}</b>`)
        .addTo(map);
    }
  }, [dropPosition, dropLabel]);

  // ── Route polyline ────────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    routeLayerRef.current?.remove();
    routeLayerRef.current = null;

    if (routePoints.length < 2) return;

    const latlngs: L.LatLngExpression[] = routePoints.map((p) => [p.lat, p.lng]);
    routeLayerRef.current = L.polyline(latlngs, {
      color: '#6366f1',
      weight: 5,
      opacity: 0.85,
      lineJoin: 'round',
    }).addTo(map);

    // Fit bounds to the whole route
    map.fitBounds(routeLayerRef.current.getBounds(), { padding: [48, 48] });
  }, [routePoints]);

  // ── Auto-pan to driver when position changes ──────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !driverPosition) return;
    mapRef.current.panTo([driverPosition.lat, driverPosition.lng], { animate: true });
  }, [driverPosition]);

  return <div ref={containerRef} className={className} />;
}
