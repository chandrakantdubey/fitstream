import { useState, useEffect } from 'react'
import { WifiOff } from 'lucide-react'

export default function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine)
  useEffect(() => {
    const onOff = () => setOffline(true)
    const onOn = () => setOffline(false)
    window.addEventListener('offline', onOff)
    window.addEventListener('online', onOn)
    return () => { window.removeEventListener('offline', onOff); window.removeEventListener('online', onOn) }
  }, [])
  if (!offline) return null
  return (
    <div className="bg-amber-600 text-white text-center text-sm py-1.5 flex items-center justify-center gap-2">
      <WifiOff size={14} /> You're offline. Using cached data.
    </div>
  )
}