'use server'
import { createSession, deleteSession } from '@/src/lib/auth'
import { authService } from '@/src/lib/auth-service'
import { redirect } from 'next/navigation'

// ─── Login ────────────────────────────────────────────────────────────────────

export type LoginState = { error?: string } | undefined

export async function loginAction(
  _state: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = (formData.get('email') as string | null)?.trim()
  const password = formData.get('password') as string | null

  if (!email || !password) {
    return { error: 'Email y contraseña son requeridos.' }
  }

  const result = await authService.login({ email, password })

  if (!result.ok || !result.sessionPayload) {
    return { error: result.error ?? 'Error de autenticación.' }
  }

  await createSession(result.sessionPayload)

  redirect('/dashboard')
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logoutAction(): Promise<void> {
  await authService.logout()
  await deleteSession()
  redirect('/login')
}
