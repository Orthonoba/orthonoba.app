'use client'
import { useActionState } from 'react'
import { loginAction } from '@/src/app/actions/auth'

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, undefined)

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
          {state.error}
        </p>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="admin@orthonoba.app"
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors"
      >
        {pending ? 'Iniciando sesión…' : 'Iniciar sesión'}
      </button>
    </form>
  )
}
