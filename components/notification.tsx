'use client'

import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Notification {
  id: string
  message: string
  submessage?: string
}

interface NotificationContextType {
  notify: (message: string, submessage?: string, duration?: number) => void
}

const NotificationContext = createContext<NotificationContextType | null>(null)

export function useNotification() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider')
  return ctx
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const notify = useCallback((message: string, submessage?: string, duration = 3000) => {
    const id = Math.random().toString(36).slice(2)
    setNotifications((prev) => [...prev, { id, message, submessage }])
    
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    }, duration)
  }, [])

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[999] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {notifications.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-card border border-border border-l-4 border-l-primary rounded-lg px-4 py-3 shadow-xl max-w-xs pointer-events-auto"
            >
              <p className="text-sm text-foreground font-medium">{notif.message}</p>
              {notif.submessage && (
                <p className="text-xs text-muted-foreground mt-1">{notif.submessage}</p>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  )
}
