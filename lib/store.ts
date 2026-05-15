import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Channel {
  id: string
  name: string
  group: string
  logo: string
  url: string
}

export type ViewMode = 'all' | 'favorites' | 'recent' | 'category' | 'search'
export type AppMode = 'tv' | 'film' | 'series' | null

interface AppState {
  // App mode
  appMode: AppMode
  setAppMode: (mode: AppMode) => void

  // Channels
  channels: Channel[]
  setChannels: (channels: Channel[]) => void
  
  // Current view
  view: ViewMode
  setView: (view: ViewMode) => void
  
  // Selected category
  selectedCategory: string | null
  setSelectedCategory: (cat: string | null) => void
  
  // Search query
  searchQuery: string
  setSearchQuery: (query: string) => void
  
  // Favorites
  favorites: string[]
  toggleFavorite: (id: string) => void
  
  // Recent channels
  recentChannels: string[]
  addToRecent: (id: string) => void
  
  // Current playing channel
  currentChannel: Channel | null
  setCurrentChannel: (channel: Channel | null) => void
  
  // Player state
  isPlayerOpen: boolean
  setPlayerOpen: (open: boolean) => void
  
  // Settings
  showLogos: boolean
  setShowLogos: (show: boolean) => void
  pageSize: number
  setPageSize: (size: number) => void
  volume: number
  setVolume: (vol: number) => void
  m3uUrl: string
  setM3uUrl: (url: string) => void
  
  // Loading state
  isLoading: boolean
  setLoading: (loading: boolean) => void
  
  // Settings modal
  isSettingsOpen: boolean
  setSettingsOpen: (open: boolean) => void
}

const DEFAULT_M3U = 'https://iptv-org.github.io/iptv/languages/fra.m3u'

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      appMode: null,
      setAppMode: (mode) => set({ appMode: mode }),

      channels: [],
      setChannels: (channels) => set({ channels }),

      view: 'all',
      setView: (view) => set({ view, selectedCategory: view === 'all' ? null : undefined }),

      selectedCategory: null,
      setSelectedCategory: (cat) => set({ selectedCategory: cat, view: 'category' }),

      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query, view: query ? 'search' : 'all' }),

      favorites: [],
      toggleFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.includes(id)
            ? state.favorites.filter((f) => f !== id)
            : [...state.favorites, id],
        })),

      recentChannels: [],
      addToRecent: (id) =>
        set((state) => ({
          recentChannels: [id, ...state.recentChannels.filter((r) => r !== id)].slice(0, 20),
        })),

      currentChannel: null,
      setCurrentChannel: (channel) => set({ currentChannel: channel }),

      isPlayerOpen: false,
      setPlayerOpen: (open) => set({ isPlayerOpen: open }),

      showLogos: true,
      setShowLogos: (show) => set({ showLogos: show }),

      pageSize: 50,
      setPageSize: (size) => set({ pageSize: size }),

      volume: 80,
      setVolume: (vol) => set({ volume: vol }),

      m3uUrl: DEFAULT_M3U,
      setM3uUrl: (url) => set({ m3uUrl: url }),

      isLoading: false,
      setLoading: (loading) => set({ isLoading: loading }),

      isSettingsOpen: false,
      setSettingsOpen: (open) => set({ isSettingsOpen: open }),
    }),
    {
      name: 'pitv-storage',
      partialize: (state) => ({
        favorites: state.favorites,
        recentChannels: state.recentChannels,
        showLogos: state.showLogos,
        pageSize: state.pageSize,
        volume: state.volume,
        m3uUrl: state.m3uUrl,
      }),
    }
  )
)
