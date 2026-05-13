'use client'

import { BootScreen } from '@/components/boot-screen'
import { TVApp } from '@/components/tv-app'
import { NotificationProvider } from '@/components/notification'

export default function Home() {
  return (
    <NotificationProvider>
      <BootScreen />
      <TVApp />
    </NotificationProvider>
  )
}
