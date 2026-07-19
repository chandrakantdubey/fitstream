import json, subprocess
import httpx
from .router import router

def _yt_dlp(q: str, max_r: int):
    cmd = ["yt-dlp", f"ytsearch{max_r}:{q} fitness", "--dump-json", "--playlist-end", str(max_r), "--no-download", "--quiet"]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    if r.returncode != 0: raise RuntimeError(r.stderr[:200])
    vids = []
    for line in r.stdout.strip().split('\\n')[:max_r]:
        if not line.strip(): continue
        try:
            d = json.loads(line)
            vids.append({"id": d["id"], "title": d.get("title"), "channel": d.get("channel"),
                "duration": d.get("duration"), "thumbnail": d.get("thumbnail"),
                "url": f"https://youtube.com/watch?v={d['id']}", "backend": "yt_dlp"})
        except: pass
    return {"videos": vids, "backend": "yt_dlp"}

def _invidious(q: str, max_r: int):
    for inst in ["https://vid.puffyan.us", "https://y.com.sb"]:
        try:
            url = f"{inst}/api/v1/search?q={q.replace(' ','+')}+fitness&type=video"
            r = httpx.get(url, timeout=15)
            if r.status_code == 200:
                vids = [{"id": v["videoId"], "title": v.get("title"), "channel": v.get("author"),
                    "duration": v.get("lengthSeconds",0), "thumbnail": f"https://i.ytimg.com/vi/{v['videoId']}/mqdefault.jpg",
                    "url": f"https://youtube.com/watch?v={v['videoId']}", "backend": "invidious"} for v in r.json()[:max_r]]
                return {"videos": vids, "backend": "invidious"}
        except: pass
    raise RuntimeError("Invidious down")

def search_youtube(query: str, max_results: int = 5):
    return router.route("youtube", lambda: _yt_dlp(query, max_results), [lambda: _invidious(query, max_results)]).data