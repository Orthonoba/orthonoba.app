import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/src/types/user'

// ─── Auth state machine ───────────────────────────────────────────────────────
//
//  idle ──→ loading ──→ authenticated
//                  └──→ error ──→ idle
//  authenticated ──→ unauthenticated
//  unauthenticated ──→ loading
//
// The store holds reactive UI state only.
// Business logic (credential validation, cookie management) lives in
// auth-service.ts and auth.ts — the store is only updated via transitions.

export type AuthStatus =
  | 'idle'
  | 'loading'
  | 'authenticated'
  | 'unauthenticated'
  | 'error'

// ─── State shape ──────────────────────────────────────────────────────────────

interface AuthState {
  user: User | null
  status: AuthStatus
  error: string | null
  /** Convenience flag derived from status. */
  isAuthenticated: boolean
  /** Convenience flag derived from status. */
  isLoading: boolean

  // ── Transitions ──────────────────────────────────────────────────────────

  /** Called after a successful login or session hydration. */
  setAuthenticated: (user: User) => void

  /** Called when an async auth operation starts. */
  setLoading: () => void

  /** Called when a login/refresh attempt fails. */
  setError: (message: string) => void

  /** Called after logout or when the session is found invalid. */
  setUnauthenticated: () => void

  /** Clears the error and returns to a neutral state. */
  resetError: () => void

  // ── Backward-compatible aliases (used by StoreHydrator) ──────────────────
  setUser: (user: User) => void
  clearUser: () => void
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      status: 'idle',
      error: null,
      isAuthenticated: false,
      isLoading: false,

      setAuthenticated: (user) =>
        set({
          user,
          status: 'authenticated',
          isAuthenticated: true,
          isLoading: false,
          error: null,
        }),

      setLoading: () =>
        set({ status: 'loading', isLoading: true, error: null }),

      setError: (message) =>
        set({ status: 'error', isLoading: false, error: message }),

      setUnauthenticated: () =>
        set({
          user: null,
          status: 'unauthenticated',
          isAuthenticated: false,
          isLoading: false,
          error: null,
        }),

      resetError: () => {
        const hasUser = !!get().user
        set({ error: null, status: hasUser ? 'authenticated' : 'idle' })
      },

      // Aliases
      setUser: (user) =>
        set({
          user,
          status: 'authenticated',
          isAuthenticated: true,
          isLoading: false,
          error: null,
        }),

      clearUser: () =>
        set({
          user: null,
          status: 'unauthenticated',
          isAuthenticated: false,
          isLoading: false,
          error: null,
        }),
    }),
    {
      name: 'orthonoba-auth',
      // Only persist the minimal session data — no ephemeral flags
      partialize: (state) => ({
        user: state.user,
        status: state.status,
      }),
    }
  )
)
