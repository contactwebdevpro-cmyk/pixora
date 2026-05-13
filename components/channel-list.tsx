'use client'

import { useMemo, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAppStore, Channel } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

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

  // Reset page when view changes
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
        return 'Récents'
      case 'category':
        return selectedCategory || 'Catégorie'
      case 'search':
        return `Résultats : "${searchQuery}"`
      default:
        return 'Toutes les chaînes'
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
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement des chaînes...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay: 0.2 }}
      className="flex-1 flex flex-col bg-background min-h-0"
    >
      <div className="flex items-center gap-4 px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold">{title}</h2>
        <span className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full border border-border">
          {filteredChannels.length} chaîne{filteredChannels.length !== 1 ? 's' : ''}
        </span>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-2">
          <AnimatePresence mode="popLayout">
            {paginatedChannels.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12 text-muted-foreground"
              >
                Aucune chaîne trouvée.
              </motion.div>
            ) : (
              paginatedChannels.map((channel, index) => (
                <ChannelRow
                  key={channel.id}
                  channel={channel}
                  index={index}
                  isPlaying={currentChannel?.id === channel.id}
                  isFavorite={favorites.includes(channel.id)}
                  showLogo={showLogos}
                  onPlay={() => handlePlay(channel)}
                  onToggleFavorite={() => toggleFavorite(channel.id)}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 px-4 py-3 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Préc.
          </Button>
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
                variant={page === pageNum ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPage(pageNum)}
                className="w-10"
              >
                {pageNum + 1}
              </Button>
            )
          })}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
          >
            Suiv.
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </motion.main>
  )
}

interface ChannelRowProps {
  channel: Channel
  index: number
  isPlaying: boolean
  isFavorite: boolean
  showLogo: boolean
  onPlay: () => void
  onToggleFavorite: () => void
}

function ChannelRow({
  channel,
  index,
  isPlaying,
  isFavorite,
  showLogo,
  onPlay,
  onToggleFavorite,
}: ChannelRowProps) {
  const [imgError, setImgError] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ duration: 0.2, delay: index * 0.02 }}
      onClick={onPlay}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 mb-1',
        isPlaying
          ? 'bg-secondary border border-primary'
          : 'hover:bg-secondary/60'
      )}
    >
      {showLogo && channel.logo && !imgError ? (
        <img
          src={channel.logo}
          alt=""
          className="w-10 h-6 object-contain bg-secondary rounded shrink-0"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-10 h-6 bg-secondary border border-border rounded flex items-center justify-center shrink-0">
          <span className="text-xs font-bold text-primary">
            {channel.name[0]?.toUpperCase() || '?'}
          </span>
        </div>
      )}

      <span
        className={cn(
          'flex-1 text-sm truncate',
          isPlaying ? 'text-primary font-semibold' : 'text-foreground'
        )}
      >
        {channel.name}
      </span>

      <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full truncate max-w-[100px]">
        {channel.group}
      </span>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={(e) => {
          e.stopPropagation()
          onToggleFavorite()
        }}
        className={cn(
          'p-1 rounded transition-colors',
          isFavorite
            ? 'text-destructive'
            : 'text-muted-foreground hover:text-destructive'
        )}
      >
        <Star className={cn('w-4 h-4', isFavorite && 'fill-current')} />
      </motion.button>
    </motion.div>
  )
}
