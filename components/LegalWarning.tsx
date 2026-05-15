'use client'

import { useEffect, useState } from 'react'

export default function LegalWarning() {
  const [accepted, setAccepted] = useState(false)

  useEffect(() => {
    const value = localStorage.getItem('pixora_legal_accept')
    if (value === 'true') {
      setAccepted(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('pixora_legal_accept', 'true')
    setAccepted(true)
  }

  if (accepted) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-6">
      <div className="max-w-2xl rounded-2xl border border-red-500/40 bg-zinc-950 p-8 text-white shadow-2xl">
        <h1 className="mb-4 text-3xl font-bold text-red-500 uppercase tracking-wide">
          Avertissement légal obligatoire
        </h1>

        <div className="space-y-4 text-sm text-zinc-300 leading-6">
          <p>
            Cette plateforme agit uniquement comme un moteur d’indexation automatisé de contenus publiquement disponibles sur Internet.
          </p>

          <p>
            Aucun fichier vidéo, flux multimédia ou contenu protégé n’est hébergé, stocké ou diffusé depuis nos serveurs.
          </p>

          <p className="text-red-400 font-semibold">
            Toute personne utilisant cette plateforme le fait sous sa propre responsabilité.
          </p>

          <p>
            En poursuivant votre navigation, vous reconnaissez que :
          </p>

          <ul className="list-disc pl-5 space-y-2">
            <li>vous êtes seul responsable de l’usage que vous faites du site ;</li>
            <li>vous comprenez les lois applicables dans votre pays ;</li>
            <li>vous renoncez à toute poursuite ou réclamation contre les propriétaires du site ;</li>
            <li>vous acceptez que certains contenus puissent provenir de plateformes tierces indépendantes ;</li>
            <li>vous utilisez ce service à des fins strictement privées et informatives.</li>
          </ul>

          <p className="text-xs text-zinc-500 border-t border-zinc-800 pt-4">
            Si vous n’acceptez pas ces conditions, vous devez quitter immédiatement le site.
          </p>
        </div>

        <label className="mt-6 flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-sm">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 accent-red-600"
            onChange={(e) => setAccepted(e.target.checked)}
          />
          <span>
            Je reconnais avoir lu cet avertissement légal et j’accepte d’assumer l’entière responsabilité de mon utilisation du service.
          </span>
        </label>

        <button
          onClick={handleAccept}
          disabled={!accepted}
          className="mt-5 w-full rounded-xl bg-red-600 px-4 py-3 font-semibold uppercase tracking-wide transition disabled:cursor-not-allowed disabled:opacity-40 hover:bg-red-700"
        >
          Continuer vers le site
        </button>
      </div>
    </div>
  )
}
