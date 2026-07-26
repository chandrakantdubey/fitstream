import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ToastContainer from "./components/ToastContainer";
import useAuthStore from "./stores/authStore";
import Home from "./pages/Home";
import Challenges from "./pages/Challenges";
import Workouts from "./pages/Workouts";
import WorkoutPlayer from "./pages/WorkoutPlayer";
import Library from "./pages/Library";
import MapTracker from "./pages/MapTracker";
import KnowledgeBase from "./pages/KnowledgeBase";
import Settings from "./pages/Settings";
import MoreHub from "./pages/MoreHub";
import ProgressAnalytics from "./pages/ProgressAnalytics";
import Login from "./pages/Login";
import Register from "./pages/Register";

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <div className="min-h-screen pb-24 bg-zinc-950 text-zinc-100 font-sans">
      <main className="max-w-2xl mx-auto px-4 pt-6">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/challenges" element={
            <ProtectedRoute>
              <Challenges />
            </ProtectedRoute>
          } />
          <Route path="/workouts" element={
            <ProtectedRoute>
              <Workouts />
            </ProtectedRoute>
          } />
          <Route path="/play/:workoutId" element={
            <ProtectedRoute>
              <WorkoutPlayer />
            </ProtectedRoute>
          } />
          <Route path="/more" element={
            <ProtectedRoute>
              <MoreHub />
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <ProgressAnalytics />
            </ProtectedRoute>
          } />
          <Route path="/library" element={
            <ProtectedRoute>
              <Library />
            </ProtectedRoute>
          } />
          <Route path="/maps" element={
            <ProtectedRoute>
              <MapTracker />
            </ProtectedRoute>
          } />
          <Route path="/knowledge" element={
            <ProtectedRoute>
              <KnowledgeBase />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Navbar />
      <ToastContainer />
    </div>
  );
}
