import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/src/lib/session'
import { fail, HTTP_STATUS } from '@/src/types/api'
import type { SessionPayload } from '@/src/types/user'

// Next.js 16: dynamic route params are async (Promise)
type RouteContext<P = Record<string, string>> = { params: Promise<P> }

type AuthedHandler<P = Record<string, string>> = (
  req: NextRequest,
  ctx: { params: P; session: SessionPayload }
) => Promise<NextResponse | Response>

/**
 * Enforces JWT session authentication on API v1 routes.
 * Compatible with Next.js 16 async params convention.
 */
export function withAuth<P = Record<string, string>>(handler: AuthedHandler<P>) {
  return async (req: NextRequest, context: RouteContext<P>): Promise<NextResponse | Response> => {
    const token = req.cookies.get('session')?.value
    const session = await decrypt(token)

    if (!session?.userId) {
      return NextResponse.json(fail('UNAUTHORIZED', 'Authentication required.'), {
        status: HTTP_STATUS.UNAUTHORIZED,
      })
    }

    const params = await context.params
    return handler(req, { params, session })
  }
}
