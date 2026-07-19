from fastapi import APIRouter
from app.scrapers.router import router as channel_router

router = APIRouter(prefix="/health", tags=["health"])

@router.get("")
def health():
    return {"status": "ok"}

@router.get("/doctor")
def doctor():
    return channel_router.doctor()

@router.get("/channels")
def channels():
    return {"channels": channel_router.channels}