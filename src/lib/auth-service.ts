import { mockUsers } from '@/src/lib/mock-users'
import { decrypt } from '@/src/lib/session'
import type { User, SessionPayload } from '@/src/types/user'

// ─── Input / Output contracts ─────────────────────────────────────────────────

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResult {
  ok: boolean
  user?: User
  /** Minimal session payload — no PII, ready to be signed into a JWT */
  sessionPayload?: Omit<SessionPayload, 'expiresAt'>
  error?: string
}

// ─── Service interface ────────────────────────────────────────────────────────
// Swap the implementation (MockAuthService → ApiAuthService) without touching
// callers. Every file that needs auth logic imports `authService`, not the class.

export interface IAuthService {
  /** Validate credentials and return a user + session payload on success. */
  login(credentials: LoginCredentials): Promise<AuthResult>
  /** Invalidate the current session (server-side side-effects via auth.ts). */
  logout(): Promise<void>
  /** Verify a raw JWT string and return its decoded payload. */
  verifyToken(token: string): Promise<SessionPayload | null>
  /** Fetch a user record by ID (used after session validation). */
  getUserById(id: string): Promise<User | null>
}

// ─── Mock implementation ──────────────────────────────────────────────────────
// NOTE: Server-only. Uses jose internally through session.ts.
// Replace with ApiAuthService when the REST backend is available.

class MockAuthService implements IAuthService {
  async login({ email, password }: LoginCredentials): Promise<AuthResult> {
    const found = mockUsers.find(
      (u) => u.email === email && u.password === password
    )

    if (!found) {
      return { ok: false, error: 'Credenciales inválidas.' }
    }

    if (found.status !== 'active') {
      return { ok: false, error: 'Cuenta inactiva. Contacta al administrador.' }
    }

    const { password: _pw, ...user } = found

    return {
      ok: true,
      user,
      sessionPayload: {
        userId: user.id,
        role: user.role,
        clinicId: user.clinicId,
      },
    }
  }

  async logout(): Promise<void> {
    // Cookie deletion is handled by deleteSession() in auth.ts (server-side).
    // Future ApiAuthService: POST /api/v1/auth/logout
  }

  async verifyToken(token: string): Promise<SessionPayload | null> {
    return decrypt(token)
  }

  async getUserById(id: string): Promise<User | null> {
    const found = mockUsers.find((u) => u.id === id && u.status === 'active')
    if (!found) return null
    const { password: _pw, ...user } = found
    return user
  }
}

// ─── Singleton export ─────────────────────────────────────────────────────────
// To switch to the real API, replace `new MockAuthService()` with
// `new ApiAuthService(process.env.NEXT_PUBLIC_API_URL)`.

export const authService: IAuthService = new MockAuthService()
