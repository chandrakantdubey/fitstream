import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ToastContainer from "./components/ToastContainer";
import useAuthStore from "./stores/authStore";
import Home from "./pages/Home";
import Library from "./pages/Library";
import Workouts from "./pages/Workouts";
import WorkoutPlayer from "./pages/WorkoutPlayer";
import Feeds from "./pages/Feeds";
import Progress from "./pages/Progress";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BodyMetrics from "./pages/BodyMetrics";
import Programs from "./pages/Programs";
import Goals from "./pages/Goals";
import Schedule from "./pages/Schedule";

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <div className="min-h-screen pb-24 bg-zinc-950">
      <main className="max-w-2xl mx-auto px-4 pt-6">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/library" element={
            <ProtectedRoute>
              <Library />
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
          <Route path="/feeds" element={
            <ProtectedRoute>
              <Feeds />
            </ProtectedRoute>
          } />
          <Route path="/progress" element={
            <ProtectedRoute>
              <Progress />
            </ProtectedRoute>
          } />
          <Route path="/body-metrics" element={
            <ProtectedRoute>
              <BodyMetrics />
            </ProtectedRoute>
          } />
          <Route path="/programs" element={
            <ProtectedRoute>
              <Programs />
            </ProtectedRoute>
          } />
          <Route path="/goals" element={
            <ProtectedRoute>
              <Goals />
            </ProtectedRoute>
          } />
          <Route path="/schedule" element={
            <ProtectedRoute>
              <Schedule />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      <Navbar />
      <ToastContainer />
    </div>
  );
}
