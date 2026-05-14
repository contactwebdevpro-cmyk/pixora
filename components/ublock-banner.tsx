'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, ExternalLink, AlertTriangle } from 'lucide-react'

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
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 1500)
    const res = await fetch(
      'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
      { signal: controller.signal, mode: 'no-cors', cache: 'no-store' }
    )
    clearTimeout(timeout)
    void res
    return false
  } catch {
    return true
  }
}

const ACCEPTED_KEY = 'pixora_ublock_accepted'

export function UBlockBanner() {
  const [visible, setVisible] = useState(false)
  const [browser, setBrowser] = useState<'chrome' | 'firefox' | 'edge' | 'other'>('other')

  useEffect(() => {
    // Déjà accepté → on n'affiche plus jamais
    try {
      if (localStorage.getItem(ACCEPTED_KEY) === '1') return
    } catch {}

    setBrowser(detectBrowser())

    checkUBlock().then((blocked) => {
      if (!blocked) setVisible(true)
    })
  }, [])

  const accept = () => {
    try { localStorage.setItem(ACCEPTED_KEY, '1') } catch {}
    setVisible(false)
  }

  const installUrl =
    browser === 'firefox' ? UBLOCK_LINKS.firefox :
    browser === 'edge'    ? UBLOCK_LINKS.edge :
                            UBLOCK_LINKS.chrome

  const browserLabel =
    browser === 'firefox' ? 'Firefox' :
    browser === 'edge'    ? 'Edge' :
                            'Chrome'

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="ublock-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative w-full max-w-md bg-card border border-border/60 rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Accent line top */}
            <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

            <div className="p-8 flex flex-col items-center text-center gap-5">
              {/* Icon */}
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30">
                <AlertTriangle className="w-8 h-8 text-amber-400" />
              </div>

              {/* Title */}
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Publicités détectées
                </h2>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  Ce site contient des publicités. Installez{' '}
                  <span className="text-primary font-semibold">uBlock Origin</span>{' '}
                  pour une expérience sans pubs et protéger votre vie privée.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-3 w-full mt-1">
                <motion.a
                  href={installUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={accept}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors duration-200 shadow-lg shadow-primary/20"
                >
                  <Shield className="w-4 h-4" />
                  Installer uBlock Origin pour {browserLabel}
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </motion.a>

                <button
                  onClick={accept}
                  className="w-full py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-200"
                >
                  Continuer sans bloqueur
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
