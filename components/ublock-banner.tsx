'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, ShieldCheck, ExternalLink, X, AlertTriangle, Chrome, Globe } from 'lucide-react'

const UBLOCK_LINKS = {
  chrome: 'https://chromewebstore.google.com/detail/ublock-origin/cjpalhdlnbpafiamejdnhcphjbkeiagm',
  firefox: 'https://addons.mozilla.org/fr/firefox/addon/ublock-origin/',
  edge: 'https://microsoftedge.microsoft.com/addons/detail/ublock-origin/odfafepnkmbhccpbejgmiehpchacaeak',
}

function detectBrowser(): 'chrome' | 'firefox' | 'edge' | 'other' {
  if (typeof navigator === 'undefined') return 'other'
  const ua = navigator.userAgent
  if (ua.includes('Edg/')) return 'edge'
  if (ua.includes('Firefox/')) return 'firefox'
  if (ua.includes('Chrome/')) return 'chrome'
  return 'other'
}

async function checkUBlock(): Promise<boolean> {
  // Try to fetch a known ad-server domain — uBlock blocks it, plain fetch succeeds
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 1500)
    const res = await fetch(
      'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
      { signal: controller.signal, mode: 'no-cors', cache: 'no-store' }
    )
    clearTimeout(timeout)
    // If fetch "succeeds" (even opaque), ads are NOT blocked
    void res
    return false
  } catch {
    // Blocked or network error — treat as blocked
    return true
  }
}

const DISMISSED_KEY = 'pixora_ublock_dismissed'

export function UBlockBanner() {
  const [status, setStatus] = useState<'checking' | 'detected' | 'not-detected' | 'dismissed'>('checking')
  const [browser, setBrowser] = useState<'chrome' | 'firefox' | 'edge' | 'other'>('other')

  useEffect(() => {
    // Check if already dismissed this session
    try {
      if (sessionStorage.getItem(DISMISSED_KEY) === '1') {
        setStatus('dismissed')
        return
      }
    } catch {}

    setBrowser(detectBrowser())

    checkUBlock().then((blocked) => {
      setStatus(blocked ? 'detected' : 'not-detected')
    })
  }, [])

  const dismiss = () => {
    try { sessionStorage.setItem(DISMISSED_KEY, '1') } catch {}
    setStatus('dismissed')
  }

  const installUrl =
    browser === 'firefox'
      ? UBLOCK_LINKS.firefox
      : browser === 'edge'
      ? UBLOCK_LINKS.edge
      : UBLOCK_LINKS.chrome

  const browserLabel =
    browser === 'firefox'
      ? 'Firefox'
      : browser === 'edge'
      ? 'Edge'
      : 'Chrome'

  return (
    <AnimatePresence>
      {status === 'not-detected' && (
        <motion.div
          key="ublock-banner"
          initial={{ opacity: 0, y: -80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -80 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="fixed top-0 inset-x-0 z-[200]"
        >
          {/* Backdrop blur bar */}
          <div className="relative bg-card/90 backdrop-blur-xl border-b border-border/60 shadow-2xl">
            {/* Accent line top */}
            <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

            <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
              {/* Icon */}
              <div className="shrink-0 flex items-center justify-center w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30">
                <AlertTriangle className="w-4.5 h-4.5 text-amber-400" />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground leading-tight">
                  Publicités détectées sur ce site
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                  Installez <span className="text-primary font-medium">uBlock Origin</span> pour une expérience sans pubs et protéger votre vie privée.
                </p>
              </div>

              {/* CTA button */}
              <motion.a
                href={installUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors duration-200 shadow-lg shadow-primary/20"
              >
                <Shield className="w-3.5 h-3.5" />
                Installer pour {browserLabel}
                <ExternalLink className="w-3 h-3 opacity-70" />
              </motion.a>

              {/* Dismiss */}
              <button
                onClick={dismiss}
                className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-200"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Warning overlay hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-3 px-3 py-1.5 rounded-lg bg-card/80 backdrop-blur-md border border-border/40 shadow-lg pointer-events-none"
          >
            <p className="text-[10px] text-muted-foreground/70 tracking-wide whitespace-nowrap">
              ⚠️ Sans bloqueur, des publicités peuvent apparaître pendant le streaming
            </p>
          </motion.div>
        </motion.div>
      )}

      {status === 'detected' && (
        <motion.div
          key="ublock-ok"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.4 }}
          className="fixed top-0 inset-x-0 z-[200]"
          onAnimationComplete={() => {
            // Auto-dismiss after 2.5s
            setTimeout(dismiss, 2500)
          }}
        >
          <div className="bg-primary/10 backdrop-blur-xl border-b border-primary/20">
            <div className="max-w-4xl mx-auto px-4 py-2 flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              <p className="text-xs text-primary font-medium">
                uBlock Origin détecté — Vous profitez d'une navigation sans publicités ✓
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
