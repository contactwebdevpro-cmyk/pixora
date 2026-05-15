'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Maximize, ArrowLeft, Loader2, Play, Calendar, Star, ChevronLeft, ChevronRight, Tv2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Serie {
  id: number
  name: string
  poster_path: string | null
  first_air_date: string
  overview: string
  vote_average: number
}

interface Season {
  season_number: number
  episode_count: number
  name: string
}

const TMDB_API_KEY = '15d2ea6d0dc1d476efbca3eba2b9bbfb'
const TMDB_BASE = 'https://api.themoviedb.org/3'
const TMDB_IMG = 'https://image.tmdb.org/t/p/w342'

const getSerieEmbedUrl = (id: number, saison: number, episode: number) =>
  `https://frembed.com/api/serie.php?id=${id}&sa=${saison}&epi=${episode}`

export function SeriesMode() {
  const [query, setQuery] = useState('')
  const [series, setSeries] = useState<Serie[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [status, setStatus] = useState('')

  // Sélection d'une série → choix saison/épisode
  const [selectedSerie, setSelectedSerie] = useState<Serie | null>(null)
  const [seasons, setSeasons] = useState<Season[]>([])
  const [seasonsLoading, setSeasonsLoading] = useState(false)
  const [currentSeason, setCurrentSeason] = useState(1)
  const [currentEpisode, setCurrentEpisode] = useState(1)
  const [episodeCount, setEpisodeCount] = useState(10)

  // Lecteur
  const [isPlaying, setIsPlaying] = useState(false)
  const [iframeLoading, setIframeLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ─── Anti-beforeunload uniquement (sans override window.open) ─────────────
  useEffect(() => {
    if (!isPlaying) return
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isPlaying])

  // ─── Fallback: masquer le loader après 12s si onLoad ne se déclenche pas ──
  useEffect(() => {
    if (!isPlaying) return
    setIframeLoading(true)
    if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current)
    loadingTimerRef.current = setTimeout(() => setIframeLoading(false), 12000)
    return () => {
      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current)
    }
  }, [isPlaying, currentSeason, currentEpisode])

  // ─── Séries populaires ──────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${TMDB_BASE}/tv/popular?api_key=${TMDB_API_KEY}&language=fr-FR&page=1`)
        const data = await res.json()
        if (data.results) setSeries(data.results)
      } catch {
        setStatus('Erreur lors du chargement des séries populaires.')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  // ─── Recherche ──────────────────────────────────────────────────────────────
  const searchSeries = useCallback(async () => {
    if (!query.trim()) {
      setIsLoading(true)
      try {
        const res = await fetch(`${TMDB_BASE}/tv/popular?api_key=${TMDB_API_KEY}&language=fr-FR&page=1`)
        const data = await res.json()
        if (data.results) { setSeries(data.results); setStatus('') }
      } catch {
        setStatus('Erreur lors du chargement.')
      } finally {
        setIsLoading(false)
      }
      return
    }
    setIsLoading(true)
    setStatus('')
    try {
      const res = await fetch(
        `${TMDB_BASE}/search/tv?api_key=${TMDB_API_KEY}&language=fr-FR&query=${encodeURIComponent(query)}&page=1`
      )
      const data = await res.json()
      if (data.results && data.results.length > 0) {
        setSeries(data.results)
      } else {
        setSeries([])
        setStatus('Aucune série trouvée.')
      }
    } catch {
      setStatus('Erreur lors de la recherche.')
    } finally {
      setIsLoading(false)
    }
  }, [query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') searchSeries()
  }

  // ─── Sélection d'une série : charger les saisons ───────────────────────────
  const openSerie = async (serie: Serie) => {
    setSelectedSerie(serie)
    setCurrentSeason(1)
    setCurrentEpisode(1)
    setEpisodeCount(10)
    setSeasonsLoading(true)
    try {
      const res = await fetch(`${TMDB_BASE}/tv/${serie.id}?api_key=${TMDB_API_KEY}&language=fr-FR`)
      const data = await res.json()
      const rawSeasons: Season[] = (data.seasons || []).filter((s: Season) => s.season_number > 0)
      setSeasons(rawSeasons)
      if (rawSeasons.length > 0) {
        setEpisodeCount(rawSeasons[0].episode_count || 10)
      }
    } catch {
      setSeasons([])
    } finally {
      setSeasonsLoading(false)
    }
  }

  const handleSeasonChange = (sn: number) => {
    setCurrentSeason(sn)
    setCurrentEpisode(1)
    const found = seasons.find((s) => s.season_number === sn)
    setEpisodeCount(found?.episode_count || 10)
  }

  const closeSerie = () => {
    setSelectedSerie(null)
    setSeasons([])
    setIsPlaying(false)
    setIframeLoading(true)
  }

  const startPlaying = () => {
    setIsPlaying(true)
  }

  const closePlayer = () => {
    setIsPlaying(false)
  }

  const toggleFullscreen = () => {
    const container = document.getElementById('series-player-container')
    if (container) {
      if (document.fullscreenElement) document.exitFullscreen()
      else container.requestFullscreen()
    }
  }

  // Navigation épisode précédent
  const prevEpisode = () => {
    if (currentEpisode > 1) {
      setCurrentEpisode((e) => e - 1)
    } else {
      const prevSeason = seasons.find((s) => s.season_number === currentSeason - 1)
      if (prevSeason) {
        setCurrentSeason(currentSeason - 1)
        setEpisodeCount(prevSeason.episode_count)
        setCurrentEpisode(prevSeason.episode_count)
      }
    }
  }

  // Navigation épisode suivant
  const nextEpisode = () => {
    if (currentEpisode < episodeCount) {
      setCurrentEpisode((e) => e + 1)
    } else {
      const nextSeason = seasons.find((s) => s.season_number === currentSeason + 1)
      if (nextSeason) {
        setCurrentSeason(currentSeason + 1)
        setEpisodeCount(nextSeason.episode_count)
        setCurrentEpisode(1)
      }
    }
  }

  const canGoPrev = currentSeason > 1 || currentEpisode > 1
  const canGoNext = currentEpisode < episodeCount || !!seasons.find((s) => s.season_number === currentSeason + 1)

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 flex flex-col p-6 overflow-hidden"
      >
        {/* Barre de recherche */}
        <div className="flex gap-3 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Rechercher une série..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-11 h-12 bg-card/60 border-border/40 rounded-2xl focus:border-primary/60 focus:bg-card transition-all text-sm"
            />
          </div>
          <Button
            onClick={searchSeries}
            disabled={isLoading}
            className="h-12 px-6 rounded-2xl bg-primary hover:bg-primary/90 font-medium"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Rechercher
              </>
            )}
          </Button>
        </div>

        {!isLoading && series.length > 0 && (
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-foreground">
              {query.trim() ? `Résultats pour "${query}"` : 'Séries Populaires'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {query.trim() ? `${series.length} séries trouvées` : 'Les séries les plus regardées du moment'}
            </p>
          </div>
        )}

        {status && <div className="text-center py-12 text-muted-foreground text-sm">{status}</div>}

        {/* Grille de séries */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Chargement des séries…</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
              <AnimatePresence mode="popLayout">
                {series.map((serie, index) => (
                  <motion.div
                    key={serie.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.04, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                    onClick={() => openSerie(serie)}
                    className="group bg-card/40 border border-border/30 rounded-2xl overflow-hidden cursor-pointer transition-all duration-400 hover:border-primary/40 hover:bg-card/60 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
                  >
                    <div className="aspect-[2/3] bg-secondary/30 overflow-hidden relative">
                      {serie.poster_path ? (
                        <img
                          src={`${TMDB_IMG}${serie.poster_path}`}
                          alt={serie.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Tv2 className="w-10 h-10 text-muted-foreground/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-end justify-center pb-4">
                        <div className="flex items-center gap-1.5 bg-primary px-4 py-2 rounded-xl">
                          <Play className="w-3.5 h-3.5 fill-white text-white" />
                          <span className="text-xs font-semibold text-white">Regarder</span>
                        </div>
                      </div>
                      {serie.vote_average > 0 && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span className="text-[10px] font-medium text-white">
                            {serie.vote_average.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="text-xs font-semibold truncate text-foreground group-hover:text-primary transition-colors">
                        {serie.name}
                      </h3>
                      {serie.first_air_date && (
                        <div className="flex items-center gap-1 mt-1.5">
                          <Calendar className="w-3 h-3 text-muted-foreground/60" />
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(serie.first_air_date).getFullYear()}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {!isLoading && series.length === 0 && !status && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Tv2 className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  Utilisez la barre de recherche pour trouver vos séries préférées
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* ─── Modal choix saison / épisode ───────────────────────────────────── */}
      <AnimatePresence>
        {selectedSerie && !isPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
            onClick={closeSerie}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border/50 rounded-3xl p-7 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-start gap-5 mb-6">
                {selectedSerie.poster_path && (
                  <img
                    src={`${TMDB_IMG}${selectedSerie.poster_path}`}
                    alt={selectedSerie.name}
                    className="w-20 h-28 object-cover rounded-xl shadow-lg shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0 pt-1">
                  <h3 className="text-xl font-bold truncate text-foreground">{selectedSerie.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedSerie.first_air_date
                      ? new Date(selectedSerie.first_air_date).getFullYear()
                      : 'N/A'}
                  </p>
                  {selectedSerie.vote_average > 0 && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="text-sm font-medium">{selectedSerie.vote_average.toFixed(1)}</span>
                    </div>
                  )}
                  {selectedSerie.overview && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                      {selectedSerie.overview}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeSerie}
                  className="shrink-0 rounded-xl h-9 w-9 -mt-1 -mr-1"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Badge serveur */}
              <div className="flex justify-center mb-5">
                <span className="text-xs px-3 py-1.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-400 font-medium">
                  ✓ Frembed — Séries
                </span>
              </div>

              {seasonsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              ) : (
                <>
                  {/* Sélecteur de saison */}
                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                      Saison
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(seasons.length > 0 ? seasons : Array.from({ length: 5 }, (_, i) => ({ season_number: i + 1, episode_count: 10, name: `Saison ${i + 1}` }))).map((s) => (
                        <button
                          key={s.season_number}
                          onClick={() => handleSeasonChange(s.season_number)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                            currentSeason === s.season_number
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'
                          }`}
                        >
                          S{s.season_number}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sélecteur d'épisode */}
                  <div className="mb-6">
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                      Épisode
                    </label>
                    <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto scrollbar-thin pr-1">
                      {Array.from({ length: episodeCount }, (_, i) => i + 1).map((n) => (
                        <button
                          key={n}
                          onClick={() => setCurrentEpisode(n)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                            currentEpisode === n
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'
                          }`}
                        >
                          E{n}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bouton Lancer */}
                  <Button
                    onClick={startPlaying}
                    className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 font-semibold text-sm gap-2"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Regarder — S{currentSeason} E{currentEpisode}
                  </Button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Lecteur ────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isPlaying && selectedSerie && (
          <motion.div
            id="series-player-container"
            ref={containerRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex flex-col"
          >
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="absolute top-0 right-0 z-40 bg-black/60 backdrop-blur-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-white/10"
            >
              <span className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight">
                <span className="text-white">Pix</span>
                <span className="text-primary">ora</span>
              </span>
            </motion.div>

            {/* Chargement */}
            <AnimatePresence>
              {iframeLoading && (
                <motion.div
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-20 bg-black flex items-center justify-center pointer-events-none"
                >
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <span className="text-sm text-white/50">
                      Chargement S{currentSeason} E{currentEpisode}…
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Iframe — referrerPolicy omis pour laisser le navigateur envoyer le referer par défaut */}
            <iframe
              key={`serie-${selectedSerie.id}-s${currentSeason}-e${currentEpisode}`}
              src={getSerieEmbedUrl(selectedSerie.id, currentSeason, currentEpisode)}
              className="flex-1 w-full h-full border-none relative z-10"
              allowFullScreen
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope; clipboard-write"
              onLoad={() => {
                if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current)
                setIframeLoading(false)
              }}
              style={{ minHeight: '200px' }}
            />

            {/* Barre de contrôle */}
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative z-30 bg-gradient-to-t from-black via-black/95 to-black/80 border-t border-white/5 px-3 sm:px-6 py-3 sm:py-4 flex items-center gap-2 sm:gap-4 shrink-0"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={closePlayer}
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-xl gap-1 sm:gap-2 px-2 sm:px-3 shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Retour</span>
              </Button>

              <div className="h-6 w-px bg-white/10 hidden sm:block shrink-0" />

              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-semibold truncate text-white">{selectedSerie.name}</p>
                <p className="text-[10px] sm:text-xs text-white/50 hidden sm:block">
                  Saison {currentSeason} — Épisode {currentEpisode}
                </p>
              </div>

              {/* Badge S/E */}
              <span className="text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl font-medium shrink-0 text-violet-400 bg-violet-400/15 border border-violet-400/30">
                S{currentSeason} E{currentEpisode}
              </span>

              {/* Navigation épisodes */}
              <Button
                variant="ghost"
                size="icon"
                onClick={prevEpisode}
                disabled={!canGoPrev}
                className="shrink-0 rounded-xl text-white/80 hover:text-white hover:bg-white/10 h-8 w-8 sm:h-10 sm:w-10 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={nextEpisode}
                disabled={!canGoNext}
                className="shrink-0 rounded-xl text-white/80 hover:text-white hover:bg-white/10 h-8 w-8 sm:h-10 sm:w-10 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="shrink-0 rounded-xl text-white/80 hover:text-white hover:bg-white/10 h-8 w-8 sm:h-10 sm:w-10"
              >
                <Maximize className="w-4 h-4" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
