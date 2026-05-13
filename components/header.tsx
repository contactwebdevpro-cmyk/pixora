'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Settings, RefreshCw, Tv, Film } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function Header() {
  const [time, setTime] = useState('')
  const {
    searchQuery,
    setSearchQuery,
    channels,
    setSettingsOpen,
    setAppMode,
    appMode,
    setChannels,
    setLoading,
    m3uUrl,
  } = useAppStore()

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTime(
        now.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        })
      )
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    setLoading(true)
    setChannels([])
    // Trigger a reload by briefly clearing and re-setting the channels
    window.location.reload()
  }

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="h-14 bg-card border-b border-border flex items-center gap-3 px-4"
    >
      <div className="flex items-center gap-2 shrink-0">
        <h1 className="text-xl font-bold tracking-[0.2em] text-primary">Pixora</h1>
        <span className="text-xs text-muted-foreground font-normal tracking-wide">
          LITE
        </span>
      </div>

      <div className="flex-1 max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder="Rechercher une chaîne..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-secondary border-border focus:border-primary transition-colors"
        />
      </div>

      {channels.length > 0 && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-xs text-muted-foreground bg-secondary px-3 py-1.5 rounded-full border border-border shrink-0"
        >
          {channels.length} ch.
        </motion.div>
      )}

      <div className="text-base font-semibold tabular-nums shrink-0 ml-auto">
        {time}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => setAppMode(null)}
        className="gap-2 shrink-0"
      >
        {appMode === 'tv' ? <Tv className="w-4 h-4" /> : <Film className="w-4 h-4" />}
        <span className="hidden sm:inline">/</span>
        {appMode === 'tv' ? <Film className="w-4 h-4" /> : <Tv className="w-4 h-4" />}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => setSettingsOpen(true)}
        className="gap-2 shrink-0"
      >
        <Settings className="w-4 h-4" />
        <span className="hidden sm:inline">Paramètres</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleRefresh}
        className="gap-2 shrink-0"
      >
        <RefreshCw className="w-4 h-4" />
        <span className="hidden sm:inline">Recharger</span>
      </Button>
    </motion.header>
  )
}
