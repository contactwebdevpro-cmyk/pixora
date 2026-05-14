'use client'

import { BootScreen } from '@/components/boot-screen'
import { TVApp } from '@/components/tv-app'
import { NotificationProvider } from '@/components/notification'
import { UBlockBanner } from '@/components/ublock-banner'

export default function Home() {
  return (
    <NotificationProvider>
      <UBlockBanner />
      <BootScreen />
      <TVApp />
    </NotificationProvider>
  )
}
