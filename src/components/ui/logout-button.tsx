'use client'
import { logoutAction } from '@/src/app/actions/auth'
import { useAuthStore } from '@/src/store/auth-store'

export function LogoutButton() {
  const clearUser = useAuthStore((s) => s.clearUser)

  return (
    <form action={logoutAction} onSubmit={() => clearUser()}>
      <button
        type="submit"
        className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
      >
        Cerrar sesión
      </button>
    </form>
  )
}
