import { type NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/src/lib/session'
import { siteConfig } from '@/src/config/site'
import { getClinicBySubdomain } from '@/src/lib/mock-clinics'
import { getRedirectUrl } from '@/src/lib/route-guard'

// ─── Subdomain extraction ─────────────────────────────────────────────────────

function extractSubdomain(hostname: string): string | null {
  const { baseDomain, devBaseDomain, marketingSubdomains } = siteConfig

  if (hostname.endsWith(`.${baseDomain}`)) {
    const sub = hostname.slice(0, -(baseDomain.length + 1))
    return marketingSubdomains.includes(sub) ? null : sub
  }

  if (hostname.endsWith(`.${devBaseDomain}`) || hostname.endsWith('.lvh.me')) {
    const sub = hostname.split('.')[0]
    return sub || null
  }

  return null
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export default async function middleware(req: NextRequest) {
  const hostname = req.headers.get('host') ?? ''
  const path = req.nextUrl.pathname

  // ── 1. Resolve session ────────────────────────────────────────────────────
  const token = req.cookies.get('session')?.value
  const session = await decrypt(token)

  // ── 2. Route protection (pure logic from route-guard.ts) ─────────────────
  const redirectUrl = getRedirectUrl(path, session)
  if (redirectUrl) {
    return NextResponse.redirect(new URL(redirectUrl, req.nextUrl))
  }

  // ── 3. Resolve tenant from subdomain ──────────────────────────────────────
  const subdomain = extractSubdomain(hostname)
  const clinic = subdomain ? getClinicBySubdomain(subdomain) : null

  // ── 4. Inject tenant context headers ─────────────────────────────────────
  const requestHeaders = new Headers(req.headers)

  if (clinic) {
    requestHeaders.set('x-clinic-id', clinic.id)
    requestHeaders.set('x-clinic-name', clinic.name)
    requestHeaders.set('x-clinic-type', clinic.type)
    requestHeaders.set('x-subdomain', subdomain!)
  } else {
    requestHeaders.delete('x-clinic-id')
    requestHeaders.delete('x-clinic-name')
    requestHeaders.delete('x-clinic-type')
    requestHeaders.delete('x-subdomain')
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  })
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
