'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Settings, RefreshCw, Tv, Film, Shield } from 'lucide-react'
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
    window.location.reload()
  }

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="h-16 glass border-b border-border/50 flex items-center gap-4 px-5"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 shrink-0">
        <h1 className="text-xl font-bold tracking-tight">
          Pix<span className="text-primary">ora</span>
        </h1>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
          <Shield className="w-3 h-3 text-primary" />
          <span className="text-[10px] font-medium text-primary tracking-wide">
            SECURE
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder="Rechercher..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-10 bg-secondary/50 border-border/50 rounded-xl focus:border-primary/50 focus:bg-secondary/80 transition-all placeholder:text-muted-foreground/60"
        />
      </div>

      {/* Channel count */}
      {channels.length > 0 && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-xs text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-lg border border-border/50 shrink-0"
        >
          <span className="font-medium text-foreground">{channels.length}</span> chaines
        </motion.div>
      )}

      {/* Time */}
      <div className="text-sm font-medium tabular-nums text-muted-foreground shrink-0 ml-auto bg-secondary/30 px-3 py-1.5 rounded-lg">
        {time}
      </div>

      {/* Mode switch */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setAppMode(null)}
        className="gap-2 shrink-0 h-9 px-3 rounded-xl hover:bg-secondary/80"
      >
        {appMode === 'tv' ? (
          <>
            <Tv className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">/</span>
            <Film className="w-4 h-4 text-muted-foreground" />
          </>
        ) : (
          <>
            <Film className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">/</span>
            <Tv className="w-4 h-4 text-muted-foreground" />
          </>
        )}
      </Button>

      {/* Settings */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setSettingsOpen(true)}
        className="shrink-0 h-9 w-9 rounded-xl hover:bg-secondary/80"
      >
        <Settings className="w-4 h-4" />
      </Button>

      {/* Refresh */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleRefresh}
        className="shrink-0 h-9 w-9 rounded-xl hover:bg-secondary/80"
      >
        <RefreshCw className="w-4 h-4" />
      </Button>
    </motion.header>
  )
}
