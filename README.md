# FitStream 🏋️‍♂️⚡

A feature-rich Fitness PWA & Exercise Tracking application built with **React**, **Tailwind CSS**, **FastAPI**, and **SQLite**. Inspired by top workout platforms like **Leap Fitness Group**.

FitStream focuses on exercise management, personalized workout plan creation, 30-day progressive challenges, outdoor GPS activity tracking, and evidence-based training science.

---

## 🌟 Core Features

- 🎯 **1,300+ Exercise Database**: Filter by target muscle, equipment (Bodyweight, Dumbbells, Barbells, Cables), and category.
- 🔥 **30-Day Progressive Challenges**: Structured multi-week programs (*Six Pack Abs*, *Arm Sculpt*, *Leg Builder*, *Full Body Fat Burn*) with automated rest days.
- 💧 **Daily Activity & Habit Tracker**:
  - Daily Streak Counter & 30-Day Calendar Activity Heatmap.
  - Water Hydration Tracker (+250ml / +500ml quick add buttons).
  - Active Minutes, Estimated Caloric Burn & Body Weight/Measurement logger.
- 🎙️ **Voice-Guided Live Workout Player**:
  - Web Speech API voice synthesis announcing exercise transitions and rest periods.
  - Interactive rest timer count-down with audio beep cues.
  - Set-by-set weight & rep tracking with total volume calculation.
- 🪄 **Personalized Plan Generator**: Step-by-step wizard creating custom weekly training splits (PPL, Upper/Lower, 3-Day Full Body) based on goals, experience level, and equipment access.
- 🗺️ **Outdoor GPS Map Tracker**:
  - Interactive **Leaflet.js** map rendering with real-time polyline route drawing for Running, Cycling, and Walking.
  - Calculates distance (km), duration, average speed (km/h), elevation gain, and calories burned.
- 📚 **Fitness Knowledge Base & 1RM Calculator**:
  - Evidence-based guidelines on exercise selection and weekly set volume ("how much & what type of exercises").
  - Epley formula 1RM (One Rep Max) calculator and working load percentage estimator (85%, 75%, 70%).

---

## 🚀 Quick Start

### 1. Backend Setup (FastAPI + SQLite)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```
*Backend runs on `http://localhost:8000`.*

### 2. Frontend Setup (React + Vite + Leaflet)

```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 📡 API Reference

### Daily Tracker (`/daily`)
- `GET /daily/log?user_id=1&log_date=YYYY-MM-DD` — Get daily metrics, water intake & active minutes.
- `POST /daily/water` — Log water intake in ml.
- `POST /daily/metrics` — Log weight (kg), waist (cm), chest, and bicep measurements.
- `GET /daily/streak?user_id=1` — Get current streak count and 30-day activity heatmap.

### 30-Day Challenges (`/challenges`)
- `GET /challenges/catalog` — List available 30-day challenge programs.
- `GET /challenges/details/{challenge_id}` — Get 30-day calendar schedule and rest days.
- `POST /challenges/start` — Start a 30-day challenge program.
- `POST /challenges/complete-day` — Mark a challenge day completed.

### GPS Outdoor Maps (`/maps`)
- `POST /maps/route` — Save outdoor activity with GPS coordinate list.
- `GET /maps/routes` — Fetch saved outdoor routes.
- `DELETE /maps/routes/{route_id}` — Remove a saved outdoor route.

### Knowledge Base & Tools (`/knowledge`)
- `GET /knowledge/articles` — Get training science and volume guidelines.
- `GET /knowledge/calculator/1rm?weight=&reps=` — Calculate 1RM and working set percentages.

### Exercises & Workouts (`/exercises`, `/workouts`)
- `GET /exercises` — Search & filter exercise database.
- `GET /workouts` — List custom workout templates & routines.
