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

  const currentIndex = channels.findIndex((ch) => ch.id === currentChannel?.id)

  const playStream = useCallback((url: string) => {
    const video = videoRef.current
    if (!video) return

    setIsLoading(true)
    setError(null)

    // Cleanup previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }

    // Check if it's an HLS stream
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
        // Native HLS support (Safari)
        video.src = url
        video.addEventListener('loadedmetadata', () => {
          video.play().catch(() => {})
          setIsLoading(false)
        })
      }
    } else {
      // Direct video URL
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
          {/* Video Container */}
          <div className="flex-1 relative">
            <video
              ref={videoRef}
              className="w-full h-full object-contain bg-black"
              autoPlay
              playsInline
            />

            {/* Loading Spinner */}
            <AnimatePresence>
              {isLoading && !error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error State */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="bg-card border border-border rounded-xl p-8 text-center max-w-sm">
                    <div className="text-4xl mb-4">📡</div>
                    <h3 className="text-foreground font-semibold mb-2">
                      {error}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-6">
                      La source ne répond pas
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button variant="outline" size="sm" onClick={retry}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Réessayer
                      </Button>
                      <Button variant="outline" size="sm" onClick={nextChannel}>
                        <SkipForward className="w-4 h-4 mr-2" />
                        Suivant
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClose}
                        className="text-destructive border-destructive/50 hover:bg-destructive/10"
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

          {/* Controls Bar */}
          <motion.div
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border-t border-border px-4 py-3 flex items-center gap-4 shrink-0"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={handleClose}
              className="text-destructive border-destructive/50 hover:bg-destructive/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-foreground">
                {currentChannel?.name || '—'}
              </p>
              <p className="text-xs text-muted-foreground">
                {currentChannel?.group}
              </p>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={togglePlayPause}
              className="shrink-0"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={prevChannel}
              disabled={currentIndex <= 0}
              className="shrink-0"
            >
              <SkipBack className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={nextChannel}
              disabled={currentIndex >= channels.length - 1}
              className="shrink-0"
            >
              <SkipForward className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => currentChannel && toggleFavorite(currentChannel.id)}
              className={cn('shrink-0', isFavorite && 'text-destructive border-destructive/50')}
            >
              <Star className={cn('w-4 h-4', isFavorite && 'fill-current')} />
            </Button>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMuted(!isMuted)}
                className="w-8 h-8"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </Button>
              <span className="text-xs text-muted-foreground w-8 text-right tabular-nums">
                {volume}
              </span>
              <Slider
                value={[volume]}
                onValueChange={([v]) => setVolume(v)}
                max={100}
                step={1}
                className="w-24"
              />
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={toggleFullscreen}
              className="shrink-0"
            >
              <Maximize className="w-4 h-4" />
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
