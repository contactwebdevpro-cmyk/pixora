'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Hls from 'hls.js'
import {
  ArrowLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Star,
  Volume2,
  VolumeX,
  Maximize,
  RefreshCw,
  X,
  Loader2,
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

export function VideoPlayer() {
  const {
    isPlayerOpen,
    setPlayerOpen,
    currentChannel,
    setCurrentChannel,
    channels,
    favorites,
    toggleFavorite,
    volume,
    setVolume,
  } = useAppStore()

  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [showControls, setShowControls] = useState(true)

  const currentIndex = channels.findIndex((ch) => ch.id === currentChannel?.id)

  const playStream = useCallback((url: string) => {
    const video = videoRef.current
    if (!video) return

    setIsLoading(true)
    setError(null)

    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }

    if (url.includes('.m3u8') || url.includes('m3u')) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
        })
        hlsRef.current = hls

        hls.loadSource(url)
        hls.attachMedia(video)

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {})
          setIsLoading(false)
        })

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            setError('Flux indisponible')
            setIsLoading(false)
          }
        })
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url
        video.addEventListener('loadedmetadata', () => {
          video.play().catch(() => {})
          setIsLoading(false)
        })
      }
    } else {
      video.src = url
      video.play().catch(() => {
        setError('Flux indisponible')
        setIsLoading(false)
      })
    }
  }, [])

  useEffect(() => {
    if (currentChannel && isPlayerOpen) {
      playStream(currentChannel.url)
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [currentChannel, isPlayerOpen, playStream])

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.volume = volume / 100
    }
  }, [volume])

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.muted = isMuted
    }
  }, [isMuted])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleCanPlay = () => setIsLoading(false)
    const handleWaiting = () => setIsLoading(true)
    const handleError = () => {
      setError('Flux indisponible')
      setIsLoading(false)
    }

    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('waiting', handleWaiting)
    video.addEventListener('error', handleError)

    return () => {
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('waiting', handleWaiting)
      video.removeEventListener('error', handleError)
    }
  }, [])

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout
    const handleMouseMove = () => {
      setShowControls(true)
      clearTimeout(timeout)
      timeout = setTimeout(() => setShowControls(false), 3000)
    }

    if (isPlayerOpen) {
      window.addEventListener('mousemove', handleMouseMove)
      handleMouseMove()
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      clearTimeout(timeout)
    }
  }, [isPlayerOpen])

  const togglePlayPause = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play()
    } else {
      video.pause()
    }
  }

  const prevChannel = () => {
    if (currentIndex > 0) {
      setCurrentChannel(channels[currentIndex - 1])
    }
  }

  const nextChannel = () => {
    if (currentIndex < channels.length - 1) {
      setCurrentChannel(channels[currentIndex + 1])
    }
  }

  const retry = () => {
    if (currentChannel) {
      playStream(currentChannel.url)
    }
  }

  const toggleFullscreen = () => {
    const container = document.getElementById('player-container')
    if (container) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        container.requestFullscreen()
      }
    }
  }

  const handleClose = () => {
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }
    const video = videoRef.current
    if (video) {
      video.pause()
      video.src = ''
    }
    setPlayerOpen(false)
    setCurrentChannel(null)
  }

  const isFavorite = currentChannel ? favorites.includes(currentChannel.id) : false

  return (
    <AnimatePresence>
      {isPlayerOpen && (
        <motion.div
          id="player-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 bg-black flex flex-col"
        >
          {/* Video */}
          <div className="flex-1 relative" onClick={togglePlayPause}>
            <video
              ref={videoRef}
              className="w-full h-full object-contain bg-black"
              autoPlay
              playsInline
            />

            {/* Loading */}
            <AnimatePresence>
              {isLoading && !error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <span className="text-sm text-muted-foreground">Chargement...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute inset-0 flex items-center justify-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="bg-card border border-border rounded-2xl p-8 text-center max-w-sm">
                    <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">📡</span>
                    </div>
                    <h3 className="text-foreground font-semibold mb-2">
                      {error}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-6">
                      La source ne repond pas
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button variant="outline" size="sm" onClick={retry} className="rounded-xl">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Reessayer
                      </Button>
                      <Button variant="outline" size="sm" onClick={nextChannel} className="rounded-xl">
                        <SkipForward className="w-4 h-4 mr-2" />
                        Suivant
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClose}
                        className="text-destructive border-destructive/30 hover:bg-destructive/10 rounded-xl"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Fermer
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Controls */}
          <motion.div
            initial={{ y: 80 }}
            animate={{ y: showControls || error ? 0 : 80 }}
            transition={{ duration: 0.3 }}
            className="glass border-t border-border/50 px-5 py-3 flex items-center gap-4 shrink-0"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-foreground">
                {currentChannel?.name || '—'}
              </p>
              <p className="text-xs text-muted-foreground">
                {currentChannel?.group}
              </p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlayPause}
              className="shrink-0 rounded-xl h-9 w-9"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={prevChannel}
              disabled={currentIndex <= 0}
              className="shrink-0 rounded-xl h-9 w-9"
            >
              <SkipBack className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={nextChannel}
              disabled={currentIndex >= channels.length - 1}
              className="shrink-0 rounded-xl h-9 w-9"
            >
              <SkipForward className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => currentChannel && toggleFavorite(currentChannel.id)}
              className={cn('shrink-0 rounded-xl h-9 w-9', isFavorite && 'text-amber-500')}
            >
              <Star className={cn('w-4 h-4', isFavorite && 'fill-current')} />
            </Button>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMuted(!isMuted)}
                className="w-8 h-8 rounded-xl"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </Button>
              <Slider
                value={[volume]}
                onValueChange={([v]) => setVolume(v)}
                max={100}
                step={1}
                className="w-20"
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="shrink-0 rounded-xl h-9 w-9"
            >
              <Maximize className="w-4 h-4" />
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
