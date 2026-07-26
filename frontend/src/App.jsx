import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ToastContainer from "./components/ToastContainer";
import ErrorBoundary from "./components/ErrorBoundary";
import useAuthStore from "./stores/authStore";

// Lazy Loaded Page Components for optimal PWA route splitting
const Home = lazy(() => import("./pages/Home"));
const Challenges = lazy(() => import("./pages/Challenges"));
const Workouts = lazy(() => import("./pages/Workouts"));
const WorkoutPlayer = lazy(() => import("./pages/WorkoutPlayer"));
const Library = lazy(() => import("./pages/Library"));
const MapTracker = lazy(() => import("./pages/MapTracker"));
const KnowledgeBase = lazy(() => import("./pages/KnowledgeBase"));
const Settings = lazy(() => import("./pages/Settings"));
const MoreHub = lazy(() => import("./pages/MoreHub"));
const ProgressAnalytics = lazy(() => import("./pages/ProgressAnalytics"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));

function LoadingFallback() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Loading View...</p>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen pb-24 bg-zinc-950 text-zinc-100 font-sans">
        <main className="max-w-2xl mx-auto px-4 pt-6">
          <Suspense fallback={<LoadingFallback />}>
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
          </Suspense>
        </main>
        <Navbar />
        <ToastContainer />
      </div>
    </ErrorBoundary>
  );
}
