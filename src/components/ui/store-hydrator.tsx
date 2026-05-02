'use client'
import { useEffect } from 'react'
import { useAuthStore } from '@/src/store/auth-store'
import type { User } from '@/src/types/user'

export function StoreHydrator({ user }: { user: User | null }) {
  const setUser = useAuthStore((s) => s.setUser)
  const clearUser = useAuthStore((s) => s.clearUser)

  useEffect(() => {
    if (user) {
      setUser(user)
    } else {
      clearUser()
    }
  }, [user, setUser, clearUser])

  return null
}
