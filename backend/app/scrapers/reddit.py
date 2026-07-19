import httpx, subprocess
from .router import router

def _opencli(q: str, sub: str):
    cmd = ["opencli", "reddit", "search", f"subreddit:{sub} {q}", "--limit", "10"]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=20)
    if r.returncode != 0: raise RuntimeError(r.stderr[:200])
    return {"content": r.stdout[:8000], "backend": "opencli", "subreddit": sub}

def _rdt(q: str, sub: str):
    cmd = ["rdt", "search", "--subreddit", sub, q, "--limit", "10", "--json"]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=20)
    if r.returncode != 0: raise RuntimeError(r.stderr[:200])
    posts = json.loads(r.stdout)
    return {"posts": posts, "backend": "rdt_cli", "count": len(posts)}

def _jina(q: str, sub: str):
    url = f"https://r.jina.ai/http://www.reddit.com/r/{sub}/search/?q={q}&sort=new&restrict_sr=1"
    r = httpx.get(url, timeout=30)
    return {"content": r.text[:8000], "backend": "jina_reader", "subreddit": sub}

async def search_reddit(query: str, subreddit: str = "fitness"):
    return router.route("reddit", lambda: _opencli(query, subreddit), [
        lambda: _rdt(query, subreddit), lambda: _jina(query, subreddit)
    ]).data

async def read_reddit_post(url: str):
    try:
        r = subprocess.run(["rdt", "post", url, "--json"], capture_output=True, text=True, timeout=15)
        if r.returncode == 0: return {"post": json.loads(r.stdout), "backend": "rdt_cli"}
    except: pass
    try:
        r = httpx.get(f"https://r.jina.ai/{url}", timeout=30)
        return {"content": r.text[:10000], "backend": "jina_reader", "url": url}
    except Exception as e:
        return {"error": str(e)}