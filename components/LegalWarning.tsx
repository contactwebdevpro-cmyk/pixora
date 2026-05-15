'use client'

import { useEffect, useState } from 'react'

export default function LegalWarning() {
  const [isChecked, setIsChecked] = useState(false)
  const [accepted, setAccepted] = useState(false)

  useEffect(() => {
    const value = localStorage.getItem('pixora_legal_accept')
    if (value === 'true') {
      setAccepted(true)
    }
  }, [])

  const handleAccept = () => {
    if (!isChecked) return

    localStorage.setItem('pixora_legal_accept', 'true')
    setAccepted(true)
  }

  if (accepted) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-4xl rounded-3xl border border-red-500/30 bg-zinc-950 p-8 text-white shadow-2xl">
        <h1 className="mb-6 text-3xl font-black uppercase tracking-wider text-red-500">
          ⚠️ Avertissement légal important
        </h1>

        <div className="space-y-4 text-sm leading-7 text-zinc-300">
          <p>
            Cette plateforme est un moteur d’indexation automatisé permettant uniquement
            l’organisation et l’affichage de liens publiquement accessibles sur Internet.
          </p>

          <p>
            Le site n’héberge, ne stocke, ne retransmet et ne contrôle aucun fichier vidéo,
            flux multimédia ou contenu audiovisuel sur ses propres serveurs.
          </p>

          <p>
            Conformément à l’article 6.I.2 de la Loi n°2004-575 du 21 juin 2004 pour la
            confiance dans l’économie numérique (LCEN), l’éditeur agit exclusivement en
            qualité d’intermédiaire technique.
          </p>

          <p>
            En application de l’article 6.I.7 LCEN et de l’article 14 de la Directive
            2000/31/CE sur le commerce électronique, la responsabilité d’un prestataire
            technique ne peut être engagée concernant des contenus tiers tant qu’il n’a
            pas effectivement connaissance de leur caractère manifestement illicite.
          </p>

          <p>
            L’utilisateur reconnaît accéder aux contenus externes sous sa seule responsabilité.
          </p>

          <p>
            Toute utilisation contraire au droit d’auteur, aux droits voisins ou aux
            législations locales applicables relève exclusivement de la responsabilité
            individuelle de l’utilisateur final.
          </p>

          <p>
            Le site ne revendique aucun droit de propriété sur les contenus accessibles
            via des services tiers.
          </p>

          <p>
            Toute demande de retrait peut être adressée aux hébergeurs, CDN, fournisseurs
            de flux ou plateformes d’origine concernés.
          </p>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
            <h2 className="mb-4 text-base font-bold uppercase tracking-wide text-red-400">
              Case obligatoire
            </h2>

            <ul className="list-disc space-y-2 pl-5 text-sm">
              <li>les contenus proviennent exclusivement de services tiers externes ;</li>
              <li>le site agit uniquement comme interface technique ;</li>
              <li>je suis seul responsable de l’usage que je fais du service ;</li>
              <li>l’accès à certains contenus peut être interdit selon mon pays ;</li>
              <li>
                toute violation du droit d’auteur engage exclusivement ma responsabilité
                personnelle.
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-yellow-700/40 bg-yellow-950/20 p-5 text-xs leading-6 text-zinc-400">
            <p className="mb-3 font-semibold uppercase tracking-wide text-yellow-400">
              Sources juridiques
            </p>

            <ul className="space-y-2">
              <li>• Loi n°2004-575 du 21 juin 2004 (LCEN) — article 6.I.2 et 6.I.7</li>
              <li>• Directive 2000/31/CE du Parlement européen — article 14</li>
              <li>• CJUE, Google France SARL c/ Louis Vuitton, C‑236/08 à C‑238/08</li>
              <li>• CJUE, YouTube et Cyando, C‑682/18 et C‑683/18</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-red-900/40 bg-red-950/20 p-5 text-xs leading-6 text-red-200">
            <p className="mb-3 font-semibold uppercase tracking-wide text-red-400">
              Important
            </p>

            <p className="mb-3">
              Même avec ces mentions, cela ne garantit pas une immunité juridique totale.
            </p>

            <ul className="list-disc space-y-2 pl-5">
              <li>référence volontairement du contenu manifestement illicite ;</li>
              <li>organise le piratage ;</li>
              <li>contourne des protections ;</li>
              <li>ou tire profit d’activités illégales.</li>
            </ul>

            <p className="mt-3">
              La responsabilité civile ou pénale peut malgré tout être recherchée
              selon la juridiction applicable.
            </p>
          </div>
        </div>

        <label className="mt-6 flex items-start gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 text-sm">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => setIsChecked(e.target.checked)}
            className="mt-1 h-4 w-4 accent-red-600"
          />

          <span className="leading-6 text-zinc-300">
            Je reconnais avoir lu cet avertissement légal et j’accepte d’assumer
            l’entière responsabilité de mon utilisation du service.
          </span>
        </label>

        <button
          onClick={handleAccept}
          disabled={!isChecked}
          className="mt-6 w-full rounded-2xl bg-red-600 px-5 py-4 text-sm font-bold uppercase tracking-widest transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Accéder au site
        </button>
      </div>
    </div>
  )
}
