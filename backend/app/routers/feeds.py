from fastapi import APIRouter, Query
from app.scrapers.youtube import search_youtube
from app.scrapers.twitter import search_twitter, read_tweet
from app.scrapers.reddit import search_reddit, read_reddit_post
from app.scrapers.bilibili import search_bilibili, get_bilibili_video
from app.scrapers.xiaohongshu import search_xiaohongshu, read_xiaohongshu_note
from app.scrapers.web import read_webpage, web_search
from app.scrapers.rss import parse_rss

router = APIRouter(prefix="/feed", tags=["feeds"])

@router.get("/youtube")
def yt(q: str = Query(...), max_results: int = Query(5, ge=1, le=10)):
    return search_youtube(q, max_results)

@router.get("/twitter")
def tw(q: str = Query(...), max_results: int = Query(10, ge=1, le=20)):
    return search_twitter(q, max_results)

@router.get("/twitter/post")
def tw_post(url: str = Query(...)):
    return read_tweet(url)

@router.get("/reddit")
async def rd(q: str = Query(...), subreddit: str = Query("fitness")):
    return await search_reddit(q, subreddit)

@router.get("/reddit/post")
async def rd_post(url: str = Query(...)):
    return await read_reddit_post(url)

@router.get("/bilibili")
def bl(q: str = Query(...), max_results: int = Query(10, ge=1, le=20)):
    return search_bilibili(q, max_results)

@router.get("/bilibili/video")
def bl_vid(bvid: str = Query(...)):
    return get_bilibili_video(bvid)

@router.get("/xiaohongshu")
def xhs(q: str = Query(...), max_results: int = Query(10, ge=1, le=20)):
    return search_xiaohongshu(q, max_results)

@router.get("/xiaohongshu/note")
def xhs_note(url: str = Query(...)):
    return read_xiaohongshu_note(url)

@router.get("/rss")
def rss(url: str = Query("https://www.bodybuilding.com/rss/articles")):
    return parse_rss(url)

@router.get("/web")
async def web(url: str = Query(...)):
    return await read_webpage(url)

@router.get("/search")
async def search(q: str = Query(...)):
    return await web_search(q)