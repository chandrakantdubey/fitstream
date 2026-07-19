from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import engine, Base, SessionLocal
from app.core.seed import seed_exercises
from app.routers import (
    exercises_router,
    workouts_router,
    feeds_router,
    health_router,
    progress_router,
)

Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    db = SessionLocal()
    try:
        seed_exercises(db)
    finally:
        db.close()

    yield

    # Shutdown (optional)
    # Add cleanup code here if needed.


app = FastAPI(
    title="FitStream API",
    version="2.0.0",
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
app.include_router(feeds_router)
app.include_router(health_router)
app.include_router(progress_router)


@app.get("/")
def root():
    return {
        "app": "FitStream API",
        "version": "2.0.0",
        "db": "sqlite",
        # "channels": list(channel_router.channels.keys()),
    }