'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Settings } from 'lucide-react'
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
  { url: 'https://iptv-org.github.io/iptv/languages/fra.m3u', label: '🇫🇷 France uniquement' },
  { url: 'https://iptv-org.github.io/iptv/index.m3u', label: '🌍 Monde entier (lent)' },
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
    // Reload to apply M3U changes
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
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 backdrop-blur-sm"
          onClick={() => setSettingsOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card border border-border rounded-xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
              <Settings className="w-5 h-5 text-primary" />
              <h2 className="flex-1 text-base font-bold tracking-wide">Paramètres</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSettingsOpen(false)}
                className="w-8 h-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
              {/* M3U Source */}
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-semibold">Source M3U</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    URL de la liste IPTV
                  </p>
                </div>
                <div className="space-y-2">
                  {PRESETS.map((preset) => (
                    <Button
                      key={preset.url}
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-2.5"
                      onClick={() => handlePreset(preset.url)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
                <Input
                  value={localM3uUrl}
                  onChange={(e) => setLocalM3uUrl(e.target.value)}
                  placeholder="https://..."
                  className="bg-secondary"
                />
              </div>

              {/* Show Logos */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-semibold">Logos des chaînes</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Désactiver = plus rapide
                  </p>
                </div>
                <Switch
                  checked={localShowLogos}
                  onCheckedChange={setLocalShowLogos}
                />
              </div>

              {/* Page Size */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label className="text-sm font-semibold">Lignes par page</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Moins = plus fluide
                  </p>
                </div>
                <Select value={localPageSize} onValueChange={setLocalPageSize}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Initial Volume */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold">Volume initial</Label>
                  </div>
                  <span className="text-sm text-primary font-semibold tabular-nums">
                    {localVolume}%
                  </span>
                </div>
                <Slider
                  value={[localVolume]}
                  onValueChange={([v]) => setLocalVolume(v)}
                  max={100}
                  step={1}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-5 py-4 border-t border-border">
              <Button className="flex-1" onClick={handleSave}>
                Sauvegarder
              </Button>
              <Button
                variant="outline"
                className="flex-1"
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
