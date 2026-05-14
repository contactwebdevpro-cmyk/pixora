'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tv, Film, Shield, Zap, Play, AlertTriangle, ExternalLink, CheckCircle2 } from 'lucide-react'
import { useAppStore } from '@/lib/store'

type ScreenStep = 'loading' | 'ublock' | 'mode-select'

export function BootScreen() {
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('Initialisation...')
  const [step, setStep] = useState<ScreenStep>('loading')
  const [confirmed, setConfirmed] = useState(false)
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
        const s = steps[currentStep]
        setProgress(s.progress)
        setStatus(s.status)
        currentStep++
        timeout = setTimeout(runStep, s.delay)
      } else {
        setStep('ublock')
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

            {/* ── ÉTAPE 1 : Chargement ── */}
            {step === 'loading' && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center"
              >
                <div className="w-72 h-1 bg-secondary rounded-full overflow-hidden mb-5">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
                <div className="flex items-center gap-2.5 h-6">
                  <Shield className="w-3.5 h-3.5 text-primary animate-pulse-soft" />
                  <p className="text-sm text-muted-foreground tracking-wide">{status}</p>
                </div>
              </motion.div>
            )}

            {/* ── ÉTAPE 2 : Avertissement uBlock Origin ── */}
            {step === 'ublock' && (
              <motion.div
                key="ublock"
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="flex flex-col items-center gap-6 max-w-md px-4"
              >
                {/* Icône alerte */}
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                  className="flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30"
                >
                  <AlertTriangle className="w-8 h-8 text-amber-400" />
                </motion.div>

                {/* Titre */}
                <div className="text-center">
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    Bloqueur de publicités requis
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Le contenu diffusé sur Pixora provient de sources tierces qui
                    peuvent afficher des{' '}
                    <span className="text-amber-400 font-medium">publicités pop-up</span>.{' '}
                    L'extension{' '}
                    <span className="text-primary font-semibold">uBlock Origin</span> est
                    indispensable pour une expérience sans interruption.
                  </p>
                </div>

                {/* Bouton d'installation */}
                <a
                  href="https://ublockorigin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 w-full px-5 py-4 bg-primary/10 hover:bg-primary/20 border border-primary/30 hover:border-primary/60 rounded-2xl transition-all duration-300"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/20">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="block text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      Installer uBlock Origin
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      Gratuit · Chrome, Firefox, Edge
                    </span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </a>

                {/* Checkbox confirmation */}
                <button
                  onClick={() => setConfirmed((v) => !v)}
                  className="flex items-center gap-3 text-left group"
                >
                  <div
                    className={`flex-shrink-0 w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center ${
                      confirmed
                        ? 'bg-primary border-primary'
                        : 'border-border/60 group-hover:border-primary/60'
                    }`}
                  >
                    {confirmed && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary-foreground fill-primary-foreground" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    J'ai installé uBlock Origin et je comprends que sans ce bloqueur,
                    des publicités pop-up peuvent apparaître pendant la lecture.
                  </span>
                </button>

                {/* Bouton Continuer */}
                <motion.button
                  whileHover={confirmed ? { scale: 1.02 } : {}}
                  whileTap={confirmed ? { scale: 0.98 } : {}}
                  onClick={() => confirmed && setStep('mode-select')}
                  className={`w-full py-3.5 rounded-2xl font-semibold text-sm tracking-wide transition-all duration-300 ${
                    confirmed
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-lg shadow-primary/25'
                      : 'bg-secondary/50 text-muted-foreground cursor-not-allowed'
                  }`}
                >
                  {confirmed ? 'Accéder à Pixora →' : 'Cochez la case pour continuer'}
                </motion.button>

                {/* Note */}
                <p className="text-xs text-muted-foreground/50 text-center">
                  Pixora n'affiche pas lui-même de publicités — elles proviennent uniquement des lecteurs vidéo tiers.
                </p>
              </motion.div>
            )}

            {/* ── ÉTAPE 3 : Sélection du mode ── */}
            {step === 'mode-select' && (
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

                <div className="flex gap-5">
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
