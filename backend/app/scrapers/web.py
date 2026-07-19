import httpx, subprocess, json, re
from .router import router

def _jina(url: str):
    if not url.startswith(("http://","https://")): url = "https://" + url
    r = httpx.get(f"https://r.jina.ai/{url}", timeout=30)
    r.raise_for_status()
    return {"url": url, "content": r.text[:10000], "source": "jina_reader", "length": len(r.text)}

def _direct(url: str):
    if not url.startswith(("http://","https://")): url = "https://" + url
    r = httpx.get(url, timeout=30, headers={"User-Agent": "Mozilla/5.0"})
    text = re.sub(r'<[^>]+>', ' ', r.text)
    text = re.sub(r'\\s+', ' ', text).strip()
    return {"url": url, "content": text[:10000], "source": "direct_fetch", "length": len(text)}

async def read_webpage(url: str):
    return router.route("web", lambda: _jina(url), [lambda: _direct(url)]).data

def _exa(q: str):
    r = subprocess.run(["mcporter", "search", q], capture_output=True, text=True, timeout=15)
    if r.returncode != 0: raise RuntimeError(r.stderr[:200])
    return {"results": json.loads(r.stdout), "engine": "exa"}

def _ddg(q: str):
    return {"results": [{"title": f"Search: {q}", "url": f"https://duckduckgo.com/?q={q.replace(' ','+')}+fitness"}], "engine": "duckduckgo"}

async def web_search(query: str):
    return router.route("search", lambda: _exa(query), [lambda: _ddg(query)]).data