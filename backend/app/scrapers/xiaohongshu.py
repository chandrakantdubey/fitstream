import subprocess, httpx
from .router import router

def _opencli(q: str, max_r: int):
    cmd = ["opencli", "xiaohongshu", "search", q, "--limit", str(max_r)]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=20)
    if r.returncode != 0: raise RuntimeError(r.stderr[:200])
    return {"content": r.stdout[:5000], "backend": "opencli"}

def _xhs(q: str, max_r: int):
    cmd = ["xhs", "search", q, "--limit", str(max_r), "--json"]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=20)
    if r.returncode != 0: raise RuntimeError(r.stderr[:200])
    notes = json.loads(r.stdout)
    return {"notes": notes, "backend": "xhs_cli", "count": len(notes)}

def _mcp(q: str, max_r: int):
    r = httpx.post("http://localhost:3000/search", json={"query": q, "limit": max_r}, timeout=30)
    return {"notes": r.json(), "backend": "xiaohongshu_mcp"}

def search_xiaohongshu(query: str, max_results: int = 10):
    return router.route("xiaohongshu", lambda: _opencli(query, max_results), [
        lambda: _xhs(query, max_results), lambda: _mcp(query, max_results)
    ]).data

def read_xiaohongshu_note(url: str):
    try:
        r = subprocess.run(["opencli", "xiaohongshu", "note", url], capture_output=True, text=True, timeout=15)
        if r.returncode == 0: return {"content": r.stdout[:5000], "backend": "opencli"}
    except: pass
    try:
        r = subprocess.run(["xhs", "note", url, "--json"], capture_output=True, text=True, timeout=15)
        if r.returncode == 0: return {"note": json.loads(r.stdout), "backend": "xhs_cli"}
    except Exception as e:
        return {"error": str(e)}