'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Maximize, ArrowLeft, Loader2, Play, Calendar, Star, ChevronLeft, ChevronRight } from 'lucide-react'
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
}

const TMDB_API_KEY = '15d2ea6d0dc1d476efbca3eba2b9bbfb'
const TMDB_BASE = 'https://api.themoviedb.org/3'
const TMDB_IMG = 'https://image.tmdb.org/t/p/w342'

const getEmbedUrl = (id: number, saison: number, episode: number) =>
  `https://frembed.com/api/serie.php?id=${id}&sa=${saison}&epi=${episode}`

export function SeriesMode() {
  const [query, setQuery] = useState('')
  const [series, setSeries] = useState<Serie[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSerie, setSelectedSerie] = useState<{ serie: Serie; saison: number; episode: number } | null>(null)
  const [showPicker, setShowPicker] = useState<Serie | null>(null)
  const [pickerSeasons, setPickerSeasons] = useState<Season[]>([])
  const [pickerSeason, setPickerSeason] = useState(1)
  const [pickerEpisode, setPickerEpisode] = useState(1)
  const [pickerEpCount, setPickerEpCount] = useState(10)
  const [pickerLoading, setPickerLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [iframeLoading, setIframeLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  // ─── Anti-popup (identique à film-mode) ───────────────────────────────────
  useEffect(() => {
    if (!selectedSerie) return
    const originalOpen = window.open
    window.open = () => null
    const handleBlur = () => { window.focus(); setTimeout(() => window.focus(), 0) }
    const handleBeforeUnload = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('blur', handleBlur)
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.open = originalOpen
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [selectedSerie])

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

  // ─── Ouvrir le picker (équivalent de playFilm → showLangChoice) ────────────
  const openPicker = async (serie: Serie) => {
    setPickerSeason(1)
    setPickerEpisode(1)
    setPickerEpCount(10)
    setPickerSeasons([])
    setShowPicker(serie)
    setPickerLoading(true)
    try {
      const res = await fetch(`${TMDB_BASE}/tv/${serie.id}?api_key=${TMDB_API_KEY}&language=fr-FR`)
      const data = await res.json()
      const seasons: Season[] = (data.seasons || [])
        .filter((s: Season) => s.season_number > 0)
      setPickerSeasons(seasons)
      if (seasons.length > 0) setPickerEpCount(seasons[0].episode_count || 10)
    } catch {
      // garde les valeurs par défaut
    } finally {
      setPickerLoading(false)
    }
  }

  const handlePickerSeasonChange = (sn: number) => {
    setPickerSeason(sn)
    setPickerEpisode(1)
    const found = pickerSeasons.find((s) => s.season_number === sn)
    setPickerEpCount(found?.episode_count || 10)
  }

  // ─── Lancer la lecture (équivalent de selectLanguage) ─────────────────────
  const startPlaying = () => {
    if (showPicker) {
      setIframeLoading(true)
      setSelectedSerie({ serie: showPicker, saison: pickerSeason, episode: pickerEpisode })
      setShowPicker(null)
    }
  }

  const closePlayer = () => {
    setSelectedSerie(null)
    setIframeLoading(true)
  }

  const closePicker = () => setShowPicker(null)

  const toggleFullscreen = () => {
    const container = document.getElementById('series-player-container')
    if (container) {
      if (document.fullscreenElement) document.exitFullscreen()
      else container.requestFullscreen()
    }
  }

  // ─── Navigation épisodes depuis le lecteur ─────────────────────────────────
  const goToEpisode = (saison: number, episode: number) => {
    setIframeLoading(true)
    setSelectedSerie((prev) => prev ? { ...prev, saison, episode } : prev)
  }

  const prevEpisode = () => {
    if (!selectedSerie) return
    if (selectedSerie.episode > 1) {
      goToEpisode(selectedSerie.saison, selectedSerie.episode - 1)
    } else {
      const prevS = pickerSeasons.find((s) => s.season_number === selectedSerie.saison - 1)
      if (prevS) goToEpisode(prevS.season_number, prevS.episode_count)
    }
  }

  const nextEpisode = () => {
    if (!selectedSerie) return
    const curSeason = pickerSeasons.find((s) => s.season_number === selectedSerie.saison)
    const epCount = curSeason?.episode_count ?? pickerEpCount
    if (selectedSerie.episode < epCount) {
      goToEpisode(selectedSerie.saison, selectedSerie.episode + 1)
    } else {
      const nextS = pickerSeasons.find((s) => s.season_number === selectedSerie.saison + 1)
      if (nextS) goToEpisode(nextS.season_number, 1)
    }
  }

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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            <AnimatePresence mode="popLayout">
              {series.map((serie, index) => (
                <motion.div
                  key={serie.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.04, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                  onClick={() => openPicker(serie)}
                  className="group bg-card/40 border border-border/30 rounded-2xl overflow-hidden cursor-pointer transition-all duration-400 hover:border-primary/40 hover:bg-card/60 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
                >
                  <div className="aspect-[2/3] bg-secondary/30 overflow-hidden relative">
                    {serie.poster_path ? (
                      <img
                        src={`${TMDB_IMG}${serie.poster_path}`}
                        alt={serie.name}
                        className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-gradient-to-br from-secondary/50 to-secondary/30">
                        <Play className="w-10 h-10 opacity-30" />
                      </div>
                    )}
                    {serie.vote_average > 0 && (
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/70 backdrop-blur-sm">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-medium text-white">{serie.vote_average.toFixed(1)}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-400 flex items-center justify-center">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30"
                      >
                        <Play className="w-6 h-6 text-primary-foreground fill-current ml-1" />
                      </motion.div>
                    </div>
                  </div>
                  <div className="p-3.5">
                    <h3 className="text-sm font-semibold truncate text-foreground group-hover:text-primary transition-colors">
                      {serie.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-2 text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span className="text-xs">
                        {serie.first_air_date ? new Date(serie.first_air_date).getFullYear() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {series.length === 0 && !status && !isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-6 border border-primary/10">
                <Play className="w-10 h-10 text-primary/50" />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-foreground">Rechercher une série</h2>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                Utilisez la barre de recherche pour trouver vos séries préférées
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* ─── Modal picker saison / épisode (équivalent modal langue) ─────────── */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
            onClick={closePicker}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border/50 rounded-3xl p-7 max-w-md w-full shadow-2xl"
            >
              {/* Header série */}
              <div className="flex items-start gap-5 mb-6">
                {showPicker.poster_path && (
                  <img
                    src={`${TMDB_IMG}${showPicker.poster_path}`}
                    alt={showPicker.name}
                    className="w-20 h-28 object-cover rounded-xl shadow-lg"
                  />
                )}
                <div className="flex-1 min-w-0 pt-1">
                  <h3 className="text-xl font-bold truncate text-foreground">{showPicker.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {showPicker.first_air_date ? new Date(showPicker.first_air_date).getFullYear() : 'N/A'}
                  </p>
                  {showPicker.vote_average > 0 && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="text-sm font-medium">{showPicker.vote_average.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                <Button variant="ghost" size="icon" onClick={closePicker} className="shrink-0 rounded-xl h-9 w-9 -mt-1 -mr-1">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Badge serveur */}
              <div className="flex justify-center mb-4">
                <span className="text-xs px-3 py-1.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-400 font-medium">
                  ✓ Frembed — Séries
                </span>
              </div>

              {pickerLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              ) : (
                <>
                  {/* Sélecteur saison */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Saison</p>
                    <div className="flex flex-wrap gap-2">
                      {(pickerSeasons.length > 0
                        ? pickerSeasons
                        : Array.from({ length: 5 }, (_, i) => ({ season_number: i + 1, episode_count: 10 }))
                      ).map((s) => (
                        <button
                          key={s.season_number}
                          onClick={() => handlePickerSeasonChange(s.season_number)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                            pickerSeason === s.season_number
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : 'bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground'
                          }`}
                        >
                          S{s.season_number}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sélecteur épisode */}
                  <div className="mb-6">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Épisode</p>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto scrollbar-thin pr-1">
                      {Array.from({ length: pickerEpCount }, (_, i) => i + 1).map((n) => (
                        <button
                          key={n}
                          onClick={() => setPickerEpisode(n)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                            pickerEpisode === n
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : 'bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground'
                          }`}
                        >
                          E{n}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bouton lecture */}
                  <Button
                    onClick={startPlaying}
                    className="w-full h-14 flex flex-col gap-0.5 rounded-2xl border-border/50 bg-primary hover:bg-primary/90 transition-all"
                  >
                    <span className="font-semibold text-sm">▶ Regarder</span>
                    <span className="text-xs opacity-80">Saison {pickerSeason} — Épisode {pickerEpisode}</span>
                  </Button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Lecteur (structure identique à film-mode) ────────────────────── */}
      <AnimatePresence>
        {selectedSerie && (
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
              className="absolute top-0 right-0 sm:top-0 sm:right-0 z-40 bg-black/60 backdrop-blur-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-white/10"
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
                  className="absolute inset-0 z-20 bg-black flex items-center justify-center"
                >
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <span className="text-sm text-white/50">
                      Chargement S{selectedSerie.saison} E{selectedSerie.episode}…
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Iframe — même config exacte que film-mode */}
            <iframe
              key={`${selectedSerie.serie.id}-s${selectedSerie.saison}-e${selectedSerie.episode}`}
              src={getEmbedUrl(selectedSerie.serie.id, selectedSerie.saison, selectedSerie.episode)}
              className="flex-1 w-full h-full border-none relative z-0"
              allowFullScreen
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope"
              referrerPolicy="no-referrer"
              onLoad={() => setIframeLoading(false)}
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
                <p className="text-xs sm:text-sm font-semibold truncate text-white">{selectedSerie.serie.name}</p>
                <p className="text-[10px] sm:text-xs text-white/50 hidden sm:block">
                  Saison {selectedSerie.saison} — Épisode {selectedSerie.episode}
                </p>
              </div>

              {/* Badge S/E */}
              <span className="text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl font-medium shrink-0 text-violet-400 bg-violet-400/15 border border-violet-400/30">
                S{selectedSerie.saison} E{selectedSerie.episode}
              </span>

              {/* Navigation épisodes */}
              <Button
                variant="ghost"
                size="icon"
                onClick={prevEpisode}
                className="shrink-0 rounded-xl text-white/80 hover:text-white hover:bg-white/10 h-8 w-8 sm:h-10 sm:w-10"
                title="Épisode précédent"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={nextEpisode}
                className="shrink-0 rounded-xl text-white/80 hover:text-white hover:bg-white/10 h-8 w-8 sm:h-10 sm:w-10"
                title="Épisode suivant"
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
