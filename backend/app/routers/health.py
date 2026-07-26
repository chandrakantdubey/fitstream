from fastapi import APIRouter

router = APIRouter(prefix="/health", tags=["health"])

@router.get("")
def health():
    return {"status": "ok", "service": "FitStream API v2.1"}

@router.get("/doctor")
def doctor():
    return {"status": "healthy", "database": "connected"}