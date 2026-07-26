from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError, HTTPException
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
    reset_router,
)

Base.metadata.create_all(bind=engine)
run_sqlite_compat_migrations(engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    db = SessionLocal()
    try:
        seed_exercises(db)
    finally:
        db.close()

    yield


app = FastAPI(
    title="FitStream API",
    version="2.2.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "status_code": exc.status_code}
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    msg = errors[0].get("msg", "Validation error") if errors else "Invalid request format"
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": msg, "errors": errors, "status_code": 422}
    )

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    print(f"Unhandled server error: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error occurred", "status_code": 500}
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
app.include_router(reset_router)


@app.get("/")
def root():
    return {
        "app": "FitStream API",
        "version": "2.2.0",
        "db": "sqlite",
        "status": "healthy"
    }
