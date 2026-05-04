import { NextResponse } from 'next/server'
import { withAuth } from '@/src/middleware/with-auth'
import { ok } from '@/src/types/api'
import { authService } from '@/src/lib/auth-service'
import type { User } from '@/src/types/user'

export const GET = withAuth(async (_req, { session }) => {
  const user = await authService.getUserById(session.userId)
  return NextResponse.json(ok<User | null>(user))
})
