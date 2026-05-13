'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Maximize, ArrowLeft, Loader2, Play, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Film {
  id: number
  title: string
  poster_path: string | null
  release_date: string
  overview: string
}

const TMDB_API_KEY = '15d2ea6d0dc1d476efbca3eba2b9bbfb'
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
        setStatus('Aucun film trouve.')
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
        className="flex-1 flex flex-col p-5 overflow-hidden"
      >
        {/* Search */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Rechercher un film..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10 h-11 bg-secondary/50 border-border/50 rounded-xl focus:border-primary/50 focus:bg-secondary/80 transition-all"
            />
          </div>
          <Button 
            onClick={searchFilms} 
            disabled={isLoading} 
            className="h-11 px-5 rounded-xl bg-primary hover:bg-primary/90"
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

        {/* Status */}
        {status && (
          <div className="text-center py-8 text-muted-foreground text-sm">
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
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => playFilm(film)}
                  className="group bg-card/50 border border-border/50 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:border-primary/50 hover:bg-card hover:shadow-lg hover:shadow-primary/5"
                >
                  <div className="aspect-[2/3] bg-secondary/50 overflow-hidden relative">
                    {film.poster_path ? (
                      <img
                        src={`${TMDB_IMG}${film.poster_path}`}
                        alt={film.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <span className="text-4xl">🎬</span>
                      </div>
                    )}
                    
                    {/* Play overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <motion.div
                        initial={{ scale: 0.8 }}
                        whileHover={{ scale: 1.1 }}
                        className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center"
                      >
                        <Play className="w-5 h-5 text-primary-foreground fill-current ml-0.5" />
                      </motion.div>
                    </div>
                  </div>
                  
                  <div className="p-3">
                    <h3 className="text-sm font-medium truncate text-foreground group-hover:text-primary transition-colors">
                      {film.title}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1.5 text-muted-foreground">
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

        {/* Empty State */}
        {films.length === 0 && !status && !isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🎬</span>
              </div>
              <h2 className="text-lg font-semibold mb-1">Rechercher un film</h2>
              <p className="text-muted-foreground text-sm">
                Utilisez la barre de recherche ci-dessus
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Language Modal */}
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
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-6">
                {showLangChoice.poster_path && (
                  <img
                    src={`${TMDB_IMG}${showLangChoice.poster_path}`}
                    alt={showLangChoice.title}
                    className="w-16 h-24 object-cover rounded-xl"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold truncate">{showLangChoice.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {showLangChoice.release_date ? new Date(showLangChoice.release_date).getFullYear() : 'N/A'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeLangChoice}
                  className="shrink-0 rounded-xl"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <p className="text-sm text-muted-foreground mb-4 text-center">
                Choisissez la langue
              </p>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => selectLanguage('fr')}
                  className="h-16 flex flex-col gap-1.5 rounded-xl hover:border-primary hover:bg-primary/10"
                >
                  <span className="text-xl">🇫🇷</span>
                  <span className="font-medium text-sm">Francais (VF)</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => selectLanguage('en')}
                  className="h-16 flex flex-col gap-1.5 rounded-xl hover:border-blue-400 hover:bg-blue-400/10"
                >
                  <span className="text-xl">🇬🇧</span>
                  <span className="font-medium text-sm">English</span>
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Player */}
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
              className="glass border-t border-border/50 px-5 py-3 flex items-center gap-4 shrink-0"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={closePlayer}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {selectedFilm.title}
                </p>
              </div>

              <span className={`text-xs px-2.5 py-1 rounded-lg shrink-0 ${
                selectedLang === 'fr' 
                  ? 'text-success bg-success/10 border border-success/30' 
                  : 'text-blue-400 bg-blue-400/10 border border-blue-400/30'
              }`}>
                {selectedLang === 'fr' ? '🇫🇷 VF' : '🇬🇧 EN'}
              </span>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="shrink-0 rounded-xl"
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
