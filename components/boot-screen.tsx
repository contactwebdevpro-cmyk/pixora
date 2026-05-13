'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tv, Film } from 'lucide-react'
import { useAppStore } from '@/lib/store'

export function BootScreen() {
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('Démarrage...')
  const [showModeSelect, setShowModeSelect] = useState(false)
  const { appMode, setAppMode } = useAppStore()

  useEffect(() => {
    const steps = [
      { progress: 35, status: 'Chargement préférences...', delay: 100 },
      { progress: 75, status: 'Initialisation...', delay: 100 },
      { progress: 100, status: '', delay: 200 },
    ]

    let timeout: NodeJS.Timeout
    let currentStep = 0

    const runStep = () => {
      if (currentStep < steps.length) {
        const step = steps[currentStep]
        setProgress(step.progress)
        setStatus(step.status)
        currentStep++
        timeout = setTimeout(runStep, step.delay)
      } else {
        setShowModeSelect(true)
      }
    }

    timeout = setTimeout(runStep, 300)

    return () => clearTimeout(timeout)
  }, [])

  if (appMode) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex flex-col items-center"
        >
          <h1 className="text-6xl font-extrabold tracking-[0.3em] text-primary mb-2">
            Pixora
          </h1>
          <p className="text-xs tracking-[0.2em] text-muted-foreground mb-10">
            STREAMING FR
          </p>

          <AnimatePresence mode="wait">
            {!showModeSelect ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center"
              >
                <div className="w-52 h-1 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3, ease: 'linear' }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-4 h-5 tracking-wide">
                  {status}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="mode-select"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="flex flex-col items-center gap-6 mt-4"
              >
                <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                  Choisir un mode
                </p>
                <div className="flex gap-5">
                  <motion.button
                    whileHover={{ scale: 1.05, borderColor: 'var(--primary)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setAppMode('tv')}
                    className="w-40 py-8 bg-secondary border border-border rounded-xl flex flex-col items-center gap-3 transition-colors hover:border-primary hover:bg-secondary/80"
                  >
                    <Tv className="w-10 h-10 text-primary" />
                    <span className="text-xs tracking-[0.15em] text-muted-foreground">
                      TV
                    </span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05, borderColor: 'var(--primary)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setAppMode('film')}
                    className="w-40 py-8 bg-secondary border border-border rounded-xl flex flex-col items-center gap-3 transition-colors hover:border-primary hover:bg-secondary/80"
                  >
                    <Film className="w-10 h-10 text-primary" />
                    <span className="text-xs tracking-[0.15em] text-muted-foreground">
                      FILMS
                    </span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
