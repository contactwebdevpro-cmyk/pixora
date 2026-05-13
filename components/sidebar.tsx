'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Radio, Star, Clock, Folder, ChevronRight } from 'lucide-react'
import { useAppStore, ViewMode } from '@/lib/store'
import { cn } from '@/lib/utils'

const navItems: { id: ViewMode; icon: React.ReactNode; label: string }[] = [
  { id: 'all', icon: <Radio className="w-4 h-4" />, label: 'Toutes' },
  { id: 'favorites', icon: <Star className="w-4 h-4" />, label: 'Favoris' },
  { id: 'recent', icon: <Clock className="w-4 h-4" />, label: 'Recents' },
]

export function Sidebar() {
  const { channels, view, setView, selectedCategory, setSelectedCategory } = useAppStore()

  const categories = useMemo(() => {
    const cats: Record<string, number> = {}
    channels.forEach((ch) => {
      cats[ch.group] = (cats[ch.group] || 0) + 1
    })
    return Object.entries(cats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 40)
  }, [channels])

  return (
    <motion.nav
      initial={{ x: -240, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      className="w-60 bg-sidebar border-r border-border/50 flex flex-col min-h-0"
    >
      <div className="flex-1 min-h-0 overflow-y-auto py-3">
        {/* Navigation */}
        <div className="px-3 mb-2">
          <p className="px-3 py-2 text-[10px] font-semibold tracking-[0.15em] text-muted-foreground/60 uppercase">
            Navigation
          </p>
          <div className="space-y-0.5">
            {navItems.map((item) => (
              <motion.button
                key={item.id}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setView(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200',
                  view === item.id && selectedCategory === null
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                )}
              >
                <span className={cn(
                  'transition-colors',
                  view === item.id && selectedCategory === null ? 'text-primary' : ''
                )}>
                  {item.icon}
                </span>
                <span className="flex-1 text-left font-medium">{item.label}</span>
                {view === item.id && selectedCategory === null && (
                  <ChevronRight className="w-3 h-3 text-primary" />
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="px-3">
          <p className="px-3 py-2 text-[10px] font-semibold tracking-[0.15em] text-muted-foreground/60 uppercase">
            Categories
          </p>
          <div className="space-y-0.5">
            {categories.map(([name, count]) => (
              <motion.button
                key={name}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCategory(name)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-200',
                  view === 'category' && selectedCategory === name
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                )}
              >
                <Folder className={cn(
                  'w-4 h-4 shrink-0 transition-colors',
                  view === 'category' && selectedCategory === name ? 'text-primary' : ''
                )} />
                <span className="flex-1 truncate text-left">{name}</span>
                <span
                  className={cn(
                    'text-[10px] font-medium px-2 py-0.5 rounded-md min-w-[28px] text-center transition-colors',
                    view === 'category' && selectedCategory === name
                      ? 'bg-primary/20 text-primary'
                      : 'bg-secondary/50 text-muted-foreground'
                  )}
                >
                  {count}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </motion.nav>
  )
}
