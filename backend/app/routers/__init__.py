from .exercises import router as exercises_router
from .workouts import router as workouts_router
from .feeds import router as feeds_router
from .health import router as health_router
from .progress import router as progress_router
from .auth import router as auth_router
from .body_metrics import router as body_metrics_router
from .programs import router as programs_router
from .goals import router as goals_router
from .schedule import router as schedule_router
from .export import router as export_router

__all__ = ["exercises_router", "workouts_router", "feeds_router", "health_router", "progress_router", "auth_router", "body_metrics_router", "programs_router", "goals_router", "schedule_router", "export_router"]