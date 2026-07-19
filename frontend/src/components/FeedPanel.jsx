import { useState } from 'react'
import { searchYouTube, searchTwitter, searchReddit, searchBilibili, searchXiaohongshu, readWebPage } from '../utils/api'
import { Search, Youtube, Twitter, MessageSquare, Tv, BookOpen, Globe, Loader2 } from 'lucide-react'

export default function FeedPanel() {
  const [activeTab, setActiveTab] = useState('youtube')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const tabs = [
    { id: 'youtube', icon: Youtube, label: 'YouTube', color: 'text-red-400' },
    { id: 'twitter', icon: Twitter, label: 'Twitter/X', color: 'text-sky-400' },
    { id: 'reddit', icon: MessageSquare, label: 'Reddit', color: 'text-orange-400' },
    { id: 'bilibili', icon: Tv, label: 'Bilibili', color: 'text-pink-400' },
    { id: 'xiaohongshu', icon: BookOpen, label: 'Xiaohongshu', color: 'text-red-300' },
    { id: 'web', icon: Globe, label: 'Web', color: 'text-emerald-400' },
  ]

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    try {
      let data = {}
      switch (activeTab) {
        case 'youtube': data = await searchYouTube(query); break
        case 'twitter': data = await searchTwitter(query); break
        case 'reddit': data = await searchReddit(query); break
        case 'bilibili': data = await searchBilibili(query); break
        case 'xiaohongshu': data = await searchXiaohongshu(query); break
        case 'web': data = await readWebPage(query); break
      }
      setResults(Array.isArray(data) ? data : [data])
    } catch (e) { console.error(e); setResults([{ error: e.message }]) }
    setLoading(false)
  }

  const renderResult = (item, i) => {
    if (item.error) return <div key={i} className="text-red-400 text-sm">Error: {item.error}</div>

    if (activeTab === 'youtube' && item.videos) {
      return (
        <div key={i} className="space-y-2">
          {item.videos.map((v, j) => (
            <a key={j} href={v.url} target="_blank" rel="noopener noreferrer" className="block bg-slate-700/50 rounded-lg p-3 hover:bg-slate-700 transition-colors">
              {v.thumbnail && <img src={v.thumbnail} alt={v.title} className="w-full h-32 object-cover rounded-lg mb-2" />}
              <h4 className="text-sm font-medium text-blue-300">{v.title}</h4>
              <p className="text-xs text-slate-400 mt-1">{v.channel} {v.duration && `• ${Math.floor(v.duration / 60)}m`}</p>
              {item.backend && <span className="text-[10px] text-slate-500">via {item.backend}</span>}
            </a>
          ))}
        </div>
      )
    }

    if (activeTab === 'twitter' && item.tweets) {
      return (
        <div key={i} className="space-y-2">
          {(Array.isArray(item.tweets) ? item.tweets : []).map((t, j) => (
            <div key={j} className="bg-slate-700/50 rounded-lg p-3">
              <p className="text-sm text-slate-300">{typeof t === 'string' ? t : t.text || t.title || JSON.stringify(t).slice(0, 200)}</p>
            </div>
          ))}
          {item.backend && <span className="text-[10px] text-slate-500">via {item.backend}</span>}
        </div>
      )
    }

    if (activeTab === 'reddit' && item.content) {
      return (
        <div key={i} className="bg-slate-700/50 rounded-lg p-3">
          <pre className="text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed max-h-64 overflow-y-auto">{item.content}</pre>
          {item.backend && <span className="text-[10px] text-slate-500 mt-2 block">via {item.backend}</span>}
        </div>
      )
    }

    if (activeTab === 'bilibili' && item.videos) {
      return (
        <div key={i} className="space-y-2">
          {item.videos.map((v, j) => (
            <a key={j} href={v.url} target="_blank" rel="noopener noreferrer" className="block bg-slate-700/50 rounded-lg p-3">
              {v.pic && <img src={v.pic} alt={v.title} className="w-full h-32 object-cover rounded-lg mb-2" />}
              <h4 className="text-sm font-medium text-pink-300">{v.title}</h4>
              <p className="text-xs text-slate-400">{v.author} {v.play_count && `• ${v.play_count} views`}</p>
              {item.backend && <span className="text-[10px] text-slate-500">via {item.backend}</span>}
            </a>
          ))}
        </div>
      )
    }

    if (item.content) {
      return (
        <div key={i} className="bg-slate-700/50 rounded-lg p-3">
          <pre className="text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed max-h-64 overflow-y-auto">{item.content}</pre>
          {item.backend && <span className="text-[10px] text-slate-500 mt-2 block">via {item.backend}</span>}
        </div>
      )
    }

    return <div key={i} className="text-xs text-slate-500">{JSON.stringify(item).slice(0, 300)}</div>
  }

  return (
    <div className="card space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(({ id, icon: Icon, label, color }) => (
          <button key={id} onClick={() => { setActiveTab(id); setResults([]) }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === id ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}>
            <Icon size={14} className={activeTab === id ? '' : color} />
            {label}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input type="text" placeholder={activeTab === 'web' ? 'Enter URL...' : 'Search...'}
          value={query} onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="input flex-1 text-sm" />
        <button onClick={handleSearch} disabled={loading} className="btn-primary px-3">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
        </button>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {results.map((item, i) => renderResult(item, i))}
      </div>
    </div>
  )
}