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
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="h-[72px] glass border-b border-border/30 flex items-center gap-5 px-6"
    >
      {/* Logo */}
      <div className="flex items-center gap-4 shrink-0">
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="text-foreground">Pix</span>
          <span className="text-gradient">ora</span>
        </h1>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
          <Shield className="w-3 h-3 text-primary" />
          <span className="text-[10px] font-semibold text-primary tracking-wider uppercase">
            Secure
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-lg relative ml-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder="Rechercher..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-11 h-11 bg-card/60 border-border/40 rounded-2xl focus:border-primary/50 focus:bg-card transition-all placeholder:text-muted-foreground/50"
        />
      </div>

      {/* Channel count */}
      {channels.length > 0 && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-xs text-muted-foreground bg-card/60 px-4 py-2 rounded-xl border border-border/40 shrink-0"
        >
          <span className="font-semibold text-foreground">{channels.length}</span> chaines
        </motion.div>
      )}

      {/* Time */}
      <div className="text-sm font-medium tabular-nums text-muted-foreground shrink-0 ml-auto bg-card/40 px-4 py-2 rounded-xl border border-border/30">
        {time}
      </div>

      {/* Mode switch */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setAppMode(null)}
        className="gap-2.5 shrink-0 h-10 px-4 rounded-xl hover:bg-card/80 border border-transparent hover:border-border/40"
      >
        {appMode === 'tv' ? (
          <>
            <Tv className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground/60">/</span>
            <Film className="w-4 h-4 text-muted-foreground/50" />
          </>
        ) : (
          <>
            <Film className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground/60">/</span>
            <Tv className="w-4 h-4 text-muted-foreground/50" />
          </>
        )}
      </Button>

      {/* Settings */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setSettingsOpen(true)}
        className="shrink-0 h-10 w-10 rounded-xl hover:bg-card/80 border border-transparent hover:border-border/40"
      >
        <Settings className="w-4 h-4" />
      </Button>

      {/* Refresh */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleRefresh}
        className="shrink-0 h-10 w-10 rounded-xl hover:bg-card/80 border border-transparent hover:border-border/40"
      >
        <RefreshCw className="w-4 h-4" />
      </Button>
    </motion.header>
  )
}
