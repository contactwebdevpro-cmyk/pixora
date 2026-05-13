'use client'

import { useMemo, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight, Play } from 'lucide-react'
import { useAppStore, Channel } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export function ChannelList() {
  const {
    channels,
    view,
    selectedCategory,
    searchQuery,
    favorites,
    recentChannels,
    toggleFavorite,
    currentChannel,
    setCurrentChannel,
    setPlayerOpen,
    addToRecent,
    showLogos,
    pageSize,
    isLoading,
  } = useAppStore()

  const [page, setPage] = useState(0)

  useEffect(() => {
    setPage(0)
  }, [view, selectedCategory, searchQuery])

  const filteredChannels = useMemo(() => {
    switch (view) {
      case 'favorites':
        return channels.filter((ch) => favorites.includes(ch.id))
      case 'recent':
        return channels.filter((ch) => recentChannels.includes(ch.id))
      case 'category':
        return channels.filter((ch) => ch.group === selectedCategory)
      case 'search':
        const q = searchQuery.toLowerCase()
        return channels.filter(
          (ch) =>
            ch.name.toLowerCase().includes(q) ||
            ch.group.toLowerCase().includes(q)
        )
      default:
        return channels
    }
  }, [channels, view, selectedCategory, searchQuery, favorites, recentChannels])

  const title = useMemo(() => {
    switch (view) {
      case 'favorites':
        return 'Favoris'
      case 'recent':
        return 'Recents'
      case 'category':
        return selectedCategory || 'Categorie'
      case 'search':
        return `"${searchQuery}"`
      default:
        return 'Toutes les chaines'
    }
  }, [view, selectedCategory, searchQuery])

  const totalPages = Math.ceil(filteredChannels.length / pageSize)
  const paginatedChannels = filteredChannels.slice(
    page * pageSize,
    (page + 1) * pageSize
  )

  const handlePlay = useCallback(
    (channel: Channel) => {
      setCurrentChannel(channel)
      setPlayerOpen(true)
      addToRecent(channel.id)
    },
    [setCurrentChannel, setPlayerOpen, addToRecent]
  )

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      className="flex-1 flex flex-col bg-background min-h-0"
    >
      {/* Header */}
      <div className="flex items-center gap-4 px-5 py-4 border-b border-border/50">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <span className="text-xs text-muted-foreground bg-secondary/50 px-2.5 py-1 rounded-lg">
          {filteredChannels.length} chaine{filteredChannels.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Channel Grid */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4">
        <AnimatePresence mode="popLayout">
          {paginatedChannels.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16 text-muted-foreground"
            >
              <div className="text-4xl mb-3">📺</div>
              <p className="text-sm">Aucune chaine trouvee</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
              {paginatedChannels.map((channel, index) => (
                <ChannelCard
                  key={channel.id}
                  channel={channel}
                  index={index}
                  isPlaying={currentChannel?.id === channel.id}
                  isFavorite={favorites.includes(channel.id)}
                  showLogo={showLogos}
                  onPlay={() => handlePlay(channel)}
                  onToggleFavorite={() => toggleFavorite(channel.id)}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 px-5 py-3 border-t border-border/50 bg-card/30">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="h-8 px-3 rounded-lg"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum = i
              if (totalPages > 5) {
                if (page < 3) {
                  pageNum = i
                } else if (page > totalPages - 4) {
                  pageNum = totalPages - 5 + i
                } else {
                  pageNum = page - 2 + i
                }
              }
              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setPage(pageNum)}
                  className={cn(
                    'h-8 w-8 rounded-lg text-xs',
                    page === pageNum && 'bg-primary text-primary-foreground'
                  )}
                >
                  {pageNum + 1}
                </Button>
              )
            })}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="h-8 px-3 rounded-lg"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </motion.main>
  )
}

interface ChannelCardProps {
  channel: Channel
  index: number
  isPlaying: boolean
  isFavorite: boolean
  showLogo: boolean
  onPlay: () => void
  onToggleFavorite: () => void
}

function ChannelCard({
  channel,
  index,
  isPlaying,
  isFavorite,
  showLogo,
  onPlay,
  onToggleFavorite,
}: ChannelCardProps) {
  const [imgError, setImgError] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2, delay: index * 0.02 }}
      onClick={onPlay}
      className={cn(
        'group relative flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all duration-200',
        isPlaying
          ? 'bg-primary/10 border border-primary/30'
          : 'bg-card/50 border border-transparent hover:bg-card hover:border-border/50'
      )}
    >
      {/* Logo */}
      {showLogo && channel.logo && !imgError ? (
        <img
          src={channel.logo}
          alt=""
          className="w-10 h-7 object-contain bg-secondary/50 rounded-lg shrink-0"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-10 h-7 bg-secondary/50 rounded-lg flex items-center justify-center shrink-0">
          <span className="text-xs font-bold text-primary/70">
            {channel.name[0]?.toUpperCase() || '?'}
          </span>
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <span
          className={cn(
            'block text-sm font-medium truncate transition-colors',
            isPlaying ? 'text-primary' : 'text-foreground group-hover:text-primary'
          )}
        >
          {channel.name}
        </span>
        <span className="block text-xs text-muted-foreground truncate mt-0.5">
          {channel.group}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Play indicator */}
        {isPlaying && (
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse mr-1" />
        )}
        
        {/* Favorite */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite()
          }}
          className={cn(
            'p-1.5 rounded-lg transition-colors',
            isFavorite
              ? 'text-amber-500 bg-amber-500/10'
              : 'text-muted-foreground hover:text-amber-500 hover:bg-secondary/50'
          )}
        >
          <Star className={cn('w-4 h-4', isFavorite && 'fill-current')} />
        </motion.button>

        {/* Play button on hover */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileHover={{ opacity: 1, scale: 1 }}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <Play className="w-4 h-4 fill-current" />
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
