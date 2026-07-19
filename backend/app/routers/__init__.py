from .exercises import router as exercises_router
from .workouts import router as workouts_router
from .feeds import router as feeds_router
from .health import router as health_router
from .progress import router as progress_router

__all__ = ["exercises_router", "workouts_router", "feeds_router", "health_router", "progress_router"]