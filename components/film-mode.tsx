'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Maximize, ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Film {
  id: number
  title: string
  poster_path: string | null
  release_date: string
  overview: string
}

const TMDB_API_KEY = '15d2ea6d0dc1d476efbca3eba2b9bbfb' // Public demo key
const TMDB_BASE = 'https://api.themoviedb.org/3'
const TMDB_IMG = 'https://image.tmdb.org/t/p/w342'

export function FilmMode() {
  const [query, setQuery] = useState('')
  const [films, setFilms] = useState<Film[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null)
  const [showLangChoice, setShowLangChoice] = useState<Film | null>(null)
  const [selectedLang, setSelectedLang] = useState<'fr' | 'en'>('fr')
  const [status, setStatus] = useState('')
  const [adBlockClicks, setAdBlockClicks] = useState(0)
  const [showAdBlocker, setShowAdBlocker] = useState(true)

  const searchFilms = useCallback(async () => {
    if (!query.trim()) return
    
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
    if (e.key === 'Enter') {
      searchFilms()
    }
  }

  const playFilm = (film: Film) => {
    setShowLangChoice(film)
  }

  const selectLanguage = (lang: 'fr' | 'en') => {
    setSelectedLang(lang)
    setSelectedFilm(showLangChoice)
    setShowLangChoice(null)
  }

  const closePlayer = () => {
    setSelectedFilm(null)
  }

  const closeLangChoice = () => {
    setShowLangChoice(null)
  }

  const toggleFullscreen = () => {
    const container = document.getElementById('film-player-container')
    if (container) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        container.requestFullscreen()
      }
    }
  }

  // Embed URLs based on language choice
  const getEmbedUrl = (tmdbId: number, lang: 'fr' | 'en') => {
    if (lang === 'fr') {
      return `https://frembed.bond/embed/movie/${tmdbId}`
    }
    return `https://vidsrc.pro/embed/movie/${tmdbId}`
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 flex flex-col p-4 overflow-hidden"
      >
        {/* Search Bar */}
        <div className="flex gap-3 mb-5">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Rechercher un film..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10 bg-secondary border-border focus:border-primary"
            />
          </div>
          <Button onClick={searchFilms} disabled={isLoading} className="gap-2">
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Chercher
          </Button>
        </div>

        {/* Status Message */}
        {status && (
          <div className="text-center py-8 text-muted-foreground">
            {status}
          </div>
        )}

        {/* Film Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            <AnimatePresence mode="popLayout">
              {films.map((film, index) => (
                <motion.div
                  key={film.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => playFilm(film)}
                  className="bg-card border border-border rounded-xl overflow-hidden cursor-pointer group hover:border-primary transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
                >
                  <div className="aspect-[2/3] bg-secondary overflow-hidden">
                    {film.poster_path ? (
                      <img
                        src={`${TMDB_IMG}${film.poster_path}`}
                        alt={film.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <span className="text-4xl">🎬</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold truncate text-foreground group-hover:text-primary transition-colors">
                      {film.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {film.release_date ? new Date(film.release_date).getFullYear() : 'N/A'}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Initial State */}
        {films.length === 0 && !status && !isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🎬</div>
              <h2 className="text-xl font-semibold mb-2">Rechercher un film</h2>
              <p className="text-muted-foreground text-sm">
                Utilisez la barre de recherche pour trouver des films
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Language Choice Modal */}
      <AnimatePresence>
        {showLangChoice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closeLangChoice}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-6">
                {showLangChoice.poster_path && (
                  <img
                    src={`${TMDB_IMG}${showLangChoice.poster_path}`}
                    alt={showLangChoice.title}
                    className="w-20 h-28 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold truncate">{showLangChoice.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {showLangChoice.release_date ? new Date(showLangChoice.release_date).getFullYear() : 'N/A'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeLangChoice}
                  className="shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <p className="text-sm text-muted-foreground mb-4 text-center">
                Choisissez la langue de lecture
              </p>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => selectLanguage('fr')}
                  className="h-20 flex flex-col gap-2 hover:border-primary hover:bg-primary/10"
                >
                  <span className="text-2xl">🇫🇷</span>
                  <span className="font-semibold">Français (VF)</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => selectLanguage('en')}
                  className="h-20 flex flex-col gap-2 hover:border-blue-400 hover:bg-blue-400/10"
                >
                  <span className="text-2xl">🇬🇧</span>
                  <span className="font-semibold">English (EN)</span>
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Film Player */}
      <AnimatePresence>
        {selectedFilm && (
          <motion.div
            id="film-player-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex flex-col"
          >
            <iframe
              src={getEmbedUrl(selectedFilm.id, selectedLang)}
              className="flex-1 w-full border-none"
              allowFullScreen
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
              referrerPolicy="no-referrer"
            />
            
            <motion.div
              initial={{ y: 80 }}
              animate={{ y: 0 }}
              className="bg-card border-t border-border px-4 py-3 flex items-center gap-4 shrink-0"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={closePlayer}
                className="text-destructive border-destructive/50 hover:bg-destructive/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">
                  {selectedFilm.title}
                </p>
              </div>

              <span className={`text-xs px-2.5 py-1 rounded-full shrink-0 ${
                selectedLang === 'fr' 
                  ? 'text-success bg-success/10 border border-success/30' 
                  : 'text-blue-400 bg-blue-400/10 border border-blue-400/30'
              }`}>
                {selectedLang === 'fr' ? '🇫🇷 VF' : '🇬🇧 EN'}
              </span>

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
    </>
  )
}
