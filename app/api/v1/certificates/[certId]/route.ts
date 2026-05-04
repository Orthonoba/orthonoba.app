import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server'
import { getCertificateByVerificationId, getCertificate } from '@/src/modules/academy/enrollment-store'
import { getCertificateVerifyUrl } from '@/src/config/academy'
import { ok, fail } from '@/src/types/api'

type Params = { certId: string }

// GET /api/v1/certificates/:certId — public certificate verification
// Accepts both certificate ID and verificationId (UUID)
export async function GET(_req: NextRequest, { params }: { params: Promise<Params> }) {
  const { certId } = await params

  // Try verificationId first (used in public verify URLs), then fallback to internal ID
  const cert = await getCertificateByVerificationId(certId)
    ?? await getCertificate(certId)

  if (!cert) {
    return NextResponse.json(fail('NOT_FOUND', 'Certificado no encontrado o no válido.'), { status: 404 })
  }

  if (cert.status === 'revoked') {
    return NextResponse.json(fail('FORBIDDEN', 'Este certificado ha sido revocado.'), { status: 410 })
  }

  if (cert.status === 'expired' || (cert.expiresAt && new Date(cert.expiresAt) < new Date())) {
    return NextResponse.json(fail('FORBIDDEN', 'Este certificado ha expirado.'), { status: 410 })
  }

  return NextResponse.json(ok({
    verificationId: cert.verificationId,
    status: cert.status,
    userName: cert.userName,
    courseTitle: cert.courseTitle,
    instructorNames: cert.instructorNames,
    issuedAt: cert.issuedAt,
    expiresAt: cert.expiresAt,
    hoursCompleted: cert.hoursCompleted,
    finalScore: cert.finalScore,
    verifyUrl: getCertificateVerifyUrl(cert.verificationId),
    isValid: true,
  }), {
    headers: { 'Cache-Control': 'public, s-maxage=3600' },
  })
}
