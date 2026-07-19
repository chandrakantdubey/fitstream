import subprocess, json, httpx
from .router import router

def _bili_cli(q: str, max_r: int):
    cmd = ["bili", "search", q, "--limit", str(max_r), "--json"]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=20)
    if r.returncode != 0: raise RuntimeError(r.stderr[:200])
    vids = json.loads(r.stdout)
    return {"videos": [{"bvid": v.get("bvid"), "title": v.get("title"), "author": v.get("author"),
        "pic": v.get("pic"), "url": f"https://bilibili.com/video/{v.get('bvid')}", "play": v.get("play",0)} for v in vids], "backend": "bili_cli"}

def _opencli(q: str, max_r: int):
    cmd = ["opencli", "bilibili", "search", q, "--limit", str(max_r)]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=20)
    if r.returncode != 0: raise RuntimeError(r.stderr[:200])
    return {"content": r.stdout[:5000], "backend": "opencli"}

def _api(q: str, max_r: int):
    url = "https://api.bilibili.com/x/web-interface/search/type"
    params = {"search_type": "video", "keyword": q, "page": 1, "pagesize": max_r}
    headers = {"User-Agent": "Mozilla/5.0", "Referer": "https://search.bilibili.com/"}
    r = httpx.get(url, params=params, headers=headers, timeout=15)
    data = r.json()
    vids = []
    if data.get("data",{}).get("result"):
        for v in data["data"]["result"][:max_r]:
            title = v.get("title","").replace('<em class=\"keyword\">',"").replace("</em>","")
            vids.append({"bvid": v.get("bvid"), "title": title, "author": v.get("author",""),
                "duration": v.get("duration",""), "pic": v.get("pic",""),
                "url": f"https://bilibili.com/video/{v.get('bvid')}", "play": v.get("play",0)})
    return {"videos": vids, "backend": "bilibili_api"}

def search_bilibili(query: str, max_results: int = 10):
    return router.route("bilibili", lambda: _bili_cli(query, max_results), [
        lambda: _opencli(query, max_results), lambda: _api(query, max_results)
    ]).data

def get_bilibili_video(bvid: str):
    try:
        r = subprocess.run(["bili", "video", bvid, "--json"], capture_output=True, text=True, timeout=15)
        if r.returncode == 0: return {"video": json.loads(r.stdout), "backend": "bili_cli"}
    except: pass
    try:
        r = httpx.get(f"https://api.bilibili.com/x/web-interface/view?bvid={bvid}", timeout=15)
        return {"video": r.json().get("data",{}), "backend": "bilibili_api"}
    except Exception as e:
        return {"error": str(e)}