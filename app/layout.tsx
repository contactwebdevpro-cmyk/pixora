import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'

import './globals.css'
import LegalWarning from '@/components/LegalWarning'

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

const siteUrl = 'https://pixora.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Pixora - Streaming TV et Films Gratuit en Français',
    template: '%s | Pixora',
  },
  description:
    'Regardez vos chaînes TV préférées et des milliers de films en streaming gratuit. Interface moderne, qualité HD, sans inscription. La meilleure plateforme de streaming français.',
  keywords: [
    'streaming gratuit',
    'films streaming',
    'TV en direct',
    'chaînes françaises',
    'regarder films',
    'streaming HD',
    'TV gratuite',
    'films français',
    'séries streaming',
    'Pixora',
    'streaming sans inscription',
    'TV en ligne',
  ],
  authors: [{ name: 'Pixora' }],
  creator: 'Pixora',
  publisher: 'Pixora',
  generator: 'Next.js',
  applicationName: 'Pixora',
  referrer: 'origin-when-cross-origin',

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },

  manifest: '/manifest.json',

  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: siteUrl,
    siteName: 'Pixora',
    title: 'Pixora - Streaming TV et Films Gratuit en Français',
    description:
      'Regardez vos chaînes TV préférées et des milliers de films en streaming gratuit. Interface moderne, qualité HD, sans inscription.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Pixora - Plateforme de Streaming',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Pixora - Streaming TV et Films Gratuit',
    description:
      'Regardez vos chaînes TV et films en streaming gratuit. Interface moderne, qualité HD.',
    images: ['/og-image.jpg'],
    creator: '@pixora',
  },

  robots: {
    index: true,
    follow: true,
    nocache: false,

    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  alternates: {
    canonical: siteUrl,
    languages: {
      'fr-FR': siteUrl,
    },
  },

  category: 'entertainment',
}

export const viewport: Viewport = {
  themeColor: [
    {
      media: '(prefers-color-scheme: light)',
      color: '#10b981',
    },
    {
      media: '(prefers-color-scheme: dark)',
      color: '#059669',
    },
  ],

  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Pixora',
    description:
      'Plateforme de streaming TV et films gratuit en français',
    url: siteUrl,
    applicationCategory: 'EntertainmentApplication',
    operatingSystem: 'Web',

    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },

    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1250',
    },
  }

  return (
    <html lang="fr" className="dark bg-background">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />

        <script
          async
          src="https://acscdn.com/script/aclib.js"
        ></script>
      </head>

      <body className="font-sans antialiased overflow-hidden">
        <LegalWarning />

        {children}

        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
              aclib.runAutoTag({
                zoneId: 'gwq6zuxd7k',
              });
            `,
          }}
        ></script>

        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
