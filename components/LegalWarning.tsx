'use client'

import { useEffect, useState } from 'react'

export default function LegalWarning() {
  const [checked, setChecked] = useState(false)
  const [accepted, setAccepted] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('pixora_legal_accept') === 'true') {
      setAccepted(true)
    }
  }, [])

  const handleAccept = () => {
    if (!checked) return
    localStorage.setItem('pixora_legal_accept', 'true')
    setAccepted(true)
  }

  if (accepted) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-red-500/30 bg-zinc-950 p-8 text-white shadow-2xl">
        <h1 className="mb-5 text-2xl font-black uppercase text-red-500">
          ⚠️ Avertissement légal
        </h1>

        <div className="space-y-4 text-sm leading-7 text-zinc-300">
          <p>
            Cette plateforme agit uniquement comme moteur d’indexation de liens publics.
          </p>

          <p>
            Aucun contenu vidéo ou fichier multimédia n’est hébergé sur nos serveurs.
          </p>

          <p>
            Conformément à la LCEN (art. 6.I.2 et 6.I.7) et à la Directive 2000/31/CE
            (art. 14), le site agit comme intermédiaire technique.
          </p>

          <p>
            L’utilisateur est seul responsable de l’usage qu’il fait du service
            et du respect des lois applicables dans son pays.
          </p>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-xs text-zinc-400">
            Sources : LCEN 2004-575 • Directive 2000/31/CE • CJUE YouTube/Cyando
          </div>
        </div>

        <label className="mt-6 flex items-start gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-sm">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-1 h-4 w-4 accent-red-600"
          />

          <span>
            Je reconnais être responsable de mon utilisation du service.
          </span>
        </label>

        <button
          onClick={handleAccept}
          disabled={!checked}
          className="mt-6 w-full rounded-2xl bg-red-600 px-5 py-4 text-sm font-bold uppercase transition hover:bg-red-700 disabled:opacity-40"
        >
          Accéder au site
        </button>
      </div>
    </div>
  )
}
