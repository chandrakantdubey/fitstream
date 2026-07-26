import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import {
  MapPin,
  Play,
  Square,
  Navigation,
  Compass,
  Zap,
  Clock,
  History,
  Trash2,
  Check
} from "lucide-react";

const API_BASE = "http://localhost:8000";

// Custom marker icon fix for Leaflet in React
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 16);
    }
  }, [position, map]);
  return null;
}

export default function MapTracker() {
  const [activityType, setActivityType] = useState("Running");
  const [isTracking, setIsTracking] = useState(false);
  const [routeCoords, setRouteCoords] = useState([]);
  const [currentPos, setCurrentPos] = useState([37.7749, -122.4194]); // Default San Francisco coordinates
  const [elapsedSec, setElapsedSec] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0);
  const [savedRoutes, setSavedRoutes] = useState([]);
  const [loadingRoutes, setLoadingRoutes] = useState(true);

  // Fetch saved routes
  const fetchRoutes = async () => {
    try {
      setLoadingRoutes(true);
      const res = await fetch(`${API_BASE}/maps/routes?user_id=1`);
      const data = await res.json();
      setSavedRoutes(data);
    } catch (err) {
      console.error("Error fetching map routes:", err);
    } finally {
      setLoadingRoutes(false);
    }
  };

  useEffect(() => {
    fetchRoutes();

    // Get initial geolocation if available
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const latLng = [pos.coords.latitude, pos.coords.longitude];
          setCurrentPos(latLng);
        },
        (err) => console.log("Geolocation prompt skipped or rejected", err),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // Timer & Location recorder interval
  useEffect(() => {
    let timerInt;
    let gpsWatch;

    if (isTracking) {
      timerInt = setInterval(() => {
        setElapsedSec(s => s + 1);
      }, 1000);

      if ("geolocation" in navigator) {
        gpsWatch = navigator.geolocation.watchPosition(
          (pos) => {
            const newPoint = [pos.coords.latitude, pos.coords.longitude];
            setCurrentPos(newPoint);
            setRouteCoords(prev => {
              if (prev.length > 0) {
                const last = prev[prev.length - 1];
                // Calculate distance step
                const stepDist = calculateDistance(last[0], last[1], newPoint[0], newPoint[1]);
                setDistanceKm(d => d + stepDist);
              }
              return [...prev, newPoint];
            });
          },
          (err) => console.log("GPS watch error", err),
          { enableHighAccuracy: true, distanceFilter: 2 }
        );
      } else {
        // Mock simulation movement for testing without physical GPS movement
        const mockInterval = setInterval(() => {
          setCurrentPos(prev => {
            const nextLat = prev[0] + 0.0001;
            const nextLng = prev[1] + 0.0001;
            const newPoint = [nextLat, nextLng];
            setRouteCoords(c => [...c, newPoint]);
            setDistanceKm(d => d + 0.015);
            return newPoint;
          });
        }, 3000);
        return () => clearInterval(mockInterval);
      }
    }

    return () => {
      clearInterval(timerInt);
      if (gpsWatch) navigator.geolocation.clearWatch(gpsWatch);
    };
  }, [isTracking]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
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
    setRouteCoords([currentPos]);
    setElapsedSec(0);
    setDistanceKm(0);
    setIsTracking(true);
  };

  const handleStopTracking = async () => {
    setIsTracking(false);
    if (distanceKm > 0.01 || routeCoords.length > 1) {
      try {
        const payload = {
          user_id: 1,
          title: `Outdoor ${activityType}`,
          activity_type: activityType,
          distance_km: parseFloat(distanceKm.toFixed(2)),
          duration_seconds: elapsedSec,
          avg_speed_kmh: elapsedSec > 0 ? parseFloat(((distanceKm / (elapsedSec / 3600))).toFixed(1)) : 0,
          calories_burned: Math.round(distanceKm * 65), // ~65 kcal/km estimate
          elevation_gain_m: 12.5,
          coordinates: routeCoords.map(c => ({ lat: c[0], lng: c[1] }))
        };

        await fetch(`${API_BASE}/maps/route`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        fetchRoutes();
      } catch (err) {
        console.error("Error saving route:", err);
      }
    }
  };

  const handleDeleteRoute = async (id) => {
    try {
      await fetch(`${API_BASE}/maps/routes/${id}?user_id=1`, { method: "DELETE" });
      fetchRoutes();
    } catch (err) {
      console.error("Error deleting route:", err);
    }
  };

  const formatTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="space-y-5 pb-24">
      {/* Header */}
      <div>
        <h1 className="page-title flex items-center gap-2">
          <MapPin className="text-emerald-400" size={26} /> Outdoor GPS Map Tracker
        </h1>
        <p className="page-subtitle">
          Record outdoor runs, walks, and cycling activities with Leaflet route drawing.
        </p>
      </div>

      {/* Activity Type Selector */}
      <div className="flex gap-2">
        {["Running", "Cycling", "Walking"].map((act) => (
          <button
            key={act}
            disabled={isTracking}
            onClick={() => setActivityType(act)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border ${
              activityType === act
                ? "bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-900/30"
                : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700"
            }`}
          >
            {act}
          </button>
        ))}
      </div>

      {/* Leaflet Interactive Map Container */}
      <div className="surface overflow-hidden rounded-3xl border border-zinc-800 relative shadow-2xl h-80 z-0">
        <MapContainer
          center={currentPos}
          zoom={16}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <RecenterMap position={currentPos} />

          {/* User location marker */}
          <Marker position={currentPos} icon={customIcon}>
            <Popup>Current Location ({activityType})</Popup>
          </Marker>

          {/* Polyline Route */}
          {routeCoords.length > 1 && (
            <Polyline
              positions={routeCoords}
              color="#10b981"
              weight={5}
              opacity={0.9}
            />
          )}
        </MapContainer>

        {/* Live GPS Overlay stats */}
        <div className="absolute top-4 left-4 right-4 bg-zinc-950/90 backdrop-blur-md p-3.5 rounded-2xl border border-zinc-800 flex justify-between text-center z-[1000] shadow-lg">
          <div>
            <div className="text-xs text-zinc-400 font-medium">Distance</div>
            <div className="text-lg font-black text-white">{distanceKm.toFixed(2)} <span className="text-xs text-emerald-400">km</span></div>
          </div>
          <div>
            <div className="text-xs text-zinc-400 font-medium">Duration</div>
            <div className="text-lg font-black text-white">{formatTime(elapsedSec)}</div>
          </div>
          <div>
            <div className="text-xs text-zinc-400 font-medium">Avg Speed</div>
            <div className="text-lg font-black text-white">
              {elapsedSec > 0 ? (distanceKm / (elapsedSec / 3600)).toFixed(1) : "0.0"} <span className="text-xs text-zinc-400">km/h</span>
            </div>
          </div>
        </div>
      </div>

      {/* Start / Stop Control Buttons */}
      {!isTracking ? (
        <button
          onClick={handleStartTracking}
          className="btn-brand w-full py-4 text-base font-extrabold flex items-center justify-center gap-2 shadow-xl shadow-emerald-900/30"
        >
          <Play size={20} className="fill-current" /> Start {activityType} Tracker
        </button>
      ) : (
        <button
          onClick={handleStopTracking}
          className="btn-danger w-full py-4 text-base font-extrabold flex items-center justify-center gap-2 shadow-xl shadow-red-900/20"
        >
          <Square size={20} className="fill-current" /> Stop & Save Activity
        </button>
      )}

      {/* Saved Routes History */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <History size={18} className="text-emerald-400" /> Saved Outdoor Activities
        </h3>

        {savedRoutes.length === 0 ? (
          <div className="surface p-6 text-center text-xs text-zinc-500">
            No outdoor activities recorded yet. Hit start to record your first run or ride!
          </div>
        ) : (
          <div className="space-y-2">
            {savedRoutes.map((r) => (
              <div key={r.id} className="surface p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="badge bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold">
                      {r.activity_type}
                    </span>
                    <span className="text-xs font-bold text-white">{r.title}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-400">
                    <span>{r.distance_km} km</span>
                    <span>•</span>
                    <span>{formatTime(r.duration_seconds)}</span>
                    <span>•</span>
                    <span className="text-amber-400">{r.calories_burned} kcal</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteRoute(r.id)}
                  className="p-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-zinc-800"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
