import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../stores/authStore";
import { Flame, Sparkles, User, Dumbbell, ChevronRight, Check } from "lucide-react";

const API_BASE = "http://localhost:8000";

export default function Register() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Step 2 Physical Metrics
  const [heightCm, setHeightCm] = useState("175");
  const [weightKg, setWeightKg] = useState("70");
  const [targetWeightKg, setTargetWeightKg] = useState("68");
  const [age, setAge] = useState("25");
  const [gender, setGender] = useState("Male");

  // Step 3 Fitness Goal
  const [fitnessGoal, setFitnessGoal] = useState("Muscle Growth");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    setError("");

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password || password.length < 4) {
      setError("Password must be at least 4 characters long.");
      return;
    }

    try {
      setSubmitting(true);
      const parsedHeight = parseFloat(heightCm);
      const parsedWeight = parseFloat(weightKg);
      const parsedTargetWeight = parseFloat(targetWeightKg);
      const parsedAge = parseInt(age);

      const payload = {
        email: cleanEmail,
        password: password,
        full_name: fullName.trim() || cleanEmail.split("@")[0],
        username: cleanEmail.split("@")[0],
        height_cm: isNaN(parsedHeight) ? 175.0 : parsedHeight,
        weight_kg: isNaN(parsedWeight) ? 70.0 : parsedWeight,
        target_weight_kg: isNaN(parsedTargetWeight) ? 68.0 : parsedTargetWeight,
        age: isNaN(parsedAge) ? 25 : parsedAge,
        gender: gender || "Male",
        fitness_goal: fitnessGoal || "Muscle Growth"
      };

      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        let errMessage = "Registration failed";
        if (typeof data.detail === "string") {
          errMessage = data.detail;
        } else if (Array.isArray(data.detail) && data.detail.length > 0) {
          const firstErr = data.detail[0];
          errMessage = `${firstErr.loc ? firstErr.loc.join(" -> ") + ": " : ""}${firstErr.msg}`;
        }
        throw new Error(errMessage);
      }

      // Automatically log user in
      login(data.access_token, data.user);
      navigate("/");
    } catch (err) {
      setError(err.message || "Registration failed. Please check inputs.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="surface p-8 max-w-md w-full border border-zinc-800 space-y-6 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-1">
            <Flame size={24} className="fill-emerald-400" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Join FitStream</h1>
          <p className="text-xs text-zinc-400">Step {step} of 3 • Personalized Fitness Onboarding</p>
        </div>

        {error && (
          <div className="p-3 bg-red-950/60 border border-red-800/40 rounded-xl text-xs text-red-300 text-center font-medium">
            {error}
          </div>
        )}

        {/* Step 1: Credentials */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Alex Mercer"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-modern w-full"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="alex@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-modern w-full"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-modern w-full"
              />
            </div>

            <button
              onClick={() => {
                if (!email || !email.includes("@")) {
                  setError("Please enter a valid email address.");
                  return;
                }
                if (!password || password.length < 4) {
                  setError("Password must be at least 4 characters long.");
                  return;
                }
                setError("");
                setStep(2);
              }}
              className="btn-brand w-full py-3 text-xs font-extrabold flex items-center justify-center gap-1"
            >
              Continue to Physical Stats <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Step 2: Physical Metrics */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Height (cm)</label>
                <input
                  type="number"
                  required
                  placeholder="175"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  className="input-modern w-full"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Age</label>
                <input
                  type="number"
                  required
                  placeholder="25"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="input-modern w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Current Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="70.0"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="input-modern w-full"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Target Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="68.0"
                  value={targetWeightKg}
                  onChange={(e) => setTargetWeightKg(e.target.value)}
                  className="input-modern w-full"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">Gender</label>
              <div className="grid grid-cols-2 gap-2">
                {["Male", "Female"].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`py-2.5 text-xs font-bold rounded-xl border transition-all ${
                      gender === g
                        ? "bg-emerald-950/80 border-emerald-500 text-white"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-ghost flex-1 py-3 text-xs"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="btn-brand flex-1 py-3 text-xs font-extrabold flex items-center justify-center gap-1"
              >
                Next Goal <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Goals & Submit */}
        {step === 3 && (
          <div className="space-y-4">
            <label className="text-xs text-zinc-400 block font-semibold">Select Primary Fitness Goal</label>
            {[
              { id: "Muscle Growth", label: "Build Muscle & Strength", desc: "Hypertrophy focus with progressive overload" },
              { id: "Weight Loss", label: "Lose Weight & Burn Fat", desc: "High density circuits & calorie burn" },
              { id: "General Fitness", label: "Stay Fit & Healthy", desc: "Balanced full-body routines & cardio" }
            ].map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setFitnessGoal(g.id)}
                className={`w-full p-3 rounded-2xl text-left border transition-all ${
                  fitnessGoal === g.id
                    ? "bg-emerald-950/80 border-emerald-500 text-white"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <div className="font-bold text-xs">{g.label}</div>
                <div className="text-[10px] text-zinc-400">{g.desc}</div>
              </button>
            ))}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn-ghost flex-1 py-3 text-xs"
              >
                Back
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleRegister}
                className="btn-brand flex-1 py-3 text-xs font-extrabold flex items-center justify-center gap-1"
              >
                {submitting ? "Creating Account..." : "Finish Onboarding"} <Sparkles size={15} />
              </button>
            </div>
          </div>
        )}

        <div className="text-center text-xs text-zinc-500 pt-2 border-t border-zinc-800/80">
          Already have an account?{" "}
          <Link to="/login" className="text-emerald-400 font-bold hover:underline">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
