'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Radio, Star, Clock, Folder } from 'lucide-react'
import { useAppStore, ViewMode } from '@/lib/store'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'

const navItems: { id: ViewMode; icon: React.ReactNode; label: string }[] = [
  { id: 'all', icon: <Radio className="w-4 h-4" />, label: 'Toutes les chaînes' },
  { id: 'favorites', icon: <Star className="w-4 h-4" />, label: 'Favoris' },
  { id: 'recent', icon: <Clock className="w-4 h-4" />, label: 'Récents' },
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
      initial={{ x: -220, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
      className="w-56 bg-card border-r border-border flex flex-col"
    >
      <ScrollArea className="flex-1">
        <div className="p-2">
          <p className="px-3 py-2 text-[10px] font-medium tracking-[0.15em] text-muted-foreground uppercase">
            Navigation
          </p>
          {navItems.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setView(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                view === item.id && selectedCategory === null
                  ? 'bg-secondary text-primary border-l-2 border-primary pl-[10px]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              )}
            >
              {item.icon}
              {item.label}
            </motion.button>
          ))}

          <p className="px-3 py-2 mt-4 text-[10px] font-medium tracking-[0.15em] text-muted-foreground uppercase">
            Catégories
          </p>
          {categories.map(([name, count]) => (
            <motion.button
              key={name}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedCategory(name)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                view === 'category' && selectedCategory === name
                  ? 'bg-secondary text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              )}
            >
              <Folder className="w-4 h-4 shrink-0" />
              <span className="flex-1 truncate text-left">{name}</span>
              <span
                className={cn(
                  'text-[10px] px-2 py-0.5 rounded-full bg-secondary border border-border min-w-[28px] text-center',
                  view === 'category' && selectedCategory === name
                    ? 'text-primary border-primary/30'
                    : 'text-muted-foreground'
                )}
              >
                {count}
              </span>
            </motion.button>
          ))}
        </div>
      </ScrollArea>
    </motion.nav>
  )
}
