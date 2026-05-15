'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tv, Film, Shield, Zap, Play, Clapperboard } from 'lucide-react'
import { useAppStore } from '@/lib/store'

export function BootScreen() {
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('Initialisation...')
  const [showModeSelect, setShowModeSelect] = useState(false)
  const { appMode, setAppMode } = useAppStore()

  useEffect(() => {
    const steps = [
      { progress: 20, status: 'Verification systeme...', delay: 200 },
      { progress: 45, status: 'Chargement securise...', delay: 200 },
      { progress: 70, status: 'Preparation interface...', delay: 200 },
      { progress: 100, status: 'Pret', delay: 300 },
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

    timeout = setTimeout(runStep, 500)

    return () => clearTimeout(timeout)
  }, [])

  if (appMode) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-subtle"
      >
        {/* Ambient glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ duration: 2 }}
            className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/10 rounded-full blur-[120px]" 
          />
        </div>

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex flex-col items-center relative z-10"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="relative mb-3"
          >
            <h1 className="text-6xl md:text-7xl font-bold tracking-tighter">
              <span className="text-foreground">Pix</span>
              <span className="text-gradient">ora</span>
            </h1>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xs tracking-[0.35em] text-muted-foreground uppercase mb-14"
          >
            Streaming Premium
          </motion.p>

          <AnimatePresence mode="wait">
            {!showModeSelect ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center"
              >
                {/* Progress bar */}
                <div className="w-72 h-1 bg-secondary rounded-full overflow-hidden mb-5">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
                
                {/* Status */}
                <div className="flex items-center gap-2.5 h-6">
                  <Shield className="w-3.5 h-3.5 text-primary animate-pulse-soft" />
                  <p className="text-sm text-muted-foreground tracking-wide">
                    {status}
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="mode-select"
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="flex flex-col items-center gap-10"
              >
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  <p className="text-xs tracking-[0.25em] uppercase font-medium">
                    Choisir un mode
                  </p>
                </div>
                
                <div className="flex gap-5 flex-wrap justify-center">
                  <ModeCard
                    icon={<Tv className="w-9 h-9" />}
                    label="TV Direct"
                    description="Chaines en direct"
                    onClick={() => setAppMode('tv')}
                    delay={0.1}
                  />
                  <ModeCard
                    icon={<Film className="w-9 h-9" />}
                    label="Films"
                    description="VOD & Cinéma"
                    onClick={() => setAppMode('film')}
                    delay={0.2}
                  />
                  <ModeCard
                    icon={<Clapperboard className="w-9 h-9" />}
                    label="Séries"
                    description="Episodes & Saisons"
                    onClick={() => setAppMode('series')}
                    delay={0.3}
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
          transition={{ delay: 1 }}
          className="absolute bottom-8 flex items-center gap-2.5 text-muted-foreground/40"
        >
          <Shield className="w-3.5 h-3.5" />
          <span className="text-xs tracking-wider">Connexion securisee</span>
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
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative w-48 py-12 bg-card/60 backdrop-blur-xl border border-border/40 rounded-3xl flex flex-col items-center gap-4 transition-all duration-400 hover:border-primary/50 hover:bg-card focus-ring"
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-3xl bg-primary/8 opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
      
      <div className="relative text-muted-foreground group-hover:text-primary transition-colors duration-400">
        {icon}
      </div>
      
      <div className="relative text-center">
        <span className="block text-base font-semibold text-foreground group-hover:text-primary transition-colors duration-400">
          {label}
        </span>
        <span className="block text-xs text-muted-foreground mt-1">
          {description}
        </span>
      </div>
      
      {/* Play indicator */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileHover={{ opacity: 1, scale: 1 }}
        className="absolute bottom-4 right-4"
      >
        <Play className="w-4 h-4 text-primary fill-primary" />
      </motion.div>
    </motion.button>
  )
}
