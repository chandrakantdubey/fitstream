import { useState, useEffect, useRef } from "react";
import { MapPin, Navigation, Play, Square, Flame, Clock, Gauge, Activity, Award, ArrowLeft } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const API_BASE = "http://localhost:8000";

export default function MapTracker() {
  const [tracking, setTracking] = useState(false);
  const [activityType, setActivityType] = useState("Running");
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [distanceKm, setDistanceKm] = useState(0.0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [pastRoutes, setPastRoutes] = useState([]);
  const [summaryData, setSummaryData] = useState(null);

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const polylineRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current) {
      const map = L.map(mapRef.current).setView([28.6139, 77.2090], 15);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
      }).addTo(map);

      mapInstanceRef.current = map;
      polylineRef.current = L.polyline([], { color: "#10b981", weight: 5 }).addTo(map);
    }
  }, []);

  const fetchPastRoutes = async () => {
    try {
      const res = await fetch(`${API_BASE}/maps/routes?user_id=1`);
      const data = await res.json();
      setPastRoutes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading routes:", err);
    }
  };

  useEffect(() => {
    fetchPastRoutes();
  }, []);

  useEffect(() => {
    let int;
    if (tracking) {
      int = setInterval(() => {
        setElapsedSec(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(int);
  }, [tracking]);

  useEffect(() => {
    let watchId;
    if (tracking && navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const newPoint = [lat, lng];

          setRouteCoordinates((prev) => {
            if (prev.length > 0) {
              const last = prev[prev.length - 1];
              const addedDist = calculateDistance(last[0], last[1], lat, lng);
              setDistanceKm((d) => parseFloat((d + addedDist).toFixed(2)));
            }
            const updated = [...prev, newPoint];
            if (polylineRef.current) polylineRef.current.setLatLngs(updated);
            if (mapInstanceRef.current) mapInstanceRef.current.panTo(newPoint);
            return updated;
          });
        },
        (err) => console.error("Geolocation error:", err),
        { enableHighAccuracy: true, distanceFilter: 5 }
      );
    }
    return () => {
      if (watchId && navigator.geolocation) navigator.geolocation.clearWatch(watchId);
    };
  }, [tracking]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleStartTracking = () => {
    setRouteCoordinates([]);
    setDistanceKm(0.0);
    setElapsedSec(0);
    setTracking(true);
    setSummaryData(null);
  };

  const handleStopTracking = async () => {
    setTracking(false);
    const avgSpeed = elapsedSec > 0 ? parseFloat(((distanceKm / (elapsedSec / 3600))).toFixed(1)) : 0;
    const cals = Math.round(distanceKm * 65);
    const minsPerKm = distanceKm > 0 ? parseFloat(((elapsedSec / 60) / distanceKm).toFixed(2)) : 0;

    const summary = {
      activity: activityType,
      distanceKm,
      elapsedSec,
      avgSpeed,
      minsPerKm,
      cals
    };

    setSummaryData(summary);

    try {
      await fetch(`${API_BASE}/maps/routes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: "1",
          activity_type: activityType,
          distance_km: distanceKm,
          duration_seconds: elapsedSec,
          avg_speed_kmh: avgSpeed,
          calories_burned: cals,
          coordinates: routeCoordinates
        })
      });
      fetchPastRoutes();
    } catch (err) {
      console.error("Error saving route:", err);
    }
  };

  const formatTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="space-y-6 pb-24 max-w-2xl mx-auto px-1">
      <div>
        <h1 className="page-title flex items-center gap-2">
          <MapPin className="text-blue-400" size={26} /> Outdoor GPS Maps
        </h1>
        <p className="page-subtitle">
          Track real-time distance, speed, pace & route polylines for outdoor runs & walks.
        </p>
      </div>

      {/* Activity Type Selector */}
      <div className="flex gap-2">
        {["Running", "Outdoor Cycling", "Walking"].map((act) => (
          <button
            key={act}
            onClick={() => setActivityType(act)}
            className={`flex-1 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
              activityType === act
                ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-900/30"
                : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700"
            }`}
          >
            {act}
          </button>
        ))}
      </div>

      {/* Live Telemetry Display */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800">
          <div className="text-[10px] text-zinc-400 uppercase">Distance</div>
          <div className="text-xl font-black text-white mt-1">{distanceKm}</div>
          <div className="text-[10px] text-zinc-500">km</div>
        </div>

        <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800">
          <div className="text-[10px] text-zinc-400 uppercase">Time</div>
          <div className="text-xl font-black text-white mt-1">{formatTime(elapsedSec)}</div>
          <div className="text-[10px] text-zinc-500">elapsed</div>
        </div>

        <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800">
          <div className="text-[10px] text-zinc-400 uppercase">Speed</div>
          <div className="text-xl font-black text-emerald-400 mt-1">
            {elapsedSec > 0 ? ((distanceKm / (elapsedSec / 3600)) || 0).toFixed(1) : 0}
          </div>
          <div className="text-[10px] text-zinc-500">km/h</div>
        </div>

        <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800">
          <div className="text-[10px] text-zinc-400 uppercase">Est. Burn</div>
          <div className="text-xl font-black text-amber-400 mt-1">{Math.round(distanceKm * 65)}</div>
          <div className="text-[10px] text-zinc-500">kcal</div>
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <div className="surface p-2 border border-zinc-800 overflow-hidden relative">
        <div ref={mapRef} className="w-full h-72 rounded-2xl z-10"></div>
        <div className="absolute bottom-4 right-4 z-20">
          {!tracking ? (
            <button
              onClick={handleStartTracking}
              className="btn-brand px-6 py-3 text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-emerald-900/40"
            >
              <Play size={16} className="fill-current" /> Start GPS Tracking
            </button>
          ) : (
            <button
              onClick={handleStopTracking}
              className="btn-danger px-6 py-3 text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-red-900/40"
            >
              <Square size={16} className="fill-current" /> Finish & Save Session
            </button>
          )}
        </div>
      </div>

      {/* Post-Run Performance Summary Modal */}
      {summaryData && (
        <div className="surface p-6 border border-emerald-500/50 bg-gradient-to-r from-zinc-900 via-zinc-900 to-emerald-950/40 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="text-emerald-400" size={20} />
              <h3 className="text-base font-bold text-white">Activity Session Saved!</h3>
            </div>
            <button onClick={() => setSummaryData(null)} className="text-xs text-zinc-500 hover:text-white">
              Close
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800">
              <div className="text-lg font-black text-white">{summaryData.distanceKm} km</div>
              <div className="text-[10px] text-zinc-400 uppercase">Distance</div>
            </div>
            <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800">
              <div className="text-lg font-black text-emerald-400">{summaryData.avgSpeed} km/h</div>
              <div className="text-[10px] text-zinc-400 uppercase">Avg Speed</div>
            </div>
            <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800">
              <div className="text-lg font-black text-amber-400">{summaryData.cals} kcal</div>
              <div className="text-[10px] text-zinc-400 uppercase">Burned</div>
            </div>
          </div>
        </div>
      )}

      {/* Past Activity History */}
      {pastRoutes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-base font-bold text-white">Previous GPS Activities</h3>
          <div className="space-y-2">
            {pastRoutes.map((rt) => (
              <div key={rt.id} className="surface p-4 flex items-center justify-between border border-zinc-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="badge text-[10px] text-blue-400 border-blue-500/30 bg-blue-500/10">
                      {rt.activity_type}
                    </span>
                    <span className="text-xs text-zinc-400">{rt.created_at ? rt.created_at.slice(0, 10) : "Recent"}</span>
                  </div>
                  <div className="text-sm font-bold text-white">{rt.distance_km} km</div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-emerald-400">{rt.avg_speed_kmh} km/h</div>
                  <div className="text-[10px] text-zinc-500">{formatTime(rt.duration_seconds || 0)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
