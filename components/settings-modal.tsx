'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Settings, Shield, Tv, Volume2 } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const PRESETS = [
  { url: 'https://iptv-org.github.io/iptv/languages/fra.m3u', label: 'France uniquement', flag: '🇫🇷' },
  { url: 'https://iptv-org.github.io/iptv/index.m3u', label: 'Monde entier', flag: '🌍' },
]

export function SettingsModal() {
  const {
    isSettingsOpen,
    setSettingsOpen,
    m3uUrl,
    setM3uUrl,
    showLogos,
    setShowLogos,
    pageSize,
    setPageSize,
    volume,
    setVolume,
  } = useAppStore()

  const [localM3uUrl, setLocalM3uUrl] = useState(m3uUrl)
  const [localShowLogos, setLocalShowLogos] = useState(showLogos)
  const [localPageSize, setLocalPageSize] = useState(pageSize.toString())
  const [localVolume, setLocalVolume] = useState(volume)

  useEffect(() => {
    if (isSettingsOpen) {
      setLocalM3uUrl(m3uUrl)
      setLocalShowLogos(showLogos)
      setLocalPageSize(pageSize.toString())
      setLocalVolume(volume)
    }
  }, [isSettingsOpen, m3uUrl, showLogos, pageSize, volume])

  const handleSave = () => {
    setM3uUrl(localM3uUrl)
    setShowLogos(localShowLogos)
    setPageSize(parseInt(localPageSize))
    setVolume(localVolume)
    setSettingsOpen(false)
    if (localM3uUrl !== m3uUrl) {
      window.location.reload()
    }
  }

  const handlePreset = (url: string) => {
    setLocalM3uUrl(url)
  }

  return (
    <AnimatePresence>
      {isSettingsOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setSettingsOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card border border-border/50 rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Settings className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-semibold">Parametres</h2>
                <p className="text-xs text-muted-foreground">Configuration de Pixora</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSettingsOpen(false)}
                className="w-8 h-8 rounded-xl"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
              {/* M3U Source */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Tv className="w-4 h-4 text-primary" />
                  <Label className="text-sm font-medium">Source IPTV</Label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.url}
                      onClick={() => handlePreset(preset.url)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all ${
                        localM3uUrl === preset.url
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border/50 bg-secondary/30 hover:bg-secondary/50 text-foreground'
                      }`}
                    >
                      <span className="text-lg">{preset.flag}</span>
                      <span className="text-xs font-medium">{preset.label}</span>
                    </button>
                  ))}
                </div>
                <Input
                  value={localM3uUrl}
                  onChange={(e) => setLocalM3uUrl(e.target.value)}
                  placeholder="URL personnalisee..."
                  className="bg-secondary/30 border-border/50 rounded-xl text-sm"
                />
              </div>

              {/* Show Logos */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Logos</Label>
                    <p className="text-xs text-muted-foreground">
                      Desactiver = plus rapide
                    </p>
                  </div>
                </div>
                <Switch
                  checked={localShowLogos}
                  onCheckedChange={setLocalShowLogos}
                />
              </div>

              {/* Page Size */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50">
                <div>
                  <Label className="text-sm font-medium">Chaines par page</Label>
                  <p className="text-xs text-muted-foreground">
                    Moins = plus fluide
                  </p>
                </div>
                <Select value={localPageSize} onValueChange={setLocalPageSize}>
                  <SelectTrigger className="w-20 h-9 rounded-lg bg-secondary/50 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Volume */}
              <div className="p-3 rounded-xl bg-secondary/30 border border-border/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Volume2 className="w-4 h-4 text-primary" />
                    </div>
                    <Label className="text-sm font-medium">Volume initial</Label>
                  </div>
                  <span className="text-sm text-primary font-semibold tabular-nums bg-primary/10 px-2 py-0.5 rounded-md">
                    {localVolume}%
                  </span>
                </div>
                <Slider
                  value={[localVolume]}
                  onValueChange={([v]) => setLocalVolume(v)}
                  max={100}
                  step={1}
                  className="mt-2"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-5 py-4 border-t border-border/50">
              <Button 
                className="flex-1 rounded-xl bg-primary hover:bg-primary/90" 
                onClick={handleSave}
              >
                Sauvegarder
              </Button>
              <Button
                variant="ghost"
                className="flex-1 rounded-xl"
                onClick={() => setSettingsOpen(false)}
              >
                Annuler
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
