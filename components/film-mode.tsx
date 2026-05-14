'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Maximize, ArrowLeft, Loader2, Play, Calendar, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Film {
  id: number
  title: string
  poster_path: string | null
  release_date: string
  overview: string
  vote_average: number
}

const TMDB_API_KEY = '15d2ea6d0dc1d476efbca3eba2b9bbfb'
const TMDB_BASE = 'https://api.themoviedb.org/3'
const TMDB_IMG = 'https://image.tmdb.org/t/p/w342'

// Frembed 2 — hébergé sur Uqload (sans publicité intrusive)
const getEmbedUrl = (id: number, lang: 'fr' | 'en') =>
  lang === 'fr'
    ? `https://frembed.one/api/film.php?id=${id}`
    : `https://frembed.one/api/film.php?id=${id}&lang=en`

export function FilmMode() {
  const [query, setQuery] = useState('')
  const [films, setFilms] = useState<Film[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedFilm, setSelectedFilm] = useState<{ film: Film; lang: 'fr' | 'en' } | null>(null)
  const [showLangChoice, setShowLangChoice] = useState<Film | null>(null)
  const [status, setStatus] = useState('')
  const [iframeLoading, setIframeLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  // ─── Anti-popup ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedFilm) return
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
  }, [selectedFilm])

  // ─── Films populaires ───────────────────────────────────────────────────────
  useEffect(() => {
    const loadPopularFilms = async () => {
      try {
        const res = await fetch(`${TMDB_BASE}/movie/popular?api_key=${TMDB_API_KEY}&language=fr-FR&page=1`)
        const data = await res.json()
        if (data.results) setFilms(data.results)
      } catch {
        setStatus('Erreur lors du chargement des films populaires.')
      } finally {
        setIsLoading(false)
      }
    }
    loadPopularFilms()
  }, [])

  // ─── Recherche ──────────────────────────────────────────────────────────────
  const searchFilms = useCallback(async () => {
    if (!query.trim()) {
      setIsLoading(true)
      try {
        const res = await fetch(`${TMDB_BASE}/movie/popular?api_key=${TMDB_API_KEY}&language=fr-FR&page=1`)
        const data = await res.json()
        if (data.results) { setFilms(data.results); setStatus('') }
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
        `${TMDB_BASE}/search/movie?api_key=${TMDB_API_KEY}&language=fr-FR&query=${encodeURIComponent(query)}&page=1`
      )
      const data = await res.json()
      if (data.results && data.results.length > 0) {
        setFilms(data.results)
      } else {
        setFilms([])
        setStatus('Aucun film trouvé.')
      }
    } catch {
      setStatus('Erreur lors de la recherche.')
    } finally {
      setIsLoading(false)
    }
  }, [query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') searchFilms()
  }

  const playFilm = (film: Film) => setShowLangChoice(film)

  const selectLanguage = (lang: 'fr' | 'en') => {
    if (showLangChoice) {
      setIframeLoading(true)
      setSelectedFilm({ film: showLangChoice, lang })
      setShowLangChoice(null)
    }
  }

  const closePlayer = () => {
    setSelectedFilm(null)
    setIframeLoading(true)
  }

  const closeLangChoice = () => setShowLangChoice(null)

  const toggleFullscreen = () => {
    const container = document.getElementById('film-player-container')
    if (container) {
      if (document.fullscreenElement) document.exitFullscreen()
      else container.requestFullscreen()
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
              placeholder="Rechercher un film..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-11 h-12 bg-card/60 border-border/40 rounded-2xl focus:border-primary/60 focus:bg-card transition-all text-sm"
            />
          </div>
          <Button
            onClick={searchFilms}
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

        {!isLoading && films.length > 0 && (
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-foreground">
              {query.trim() ? `Résultats pour "${query}"` : 'Films Populaires'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {query.trim() ? `${films.length} films trouvés` : 'Les films les plus regardés du moment'}
            </p>
          </div>
        )}

        {status && <div className="text-center py-12 text-muted-foreground text-sm">{status}</div>}

        {/* Grille de films */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            <AnimatePresence mode="popLayout">
              {films.map((film, index) => (
                <motion.div
                  key={film.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.04, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                  onClick={() => playFilm(film)}
                  className="group bg-card/40 border border-border/30 rounded-2xl overflow-hidden cursor-pointer transition-all duration-400 hover:border-primary/40 hover:bg-card/60 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
                >
                  <div className="aspect-[2/3] bg-secondary/30 overflow-hidden relative">
                    {film.poster_path ? (
                      <img
                        src={`${TMDB_IMG}${film.poster_path}`}
                        alt={film.title}
                        className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-gradient-to-br from-secondary/50 to-secondary/30">
                        <Play className="w-10 h-10 opacity-30" />
                      </div>
                    )}
                    {film.vote_average > 0 && (
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/70 backdrop-blur-sm">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-medium text-white">{film.vote_average.toFixed(1)}</span>
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
                      {film.title}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-2 text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span className="text-xs">
                        {film.release_date ? new Date(film.release_date).getFullYear() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {films.length === 0 && !status && !isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-6 border border-primary/10">
                <Play className="w-10 h-10 text-primary/50" />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-foreground">Rechercher un film</h2>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                Utilisez la barre de recherche pour trouver vos films préférés
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Modal choix de langue */}
      <AnimatePresence>
        {showLangChoice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
            onClick={closeLangChoice}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border/50 rounded-3xl p-7 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-start gap-5 mb-6">
                {showLangChoice.poster_path && (
                  <img
                    src={`${TMDB_IMG}${showLangChoice.poster_path}`}
                    alt={showLangChoice.title}
                    className="w-20 h-28 object-cover rounded-xl shadow-lg"
                  />
                )}
                <div className="flex-1 min-w-0 pt-1">
                  <h3 className="text-xl font-bold truncate text-foreground">{showLangChoice.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {showLangChoice.release_date ? new Date(showLangChoice.release_date).getFullYear() : 'N/A'}
                  </p>
                  {showLangChoice.vote_average > 0 && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="text-sm font-medium">{showLangChoice.vote_average.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                <Button variant="ghost" size="icon" onClick={closeLangChoice} className="shrink-0 rounded-xl h-9 w-9 -mt-1 -mr-1">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Badge serveur */}
              <div className="flex justify-center mb-5">
                <span className="text-xs px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-medium">
                  ✓ Frembed 2 — Uqload
                </span>
              </div>

              <p className="text-sm text-muted-foreground text-center mb-5">Choisissez la langue de lecture</p>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={() => selectLanguage('fr')}
                  className="h-20 flex flex-col gap-2 rounded-2xl border-border/50 hover:border-primary hover:bg-primary/10 transition-all"
                >
                  <span className="text-2xl">FR</span>
                  <span className="font-medium text-sm">Français (VF)</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => selectLanguage('en')}
                  className="h-20 flex flex-col gap-2 rounded-2xl border-border/50 hover:border-blue-500 hover:bg-blue-500/10 transition-all"
                >
                  <span className="text-2xl">EN</span>
                  <span className="font-medium text-sm">English (VO)</span>
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lecteur */}
      <AnimatePresence>
        {selectedFilm && (
          <motion.div
            id="film-player-container"
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
              className="absolute top-2 right-2 sm:top-3 sm:right-3 z-40 bg-black/60 backdrop-blur-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-white/10"
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
                    <span className="text-sm text-white/50">Chargement via Frembed 2 — Uqload…</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Iframe */}
            <iframe
              key={selectedFilm.film.id}
              src={getEmbedUrl(selectedFilm.film.id, selectedFilm.lang)}
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
                <p className="text-xs sm:text-sm font-semibold truncate text-white">{selectedFilm.film.title}</p>
                <p className="text-[10px] sm:text-xs text-white/50 hidden sm:block">
                  {selectedFilm.film.release_date ? new Date(selectedFilm.film.release_date).getFullYear() : ''}
                </p>
              </div>

              {/* Langue */}
              <span className={`text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl font-medium shrink-0 ${
                selectedFilm.lang === 'fr'
                  ? 'text-emerald-400 bg-emerald-400/15 border border-emerald-400/30'
                  : 'text-blue-400 bg-blue-400/15 border border-blue-400/30'
              }`}>
                {selectedFilm.lang === 'fr' ? 'VF' : 'VO'}
              </span>

              {/* Badge serveur fixe */}
              <span className="text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl font-medium shrink-0 text-emerald-400 bg-emerald-400/15 border border-emerald-400/30">
                ✓ Uqload
              </span>

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
