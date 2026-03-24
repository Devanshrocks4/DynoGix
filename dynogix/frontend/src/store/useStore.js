import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      updateUser: (user) => set({ user }),
    }),
    { name: 'dynogix-auth' }
  )
)

export const useUIStore = create((set) => ({
  sidebarOpen: true,
  activeModule: 'dashboard',
  notifications: [],
  aiChatOpen: false,
  setSidebarOpen: (v) => set({ sidebarOpen: v }),
  setActiveModule: (m) => set({ activeModule: m }),
  setAiChatOpen: (v) => set({ aiChatOpen: v }),
  addNotification: (n) => set((s) => ({ notifications: [{ id: Date.now(), ...n }, ...s.notifications.slice(0, 9)] })),
  clearNotification: (id) => set((s) => ({ notifications: s.notifications.filter(n => n.id !== id) })),
}))
