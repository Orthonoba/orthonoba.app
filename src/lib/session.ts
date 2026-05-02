import { SignJWT, jwtVerify } from 'jose'
import type { SessionPayload } from '@/src/types/user'

const key = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? 'dev-secret-change-in-production-32chars!!'
)

export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key)
}

export async function decrypt(token: string | undefined = ''): Promise<SessionPayload | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'] })
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}
