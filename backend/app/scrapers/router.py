import subprocess
from typing import List, Dict, Optional, Callable
from dataclasses import dataclass
from enum import Enum


class BackendStatus(Enum):
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    DOWN = "down"
    NOT_INSTALLED = "not_installed"


@dataclass
class RouteResult:
    backend: str
    data: dict
    status: BackendStatus
    fallback_used: bool = False
    error_log: List[str] = None
    def __post_init__(self):
        if self.error_log is None:
            self.error_log = []


class ChannelRouter:
    def __init__(self):
        self.channels = {
            "youtube": ["yt_dlp", "invidious"],
            "twitter": ["twitter_cli", "opencli", "nitter"],
            "reddit": ["opencli", "rdt_cli", "jina_reader"],
            "bilibili": ["bili_cli", "opencli", "bilibili_api"],
            "xiaohongshu": ["opencli", "xhs_cli", "xiaohongshu_mcp"],
            "web": ["jina_reader", "direct_fetch"],
            "search": ["exa_mcporter", "duckduckgo"]
        }
        self._health = {}

    def _probe(self, backend: str) -> BackendStatus:
        tools = {
            "yt_dlp": ["yt-dlp", "--version"],
            "twitter_cli": ["twitter", "--version"],
            "opencli": ["opencli", "--version"],
            "rdt_cli": ["rdt", "--version"],
            "bili_cli": ["bili", "--version"],
            "xhs_cli": ["xhs", "--version"],
            "exa_mcporter": ["mcporter", "--version"]
        }
        if backend not in tools:
            return BackendStatus.HEALTHY
        try:
            r = subprocess.run(tools[backend], capture_output=True, text=True, timeout=5)
            return BackendStatus.HEALTHY if r.returncode == 0 else BackendStatus.DEGRADED
        except FileNotFoundError:
            return BackendStatus.NOT_INSTALLED
        except Exception:
            return BackendStatus.DOWN

    def get_working(self, channel: str) -> Optional[str]:
        for b in self.channels.get(channel, []):
            s = self._probe(b)
            self._health[b] = s
            if s in (BackendStatus.HEALTHY, BackendStatus.DEGRADED):
                return b
        return None

    def route(self, channel: str, primary: Callable, fallbacks: List[Callable]) -> RouteResult:
        errors = []
        working = self.get_working(channel)
        if working == self.channels.get(channel, ["unknown"])[0]:
            try:
                return RouteResult(backend=working, data=primary(), status=BackendStatus.HEALTHY)
            except Exception as e:
                errors.append(f"Primary failed: {e}")
        for fn in fallbacks:
            try:
                return RouteResult(backend="fallback", data=fn(), status=BackendStatus.DEGRADED, fallback_used=True, error_log=errors)
            except Exception as e:
                errors.append(f"Fallback failed: {e}")
        return RouteResult(backend="none", data={"error": "All backends failed", "details": errors}, status=BackendStatus.DOWN, error_log=errors)

    def doctor(self) -> Dict:
        report = {}
        for ch, backends in self.channels.items():
            report[ch] = [{"backend": b, "status": self._probe(b).value} for b in backends]
        return report


router = ChannelRouter()