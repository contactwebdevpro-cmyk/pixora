'use client'

import { useEffect, useCallback } from 'react'
import { useAppStore, Channel } from '@/lib/store'
import { Header } from '@/components/header'
import { Sidebar } from '@/components/sidebar'
import { ChannelList } from '@/components/channel-list'
import { VideoPlayer } from '@/components/video-player'
import { SettingsModal } from '@/components/settings-modal'
import { FilmMode } from '@/components/film-mode'
import { useNotification } from '@/components/notification'

const PROXIES = [
  (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
  (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
]

export function TVApp() {
  const { appMode, m3uUrl, setChannels, setLoading, channels } = useAppStore()
  const { notify } = useNotification()

  const parseM3U = useCallback((text: string): Channel[] => {
    const lines = text.split('\n')
    const result: Channel[] = []
    let current: Partial<Channel> | null = null
    let id = 0

    for (const raw of lines) {
      const line = raw.trim()
      if (!line) continue

      if (line.startsWith('#EXTINF:')) {
        current = {
          id: `c${++id}`,
          name: '',
          group: 'Autres',
          logo: '',
          url: '',
        }
        
        const commaIdx = line.lastIndexOf(',')
        current.name = commaIdx >= 0 ? line.slice(commaIdx + 1).trim() : `Ch.${id}`
        
        const tvgName = line.match(/tvg-name="([^"]*)"/i)
        const tvgLogo = line.match(/tvg-logo="([^"]*)"/i)
        const groupTitle = line.match(/group-title="([^"]*)"/i)
        const tvgId = line.match(/tvg-id="([^"]*)"/i)
        
        if (tvgName) current.name = tvgName[1] || current.name
        if (tvgLogo) current.logo = tvgLogo[1]
        if (groupTitle) current.group = groupTitle[1] || 'Autres'
        if (tvgId) current.id = `c_${tvgId[1].replace(/[^a-z0-9]/gi, '_')}_${id}`
      } else if (current && !line.startsWith('#') && /^https?:|^rtmps?:|^rtsp:/.test(line)) {
        current.url = line
        result.push(current as Channel)
        current = null
      }
    }
    
    return result
  }, [])

  const loadM3U = useCallback(async () => {
    if (channels.length > 0) return // Already loaded
    
    setLoading(true)
    
    for (const proxy of PROXIES) {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 20000)
        
        const response = await fetch(proxy(m3uUrl), { signal: controller.signal })
        clearTimeout(timeout)
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        
        const text = await response.text()
        const parsed = parseM3U(text)
        
        if (parsed.length === 0) throw new Error('No channels found')
        
        setChannels(parsed)
        setLoading(false)
        notify('✓ Prêt', `${parsed.length} chaînes chargées`)
        return
      } catch (e) {
        console.warn('M3U load attempt failed:', e)
      }
    }
    
    setLoading(false)
    notify('Erreur', 'Impossible de charger les chaînes')
  }, [m3uUrl, setChannels, setLoading, notify, parseM3U, channels.length])

  useEffect(() => {
    if (appMode === 'tv') {
      loadM3U()
    }
  }, [appMode, loadM3U])

  if (!appMode) return null

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        {appMode === 'tv' ? (
          <>
            <Sidebar />
            <ChannelList />
          </>
        ) : (
          <FilmMode />
        )}
      </div>
      <VideoPlayer />
      <SettingsModal />
    </div>
  )
}
