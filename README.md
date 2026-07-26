# ⚡ FitStream v2.2 - Progressive Web App (PWA) & Personal Training Suite

FitStream is a modern, high-performance Progressive Web Application (PWA) designed for athlete workout tracking, 30-day progressive challenges, outdoor GPS route mapping, live exercise execution form guides, and nutrition science calculators. Built with FastAPI, SQLite, React, Vite, Tailwind CSS, Zustand, and Leaflet.js.

---

## 🚀 Key Features & Capabilities

### 📱 1. Streamlined 4-Tab Bottom Navigation
- **Today** (`/`): Daily athlete dashboard featuring:
  - **3 Dynamic Activity Rings**: Active Time, Calories Burned, and Hydration Goal.
  - **Fluid Wave Hydration Widget**: Glass presets (+250ml, +500ml, +750ml) and custom intake logger.
  - **Physical Profile Card**: Height (cm), Current Weight (kg), Target Weight (kg), Age, calculated **BMI**, and calculated **BMR Calories**.
- **30-Day** (`/challenges`): 30-Day Progressive Workout Program with built-in recovery days, day preview modals, and guided stretching timers.
- **Workouts** (`/workouts`): Preset Push/Pull/Legs splits, Custom Workout Creator modal, and AI Plan Wizard generator.
- **More** (`/more`): Central launcher hub linking to Exercise Library, GPS Maps, Knowledge Calculators, Progress Analytics, and Profile Settings.

---

### 📋 2. 3-Step Signup & Fitness Onboarding Wizard
- **Step 1: Account Credentials** (Full Name, Email Address, Password).
- **Step 2: Physical Metrics** (Height, Current Weight, Target Weight, Age, Gender).
- **Step 3: Fitness Goal** (Build Muscle & Strength, Lose Weight & Fat Burn, General Fitness).
- Automatically initializes user profile, hydration target (`weight_kg * 35 ml`), BMI, and BMR.

---

### 🏆 3. 30-Day Progressive Challenge System
- **4 Dedicated 30-Day Programs**:
  - 💥 *Six Pack Abs in 30 Days*
  - 🦾 *Arm Sculpt & Strength 30 Days*
  - 🦵 *Leg & Glute Builder 30 Days*
  - ⚡ *Full Body HIIT Fat Burn 30 Days*
- **Specific Daily Routines**: Every day (Days 1–30) features specific, progressive exercises tailored to target muscle groups.
- **Milestone Badges**: 🥉 7-Day Iron Core, 🥈 15-Day Halfway, 👑 30-Day Master Champion.
- **Rest Day Guided Stretching Player**: Active recovery timer for Cobra Stretch, Child's Pose, and Cat-Cow Warmup.

---

### 📚 4. Exercise Database & Form Execution Guides
- **1,300+ Exercise Library**: Instant client-side search by name or target muscle.
- **Filter Pills**: Target Muscle Groups (Chest, Back, Legs, Shoulders, Biceps, Triceps, Abs, Cardio) and Equipment (Barbell, Dumbbell, Bodyweight, Cable, Machine).
- **Starred Favorites**: One-tap bookmarking for favorite exercises.
- **Exercise Detail Form Guide Modal**: Step-by-step execution form tips, core stability pointers, and breathing cues.

---

### 🗺️ 5. Outdoor GPS Map Route Tracker
- Interactive Leaflet.js map tracking real-time position for **Running**, **Outdoor Cycling**, and **Walking**.
- Live Telemetry Dashboard: Distance (km), Elapsed Time, Speed (km/h), and Estimated Calories Burned.
- Post-Activity Summary Modal displaying completed route statistics and saved polyline map.

---

### 💡 6. Fitness Knowledge Base & Science Calculators
- **1RM (One Rep Max) Calculator**: Epley & Brzycki formulas generating a 6-tier load training percentage chart (95%, 90%, 85%, 80%, 75%, 70%).
- **TDEE & Macro Nutrition Calculator**: Basal Metabolic Rate (BMR), Total Daily Energy Expenditure (TDEE), and Protein/Carb/Fat macro splits for Bulking, Cutting, and Recomposition.
- **Training Wiki**: Articles on progressive overload, volume landmines, and recovery science.

---

### 📊 7. Progress Analytics & CSV Data Export
- **Progress Analytics View** (`/analytics`): Visual weight progress bar toward target weight goal, remaining kilograms, body circumference logs (Waist, Chest, Biceps, Thighs), and activity performance totals.
- **CSV Data Export**: Export daily metrics, body stats, and completed workout sessions as a clean `.csv` file download (`GET /export/csv`).

---

## 🛠️ Technology Stack

- **Backend**: Python 3.12, FastAPI, SQLAlchemy ORM, SQLite, Pydantic v2, PyJWT, Passlib (Bcrypt).
- **Frontend**: React 18, Vite 6, Tailwind CSS, Zustand, React Router v6, Lucide React Icons, Leaflet.js.
- **PWA Capabilities**: Service Workers (Vite PWA Plugin), Web App Manifest, Web Speech API Voice Cues, Web Geolocation API.

---

## 🚀 Running Locally

### Backend Setup
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Visit application at `http://localhost:5173`.
