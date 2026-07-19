import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ToastContainer from "./components/ToastContainer";
import Home from "./pages/Home";
import Library from "./pages/Library";
import Workouts from "./pages/Workouts";
import WorkoutPlayer from "./pages/WorkoutPlayer";
import Feeds from "./pages/Feeds";
import Progress from "./pages/Progress";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <div className="min-h-screen pb-24 bg-zinc-950">
      <main className="max-w-2xl mx-auto px-4 pt-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/library" element={<Library />} />
          <Route path="/workouts" element={<Workouts />} />
          <Route path="/play/:workoutId" element={<WorkoutPlayer />} />
          <Route path="/feeds" element={<Feeds />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
      <Navbar />
      <ToastContainer />
    </div>
  );
}
