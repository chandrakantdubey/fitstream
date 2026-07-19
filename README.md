# FitStream

A fitness PWA built with React + FastAPI, using:
- **exercises-dataset**: 1,324 exercises with metadata
- **Agent-Reach**: Multi-backend scraping for YouTube, Twitter/X, Reddit, Bilibili, Xiaohongshu

## Quick Start

```bash
# 1. Setup
chmod +x scripts/setup.sh
./scripts/setup.sh

# 2. Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python main.py

# 3. Frontend (new terminal)
cd frontend
npm install
npm run dev
```

## Agent-Reach Channels

| Channel | Primary | Fallback 1 | Fallback 2 |
|---------|---------|-----------|-------------|
| YouTube | yt-dlp | Invidious API | — |
| Twitter/X | twitter-cli | opencli | nitter RSS |
| Reddit | opencli | rdt-cli | jina_reader |
| Bilibili | bili-cli | opencli | Bilibili API |
| Xiaohongshu | opencli | xhs-cli | xiaohongshu-mcp |
| Web | jina_reader | direct_fetch | — |
| Search | exa/mcporter | duckduckgo | — |

## API Endpoints

- `GET /exercises` — List exercises (q, category, equipment, target, limit, offset)
- `GET /exercises/{id}` — Single exercise
- `GET /exercises/filters/all` — Available filters
- `POST /workouts` — Create workout
- `GET /workouts` — List workouts
- `GET /feed/youtube?query=` — YouTube search
- `GET /feed/twitter?query=` — Twitter/X search
- `GET /feed/reddit?query=` — Reddit search
- `GET /feed/bilibili?query=` — Bilibili search
- `GET /feed/xiaohongshu?query=` — Xiaohongshu search
- `GET /feed/web?url=` — Webpage reader
- `GET /feed/search?q=` — Web search
- `GET /health/doctor` — Agent-Reach backend health check
