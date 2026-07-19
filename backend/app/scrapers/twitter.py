import subprocess, json, httpx
from .router import router

def _twitter_cli(q: str, max_r: int):
    cmd = ["twitter", "search", q, "--limit", str(max_r), "--json"]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=20)
    if r.returncode != 0: raise RuntimeError(r.stderr[:200])
    tweets = json.loads(r.stdout)
    return {"tweets": [{"text": t.get("text",""), "author": t.get("author",""), "url": t.get("url",""), "date": t.get("date","")} for t in tweets], "backend": "twitter_cli"}

def _opencli(q: str, max_r: int):
    cmd = ["opencli", "twitter", "search", q, "--limit", str(max_r)]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=20)
    if r.returncode != 0: raise RuntimeError(r.stderr[:200])
    return {"content": r.stdout[:5000], "backend": "opencli", "format": "markdown"}

def _nitter(q: str, max_r: int):
    for inst in ["nitter.net", "nitter.it"]:
        try:
            url = f"https://{inst}/search/rss?f=tweets&q={q.replace(' ','+')}+fitness"
            r = httpx.get(url, timeout=15)
            if r.status_code == 200:
                import xml.etree.ElementTree as ET
                root = ET.fromstring(r.text)
                items = [{"title": i.findtext('title',''), "link": i.findtext('link',''), "date": i.findtext('pubDate','')} for i in root.findall('.//item')[:max_r]]
                return {"tweets": items, "backend": "nitter"}
        except: pass
    raise RuntimeError("Nitter down")

def search_twitter(query: str, max_results: int = 10):
    return router.route("twitter", lambda: _twitter_cli(query, max_results), [
        lambda: _opencli(query, max_results), lambda: _nitter(query, max_results)
    ]).data

def read_tweet(url: str):
    try:
        r = subprocess.run(["twitter", "tweet", url, "--json"], capture_output=True, text=True, timeout=15)
        if r.returncode == 0: return {"tweet": json.loads(r.stdout), "backend": "twitter_cli"}
    except: pass
    try:
        r = httpx.get(f"https://r.jina.ai/{url}", timeout=15)
        return {"content": r.text[:3000], "backend": "jina_reader"}
    except Exception as e:
        return {"error": str(e)}