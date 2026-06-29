import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  Clock, 
  ArrowRight, 
  Car, 
  Info, 
  Star, 
  Calendar,
  MapPin,
  Crosshair,
  Map,
  X,
  Users
} from 'lucide-react';
import { Button, Badge, Card } from '../../components/ui';
import { customerRideApi, fareApi, TokenStore } from '../../lib/api';
import { toast } from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';

// ── Car-only categories with passenger capacity ──────────────────────────────
const CAR_CATEGORIES: Record<string, { capacity: number; label: string; desc: string }> = {
  MINI:     { capacity: 4, label: 'Mini',    desc: 'Compact & affordable' },
  SEDAN:    { capacity: 4, label: 'Sedan',   desc: 'Comfort for everyday rides' },
  SUV:      { capacity: 6, label: 'SUV',     desc: 'Spacious family ride' },
  AUTO:     { capacity: 3, label: 'Auto',    desc: 'Affordable three-wheeler' }
};

// Mock fallback fares when backend is offline
const MOCK_FARES = [
  { category: 'MINI',      fare: 120, eta: '4 min' },
  { category: 'HATCHBACK', fare: 150, eta: '5 min' },
  { category: 'SEDAN',     fare: 190, eta: '6 min' },
  { category: 'SUV',       fare: 280, eta: '7 min' },
  { category: 'LUXURY',    fare: 450, eta: '9 min' },
];

const MOCK_MAP_PLACES = [
  { name: 'Gateway of India, Colaba', x: 200, y: 150, lat: 18.9220, lng: 72.8347 },
  { name: 'Marine Drive Promenade', x: 100, y: 120, lat: 18.9438, lng: 72.8236 },
  { name: 'Chhatrapati Shivaji Terminal', x: 250, y: 220, lat: 18.9696, lng: 72.8354 },
  { name: 'Bandra-Worli Sea Link', x: 80, y: 350, lat: 19.0330, lng: 72.8190 },
  { name: 'Sanjay Gandhi National Park', x: 320, y: 450, lat: 19.2215, lng: 72.9124 },
  { name: 'Juhu Beach Road', x: 90, y: 280, lat: 19.1023, lng: 72.8265 },
  { name: 'Phoenix Marketcity Mall', x: 280, y: 320, lat: 19.0864, lng: 72.8893 },
  { name: 'Mumbai Domestic Airport T1', x: 180, y: 290, lat: 19.0974, lng: 72.8742 },
];

