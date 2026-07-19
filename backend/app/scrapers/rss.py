import feedparser
import re

def parse_rss(url: str, max_items: int = 10):
    try:
        feed = feedparser.parse(url)
        items = []
        for entry in feed.entries[:max_items]:
            items.append({
                "title": entry.get("title", "Untitled"),
                "link": entry.get("link", ""),
                "published": entry.get("published", entry.get("updated", "")),
                "summary": re.sub(r'<[^>]+>', '', entry.get("summary", ""))[:300],
                "author": entry.get("author", "")
            })
        return {"feed_title": feed.feed.get("title", ""), "feed_link": feed.feed.get("link", ""), "items": items}
    except Exception as e:
        return {"error": str(e), "items": []}