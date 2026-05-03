import { type NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/src/lib/session'
import { getClinicById } from '@/src/lib/mock-clinics'
import { fail, HTTP_STATUS } from '@/src/types/api'
import type { SessionPayload } from '@/src/types/user'
import type { TenantContext } from '@/src/types/clinic'

// Next.js 16: dynamic route params are async (Promise)
type RouteContext<P = Record<string, string>> = { params: Promise<P> }

type TenantHandler<P = Record<string, string>> = (
  req: NextRequest,
  ctx: { params: P; session: SessionPayload; tenant: TenantContext }
) => Promise<NextResponse | Response>

/**
 * Composes auth + tenant context resolution.
 * Compatible with Next.js 16 async params convention.
 */
export function withTenant<P = Record<string, string>>(handler: TenantHandler<P>) {
  return async (req: NextRequest, context: RouteContext<P>): Promise<NextResponse | Response> => {
    const token = req.cookies.get('session')?.value
    const session = await decrypt(token)

    if (!session?.userId) {
      return NextResponse.json(fail('UNAUTHORIZED', 'Authentication required.'), {
        status: HTTP_STATUS.UNAUTHORIZED,
      })
    }

    const clinicId = req.headers.get('x-clinic-id')
    if (!clinicId) {
      return NextResponse.json(fail('TENANT_REQUIRED', 'No tenant context found.'), {
        status: HTTP_STATUS.TENANT_REQUIRED,
      })
    }

    const isAdmin = session.role === 'super_admin'
    const belongsToClinic = session.clinicId === clinicId

    if (!isAdmin && !belongsToClinic) {
      return NextResponse.json(fail('FORBIDDEN', 'Access to this tenant is not allowed.'), {
        status: HTTP_STATUS.FORBIDDEN,
      })
    }

    const clinic = getClinicById(clinicId)
    const tenant: TenantContext = {
      clinicId,
      subdomain: req.headers.get('x-subdomain') ?? clinicId,
      clinicName: req.headers.get('x-clinic-name') ?? clinicId,
      type: (req.headers.get('x-clinic-type') as TenantContext['type']) ?? 'clinic',
      plan: clinic?.plan ?? 'starter',
    }

    const params = await context.params
    return handler(req, { params, session, tenant })
  }
}