export default function BookRide() {
  const [step, setStep] = useState(1); // 1: Locations, 2: Vehicle Select
  const [pickup, setPickup] = useState('Gateway of India, Colaba');
  const [destination, setDestination] = useState('');
  const [selectedRide, setSelectedRide] = useState<string>('');
  const [estimates, setEstimates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Coordinates State
  const [pickupCoords, setPickupCoords] = useState({ lat: 18.9220, lng: 72.8347 });
  const [dropCoords, setDropCoords] = useState({ lat: 19.0864, lng: 72.8893 });

  // Map Selector Modal State
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [mapTarget, setMapTarget] = useState<'PICKUP' | 'DROP'>('PICKUP');
  const [tempLocation, setTempLocation] = useState('');
  const [tempCoordinates, setTempCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [mapPinPos, setMapPinPos] = useState<{ x: number; y: number } | null>(null);

  const navigate = useNavigate();

  // Leaflet Map Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);

  // Initialize and clean up Leaflet Map
  useEffect(() => {
    if (!isMapOpen || !mapContainerRef.current) return;

    let active = true;

    // Load Leaflet dynamically
    import('leaflet').then((L) => {
      if (!active || !mapContainerRef.current) return;

      // Set default icon assets
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const initialCoords = mapTarget === 'PICKUP' ? pickupCoords : dropCoords;

      // Initialize map
      const map = L.map(mapContainerRef.current).setView([initialCoords.lat, initialCoords.lng], 13);
      mapInstanceRef.current = map;

      // Tile layer (standard OpenStreetMap)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      // Draggable marker
      const marker = L.marker([initialCoords.lat, initialCoords.lng], { draggable: true }).addTo(map);
      markerInstanceRef.current = marker;

      // Reverse geocoding helper (with dynamic Nominatim lookup)
      const updateLocationInfo = async (lat: number, lng: number) => {
        setTempCoordinates({ lat, lng });
        
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18`,
            { headers: { 'Accept-Language': 'en' } }
          );
          if (response.ok) {
            const data = await response.json();
            const details = data.address;
            const shortName = details.road || details.suburb || details.neighbourhood || details.city || data.display_name.split(',')[0];
            const fullName = data.display_name;
            setTempLocation(`${shortName} (${fullName.split(',').slice(0, 3).join(',')})`);
          } else {
            setTempLocation(`Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          }
        } catch (err) {
          setTempLocation(`Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        }
      };

      // Set initial location detail
      updateLocationInfo(initialCoords.lat, initialCoords.lng);

      // Bind drag and click events
      marker.on('dragend', () => {
        const position = marker.getLatLng();
        updateLocationInfo(position.lat, position.lng);
      });

      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        updateLocationInfo(lat, lng);
      });
    });

    return () => {
      active = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerInstanceRef.current = null;
      }
    };
  }, [isMapOpen, mapTarget]);

  // HTML5 Current Location Handler
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    toast.loading('Fetching current location...', { id: 'geo' });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setPickupCoords({ lat: latitude, lng: longitude });
        setPickup(`Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
        toast.success('Current location updated!', { id: 'geo' });
        setLoading(false);
      },
      (error) => {
        console.error(error);
        // Fallback to standard mock location and inform user
        const fbLat = 18.9220;
        const fbLng = 72.8347;
        setPickupCoords({ lat: fbLat, lng: fbLng });
        setPickup('Gateway of India, Colaba (GPS Fallback)');
        toast.success('Using fallback GPS location', { id: 'geo' });
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  // Open Map Selector Modal
  const handleOpenMapSelector = (target: 'PICKUP' | 'DROP') => {
    setMapTarget(target);
    setTempLocation('');
    setTempCoordinates(null);
    setMapPinPos(null);
    setIsMapOpen(true);
  };

  // Click on SVG Map to drop a pin
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMapPinPos({ x, y });

    // Generate simulated latitude and longitude based on click coordinates
    const scaleLat = 18.9 + (y / rect.height) * 0.3;
    const scaleLng = 72.8 + (x / rect.width) * 0.15;
    
    // Find closest place or make a mock name
    let foundPlace = MOCK_MAP_PLACES.find(p => Math.abs(p.x - x) < 35 && Math.abs(p.y - y) < 35);
    const mockName = foundPlace ? foundPlace.name : `Point near Street ${Math.floor(x/10)} (${scaleLat.toFixed(4)}, ${scaleLng.toFixed(4)})`;

    setTempLocation(mockName);
    setTempCoordinates({ lat: scaleLat, lng: scaleLng });
  };

  // Confirm Selection
  const handleConfirmMapSelection = () => {
    if (!tempLocation || !tempCoordinates) return;
    if (mapTarget === 'PICKUP') {
      setPickup(tempLocation);
      setPickupCoords(tempCoordinates);
    } else {
      setDestination(tempLocation);
      setDropCoords(tempCoordinates);
    }
    setIsMapOpen(false);
    toast.success('Location set from map!');
  };

  const fetchEstimates = async () => {
    if (!destination) return;
    setLoading(true);
    try {
      const categories = ['MINI', 'SEDAN', 'SUV', 'AUTO'];
      const estimatesData = await Promise.all(
        categories.map(async (category) => {
          try {
            const res = await fareApi.estimate({
              pickupLat: pickupCoords.lat,
              pickupLng: pickupCoords.lng,
              dropLat: dropCoords.lat,
              dropLng: dropCoords.lng,
              city: 'Bengaluru',
              vehicleType: category
            });
            return {
              category,
              fare: res.data.estimatedFare,
              eta: `${res.data.durationMinutes} min`,
              distance: res.data.distanceKm,
              traffic: res.data.traffic,
              breakdown: res.data.breakdown
            };
          } catch (e) {
            console.error(`Failed to fetch estimate for ${category}`, e);
            return null;
          }
        })
      );

      const validEstimates = estimatesData.filter(Boolean);
      if (validEstimates.length > 0) {
        setEstimates(validEstimates);
        setSelectedRide(validEstimates[0].category);
        setStep(2);
      } else {
        throw new Error("No estimates returned from server");
      }
    } catch (err) {
      toast.success('Showing fallback rides');
      setEstimates(MOCK_FARES.map(f => ({
        category: f.category,
        fare: f.fare,
        eta: f.eta,
        distance: 12.5,
        traffic: 'MEDIUM',
        breakdown: { base: 50, distance: 100, time: 20, traffic: 1.05, demand: 1.0 }
      })));
      setSelectedRide(MOCK_FARES[0].category);
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (step === 2) {
      fetchEstimates();
    }
  }, [pickupCoords, dropCoords]);

  const handleBook = async () => {
    setLoading(true);
    try {
      const payload = {
        pickupLocation: pickup,
        pickupLatitude: pickupCoords.lat,
        pickupLongitude: pickupCoords.lng,
        dropLocation: destination,
        dropLatitude: dropCoords.lat,
        dropLongitude: dropCoords.lng,
        vehicleCategory: selectedRide,
        paymentMethod: 'WALLET'
      };
      await customerRideApi.book(payload);
      toast.success('Searching for nearby drivers...');
      navigate('/customer/tracking');
    } catch (err) {
      toast.error('Failed to book ride');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col pt-4 overflow-hidden">
      
      {/* Header */}
      <div className="px-6 flex items-center justify-between mb-6">
         <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => step > 1 ? setStep(1) : navigate('/customer')}
            className="rounded-2xl"
          >
            <ChevronLeft className="w-6 h-6" />
         </Button>
         <h1 className="text-xl font-black uppercase tracking-tighter italic">Book a Ride</h1>
         <div className="w-10 h-10" />
      </div>

      <div className="flex-1 overflow-y-auto px-6 space-y-8 pb-32">
        
        {/* Step 1: Location Inputs */}
        <div className="space-y-4">
           {/* Pickup */}
           <div className="relative flex items-center">
              <div className="absolute left-6 w-2 h-2 rounded-full bg-emerald-500 z-10 shadow-lg shadow-emerald-200" />
              <input 
                type="text" 
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                placeholder="Pick up point"
                className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] py-5 pl-14 pr-24 font-bold text-slate-900 dark:text-white transition-all focus:border-indigo-500 outline-none shadow-sm"
              />
              <div className="absolute right-4 flex items-center gap-2 z-20">
                 <button 
                   type="button"
                   onClick={handleGetCurrentLocation}
                   className="p-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/35 hover:text-indigo-600 rounded-xl transition-all"
                   title="Use Current Location"
                 >
                    <Crosshair className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                 </button>
                 <button 
                   type="button"
                   onClick={() => handleOpenMapSelector('PICKUP')}
                   className="p-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/35 hover:text-indigo-600 rounded-xl transition-all"
                   title="Select on Map"
                 >
                    <Map className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                 </button>
              </div>
           </div>

           <div className="px-6">
              <div className="w-0.5 h-6 bg-slate-200 dark:bg-slate-800 ml-1" />
           </div>

           {/* Drop */}
           <div className="relative flex items-center">
              <div className="absolute left-6 w-2 h-2 rounded-full bg-indigo-600 z-10 shadow-lg shadow-indigo-200" />
              <input 
                type="text" 
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Where to?"
                className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] py-5 pl-14 pr-16 font-bold text-slate-900 dark:text-white transition-all focus:border-indigo-500 outline-none shadow-sm"
                autoFocus
              />
              <div className="absolute right-4 z-20">
                 <button 
                   type="button"
                   onClick={() => handleOpenMapSelector('DROP')}
                   className="p-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/35 hover:text-indigo-600 rounded-xl transition-all"
                   title="Select on Map"
                 >
                    <Map className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                 </button>
              </div>
           </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
               key="step1"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               className="space-y-6"
            >
               <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-2">Suggestions</h2>
               <div className="space-y-3">
                  {[
                    { name: 'Gateway of India', type: 'Tourist Spot', dist: '4.5km' },
                    { name: 'Star Mall', type: 'Shopping', dist: '2.1km' },
                    { name: 'Central Station', type: 'Railway', dist: '6.8km' }
                  ].map((loc) => (
                    <div 
                      key={loc.name}
                      onClick={() => { setDestination(loc.name); }}
                      className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center gap-4 cursor-pointer hover:border-indigo-500 transition-all active:scale-95 shadow-sm"
                    >
                       <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
                          <Clock className="w-5 h-5" />
                       </div>
                       <div className="flex-1">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-tight">{loc.name}</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{loc.type} • {loc.dist}</p>
                       </div>
                       <ArrowRight className="w-4 h-4 text-slate-300" />
                    </div>
                  ))}
               </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
               key="step2"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               className="space-y-6"
            >
               <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-2">Choose Ride</h2>
               <div className="space-y-3">
                  {estimates.map((ride) => {
                    const meta = CAR_CATEGORIES[ride.category];
                    if (!meta) return null; // skip non-car categories
                    const isSelected = selectedRide === ride.category;
                    return (
                      <div 
                        key={ride.category}
                        onClick={() => setSelectedRide(ride.category)}
                        className={cn(
                          "p-5 rounded-[2.5rem] border-2 transition-all cursor-pointer flex flex-col items-stretch",
                          isSelected
                            ? "bg-indigo-50 dark:bg-indigo-900/10 border-indigo-500 shadow-xl shadow-indigo-100 dark:shadow-none" 
                            : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-indigo-300"
                        )}
                      >
                         <div className="flex items-center gap-4">
                            {/* Car Icon */}
                            <div className={cn(
                              "w-16 h-16 rounded-3xl flex items-center justify-center transition-colors shrink-0",
                              isSelected ? "bg-indigo-600 text-white" : "bg-slate-50 dark:bg-slate-800 text-slate-400"
                            )}>
                               <Car className="w-8 h-8" />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                               <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">
                                    {meta.label}
                                  </h4>
                                  <Badge className="bg-emerald-100 text-emerald-600 border-none font-bold text-[8px] tracking-widest">
                                    {ride.eta}
                                  </Badge>
                               </div>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                 {meta.desc}
                               </p>
                               {/* Passenger capacity badge */}
                               <div className="flex items-center gap-1 mt-1.5">
                                 <Users className={cn("w-3.5 h-3.5", isSelected ? "text-indigo-500" : "text-slate-400")} />
                                 <span className={cn(
                                   "text-[10px] font-black uppercase tracking-widest",
                                   isSelected ? "text-indigo-600" : "text-slate-400"
                                 )}>
                                   {meta.capacity} People
                                 </span>
                               </div>
                            </div>

                            {/* Price */}
                            <div className="text-right shrink-0">
                               <p className="font-black text-slate-900 dark:text-white text-lg tracking-tight">₹{ride.fare.toFixed(0)}</p>
                               <p className={cn(
                                 "text-[9px] font-bold uppercase tracking-widest mt-0.5",
                                 isSelected ? "text-indigo-400" : "text-slate-300"
                               )}>per ride</p>
                            </div>
                         </div>

                         {/* Fare Breakdown Details */}
                         {isSelected && ride.breakdown && (
                           <motion.div 
                             initial={{ opacity: 0, height: 0 }}
                             animate={{ opacity: 1, height: 'auto' }}
                             className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-left space-y-2 text-xs font-semibold text-slate-500 dark:text-slate-400"
                           >
                              <div className="flex justify-between">
                                 <span className="uppercase text-[9px] tracking-wider text-slate-400">Base Fare</span>
                                 <span className="font-bold text-slate-700 dark:text-slate-200">₹{ride.breakdown.base}</span>
                              </div>
                              <div className="flex justify-between">
                                 <span className="uppercase text-[9px] tracking-wider text-slate-400">Distance Charge ({ride.distance ? ride.distance.toFixed(1) : '12.5'} km)</span>
                                 <span className="font-bold text-slate-700 dark:text-slate-200">₹{ride.breakdown.distance.toFixed(1)}</span>
                              </div>
                              <div className="flex justify-between">
                                 <span className="uppercase text-[9px] tracking-wider text-slate-400">Time Charge ({ride.eta})</span>
                                 <span className="font-bold text-slate-700 dark:text-slate-200">₹{ride.breakdown.time.toFixed(1)}</span>
                              </div>
                              <div className="flex justify-between">
                                 <span className="uppercase text-[9px] tracking-wider text-slate-400">Traffic Factor ({ride.traffic || 'LOW'})</span>
                                 <span className="font-bold text-indigo-600 dark:text-indigo-400">x{ride.breakdown.traffic.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400">
                                 <span className="uppercase text-[9px] tracking-wider">Demand / Special Multipliers</span>
                                 <span>x{((ride.breakdown.demand || 1) * (ride.breakdown.peak || 1) * (ride.breakdown.weekend || 1) * (ride.breakdown.festival || 1)).toFixed(2)}</span>
                              </div>
                           </motion.div>
                         )}
                      </div>
                    );
                  })}
               </div>

               <Card className="p-6 bg-slate-900 text-white rounded-[2.5rem] flex items-center justify-between border-none">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                        <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                     </div>
                     <div>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Payment Method</p>
                        <h4 className="font-bold text-sm tracking-tight capitalize italic">Wallet Balance</h4>
                     </div>
                  </div>
                  <Badge className="bg-indigo-500 text-white border-none font-bold italic">ACTIVE</Badge>
               </Card>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Floating Action Button Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 z-30">
         <div className="max-w-lg mx-auto w-full space-y-4">
            <div className="flex items-center justify-between px-2">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 dark:border-slate-800">
                     <Calendar className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Pick Timing</span>
               </div>
               <span className="text-xs font-black uppercase tracking-widest text-indigo-600">Change Pay Method</span>
            </div>
            
            <Button 
               disabled={(!destination && step === 1) || loading}
               onClick={() => step === 1 ? fetchEstimates() : handleBook()}
               className="w-full py-8 rounded-[2rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xl shadow-2xl shadow-indigo-200 dark:shadow-none border-none transition-all active:scale-95 group"
            >
               {loading ? (
                  <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
               ) : (
                  <>
                     {step === 1 ? 'FIND RIDES' : 'CONFIRM ' + selectedRide}
                     <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
               )}
            </Button>
         </div>
      </div>

      {/* Map Selector Modal */}
      <AnimatePresence>
        {isMapOpen && (
          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex flex-col justify-end md:justify-center md:items-center p-4"
          >
             <style>{`
               .leaflet-container {
                 width: 100% !important;
                 height: 100% !important;
                 border-radius: 0 !important;
                 z-index: 10 !important;
               }
               .leaflet-control-zoom {
                 border: none !important;
                 box-shadow: 0 10px 30px rgba(0,0,0,0.08) !important;
                 border-radius: 16px !important;
                 overflow: hidden;
               }
               .leaflet-bar a {
                 background-color: white !important;
                 color: #1e293b !important;
                 border-bottom: 1px solid #f1f5f9 !important;
                 transition: all 0.2s;
               }
               .leaflet-bar a:hover {
                 background-color: #f8fafc !important;
                 color: #4f46e5 !important;
               }
             `}</style>
             <motion.div 
                initial={{ y: 100, scale: 0.95 }}
                animate={{ y: 0, scale: 1 }}
                exit={{ y: 100, scale: 0.95 }}
                className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col h-[80vh] md:h-[600px] border border-slate-100 dark:border-slate-800"
             >
                {/* Modal Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                   <div>
                      <h3 className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-tight italic">
                         {mapTarget === 'PICKUP' ? 'Select Pickup Point' : 'Select Drop Point'}
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Drag & tap anywhere on the map to place pin</p>
                   </div>
                   <button 
                      onClick={() => setIsMapOpen(false)}
                      className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 flex items-center justify-center transition-all text-slate-400"
                   >
                      <X className="w-5 h-5" />
                   </button>
                </div>

                {/* Interactive Real Leaflet Map */}
                <div 
                   ref={mapContainerRef} 
                   className="flex-1 w-full bg-slate-100 dark:bg-slate-950 relative z-10" 
                   style={{ height: '100%', minHeight: '300px' }}
                />

                {/* Modal Bottom Control Panel */}
                <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 space-y-4">
                   <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center gap-4 border border-slate-100 dark:border-slate-800">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                         <MapPin className="w-6 h-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selected Location Address</p>
                         <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate mt-0.5">
                            {tempLocation || 'Tap anywhere on map to select...'}
                         </h4>
                         <p className="text-[9px] text-indigo-500 font-mono mt-0.5">
                            {tempCoordinates ? `Coordinates: ${tempCoordinates.lat.toFixed(4)}, ${tempCoordinates.lng.toFixed(4)}` : 'Latitude, Longitude'}
                         </p>
                      </div>
                   </div>

                   <Button 
                      disabled={!tempLocation}
                      onClick={handleConfirmMapSelection}
                      className="w-full py-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-xl shadow-indigo-100 dark:shadow-none border-none uppercase tracking-widest"
                   >
                      Confirm This Spot
                   </Button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
