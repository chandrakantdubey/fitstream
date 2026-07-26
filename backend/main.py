from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import engine, Base, SessionLocal
from app.core.migrations import run_sqlite_compat_migrations
from app.core.seed import seed_exercises
from app.routers import (
    exercises_router,
    workouts_router,
    health_router,
    progress_router,
    auth_router,
    body_metrics_router,
    programs_router,
    goals_router,
    schedule_router,
    export_router,
    daily_tracker_router,
    challenges_router,
    maps_router,
    knowledge_base_router,
)

Base.metadata.create_all(bind=engine)
run_sqlite_compat_migrations(engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    db = SessionLocal()
    try:
        seed_exercises(db)
    finally:
        db.close()

    yield


app = FastAPI(
    title="FitStream API",
    version="2.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(exercises_router)
app.include_router(workouts_router)
app.include_router(health_router)
app.include_router(progress_router)
app.include_router(auth_router)
app.include_router(body_metrics_router)
app.include_router(programs_router)
app.include_router(goals_router)
app.include_router(schedule_router)
app.include_router(export_router)
app.include_router(daily_tracker_router)
app.include_router(challenges_router)
app.include_router(maps_router)
app.include_router(knowledge_base_router)


@app.get("/")
def root():
    return {
        "app": "FitStream API",
        "version": "2.1.0",
        "db": "sqlite",
        "status": "healthy"
    }
