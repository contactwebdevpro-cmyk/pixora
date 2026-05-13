'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tv, Film, Shield, Zap, Play } from 'lucide-react'
import { useAppStore } from '@/lib/store'

export function BootScreen() {
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('Initialisation...')
  const [showModeSelect, setShowModeSelect] = useState(false)
  const { appMode, setAppMode } = useAppStore()

  useEffect(() => {
    const steps = [
      { progress: 25, status: 'Verification securite...', delay: 150 },
      { progress: 50, status: 'Chargement ressources...', delay: 150 },
      { progress: 80, status: 'Preparation interface...', delay: 150 },
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

    timeout = setTimeout(runStep, 400)

    return () => clearTimeout(timeout)
  }, [])

  if (appMode) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-subtle"
      >
        {/* Ambient glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center relative z-10"
        >
          {/* Logo */}
          <div className="relative mb-2">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground">
                Pix
                <span className="text-primary">ora</span>
              </h1>
            </motion.div>
          </div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xs tracking-[0.3em] text-muted-foreground uppercase mb-12"
          >
            Streaming Premium
          </motion.p>

          <AnimatePresence mode="wait">
            {!showModeSelect ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center"
              >
                {/* Progress bar */}
                <div className="w-64 h-0.5 bg-secondary rounded-full overflow-hidden mb-4">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  />
                </div>
                
                {/* Status */}
                <div className="flex items-center gap-2 h-5">
                  <Shield className="w-3 h-3 text-primary/60" />
                  <p className="text-xs text-muted-foreground tracking-wide">
                    {status}
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="mode-select"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center gap-8"
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Zap className="w-3 h-3 text-primary" />
                  <p className="text-xs tracking-[0.2em] uppercase">
                    Choisir un mode
                  </p>
                </div>
                
                <div className="flex gap-4">
                  <ModeCard
                    icon={<Tv className="w-8 h-8" />}
                    label="TV Direct"
                    description="Chaines en direct"
                    onClick={() => setAppMode('tv')}
                    delay={0.1}
                  />
                  <ModeCard
                    icon={<Film className="w-8 h-8" />}
                    label="Films"
                    description="VOD & Series"
                    onClick={() => setAppMode('film')}
                    delay={0.2}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="absolute bottom-6 flex items-center gap-2 text-muted-foreground/50"
        >
          <Shield className="w-3 h-3" />
          <span className="text-xs tracking-wide">Connexion securisee</span>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

interface ModeCardProps {
  icon: React.ReactNode
  label: string
  description: string
  onClick: () => void
  delay: number
}

function ModeCard({ icon, label, description, onClick, delay }: ModeCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative w-44 py-10 bg-card/50 backdrop-blur-sm border border-border rounded-2xl flex flex-col items-center gap-3 transition-all duration-300 hover:border-primary/50 hover:bg-card/80 focus-ring"
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative text-muted-foreground group-hover:text-primary transition-colors duration-300">
        {icon}
      </div>
      
      <div className="relative text-center">
        <span className="block text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-300">
          {label}
        </span>
        <span className="block text-xs text-muted-foreground mt-0.5">
          {description}
        </span>
      </div>
      
      {/* Play indicator */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileHover={{ opacity: 1, scale: 1 }}
        className="absolute bottom-3 right-3"
      >
        <Play className="w-4 h-4 text-primary fill-primary" />
      </motion.div>
    </motion.button>
  )
}
