import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'
import { z } from 'zod'

// ─── 3D dental file constants ─────────────────────────────────────────────────

const DENTAL_3D_MIME: Record<string, string> = {
  // STL — sterolithography (most common dental scan format)
  'model/stl':                    'stl',
  'application/sla':              'stl',
  'application/vnd.ms-pki.stl':  'stl',
  'application/octet-stream':     'stl',  // generic binary — validated by ext
  // OBJ — Wavefront 3D object
  'model/obj':                    'obj',
  'text/plain':                   'obj',  // .obj files often detected as text
  // PLY — polygon mesh (Zebris, iTero exports)
  'application/ply':              'ply',
  'model/ply':                    'ply',
  // DICOM / DCM — medical imaging (CBCT, X-ray)
  'application/dicom':            'dicom',
  'image/dicom':                  'dicom',
  'application/octet-stream_dcm': 'dcm',
  // Standard images
  'image/jpeg':                   'jpg',
  'image/png':                    'png',
  // ZIP — compressed folder (multiple files, CBCT stacks)
  'application/zip':              'zip',
  'application/x-zip-compressed': 'zip',
  'application/x-7z-compressed':  'zip',
}

// Max sizes per type (bytes)
const MAX_SIZES: Record<string, number> = {
  stl:   500 * 1024 * 1024,   // 500 MB
  obj:   100 * 1024 * 1024,   // 100 MB
  ply:   100 * 1024 * 1024,   // 100 MB
  dicom: 500 * 1024 * 1024,   // 500 MB (CBCT stacks)
  dcm:   500 * 1024 * 1024,
  jpg:    20 * 1024 * 1024,   // 20 MB
  png:    20 * 1024 * 1024,
  zip:  1024 * 1024 * 1024,   // 1 GB  (multi-file archive)
}

// Extension → type fallback (for generic octet-stream)
const EXT_MAP: Record<string, string> = {
  stl: 'stl', obj: 'obj', ply: 'ply',
  dcm: 'dcm', dicom: 'dicom',
  jpg: 'jpg', jpeg: 'jpg', png: 'png',
  zip: 'zip', '7z': 'zip',
}

// ─── Metadata schema ──────────────────────────────────────────────────────────

const metaSchema = z.object({
  orderId:   z.string().uuid().optional(),
  caseId:    z.string().uuid().optional(),
  patientId: z.string().uuid().optional(),
  jaw:       z.enum(['upper', 'lower', 'both', 'bite', 'full_arch']).optional(),
  side:      z.enum(['left', 'right', 'full']).optional(),
  scanType:  z.enum(['intraoral', 'cbct', 'photo', 'model', 'other']).optional(),
  notes:     z.string().max(500).optional(),
})

// ─── In-memory scan store (swap → Neon DB) ────────────────────────────────────

export interface DentalScan {
  id:         string
  clinicId:   string
  uploadedBy: string
  fileName:   string
  fileType:   string
  sizeBytes:  number
  url:        string           // signed URL placeholder
  orderId?:   string
  caseId?:    string
  patientId?: string
  jaw?:       string
  side?:      string
  scanType?:  string
  notes?:     string
  uploadedAt: string
}

const scans = new Map<string, DentalScan>()

export async function listScans(clinicId: string, filters: {
  orderId?: string
  patientId?: string
  limit?: number
} = {}): Promise<DentalScan[]> {
  let result = Array.from(scans.values()).filter((s) => s.clinicId === clinicId)
  if (filters.orderId)   result = result.filter((s) => s.orderId   === filters.orderId)
  if (filters.patientId) result = result.filter((s) => s.patientId === filters.patientId)
  return result
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    .slice(0, filters.limit ?? 100)
}

// ─── POST /api/v1/files/stl — Upload dental 3D file ──────────────────────────

export const POST = withTenant(async (req, { tenant, session }) => {
  if (!['super_admin', 'clinic_admin', 'lab_admin', 'doctor'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Sin permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }

  const formData = await req.formData().catch(() => null)
  if (!formData) {
    return NextResponse.json(
      fail('VALIDATION_ERROR', 'Form data inválido.'),
      { status: HTTP_STATUS.VALIDATION_ERROR }
    )
  }

  const file = formData.get('file') as File | null
  if (!file || file.size === 0) {
    return NextResponse.json(
      fail('VALIDATION_ERROR', 'Archivo requerido.'),
      { status: HTTP_STATUS.VALIDATION_ERROR }
    )
  }

  // Resolve file type (MIME → ext fallback)
  const ext       = file.name.split('.').pop()?.toLowerCase() ?? ''
  const byMime    = DENTAL_3D_MIME[file.type]
  const byExt     = EXT_MAP[ext]
  const fileType  = byMime ?? byExt

  if (!fileType) {
    return NextResponse.json(
      fail(
        'INVALID_FILE_TYPE',
        `Tipo no soportado: ${file.type || ext}. Permitidos: STL, OBJ, PLY, DICOM, JPG, PNG, ZIP`
      ),
      { status: HTTP_STATUS.INVALID_FILE_TYPE }
    )
  }

  const maxSize = MAX_SIZES[fileType] ?? 20 * 1024 * 1024
  if (file.size > maxSize) {
    return NextResponse.json(
      fail(
        'FILE_TOO_LARGE',
        `El archivo supera el límite de ${Math.round(maxSize / 1024 / 1024)} MB para .${fileType}`
      ),
      { status: HTTP_STATUS.FILE_TOO_LARGE }
    )
  }

  // Parse optional metadata fields
  const rawMeta = {
    orderId:   formData.get('orderId')   ?? undefined,
    caseId:    formData.get('caseId')    ?? undefined,
    patientId: formData.get('patientId') ?? undefined,
    jaw:       formData.get('jaw')       ?? undefined,
    side:      formData.get('side')      ?? undefined,
    scanType:  formData.get('scanType')  ?? undefined,
    notes:     formData.get('notes')     ?? undefined,
  }
  const metaParsed = metaSchema.safeParse(rawMeta)
  const meta = metaParsed.success ? metaParsed.data : {}

  // Build storage path
  const timestamp = Date.now()
  const safeName  = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const subDir    = meta.orderId
    ? `orders/${meta.orderId}`
    : meta.patientId
      ? `patients/${meta.patientId}`
      : 'misc'
  const storagePath = `${tenant.clinicId}/3d/${subDir}/${timestamp}-${safeName}`

  // Stub: in production this calls storageService.upload(...)
  // For now, record metadata and return a mock URL
  const scan: DentalScan = {
    id:         crypto.randomUUID(),
    clinicId:   tenant.clinicId,
    uploadedBy: session.userId,
    fileName:   file.name,
    fileType,
    sizeBytes:  file.size,
    url:        `/files/${storagePath}`,   // placeholder — replace with signed URL
    orderId:    meta.orderId,
    caseId:     meta.caseId,
    patientId:  meta.patientId,
    jaw:        meta.jaw,
    side:       meta.side,
    scanType:   meta.scanType,
    notes:      meta.notes,
    uploadedAt: new Date().toISOString(),
  }

  scans.set(scan.id, scan)

  return NextResponse.json(
    ok({
      id:        scan.id,
      fileName:  scan.fileName,
      fileType:  scan.fileType,
      sizeBytes: scan.sizeBytes,
      sizeLabel: `${(scan.sizeBytes / 1024 / 1024).toFixed(1)} MB`,
      url:       scan.url,
      path:      storagePath,
      jaw:       scan.jaw,
      side:      scan.side,
      scanType:  scan.scanType,
      uploadedAt: scan.uploadedAt,
    }),
    { status: 201 }
  )
})

// ─── GET /api/v1/files/stl — List dental 3D scans ────────────────────────────

export const GET = withTenant(async (req, { tenant, session }) => {
  if (!['super_admin', 'clinic_admin', 'lab_admin', 'doctor', 'staff'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Sin permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }

  const { searchParams } = new URL(req.url)
  const orderId   = searchParams.get('orderId')   ?? undefined
  const patientId = searchParams.get('patientId') ?? undefined
  const limit     = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 200)

  const list = await listScans(tenant.clinicId, { orderId, patientId, limit })

  return NextResponse.json(ok({
    data:  list,
    total: list.length,
    supportedTypes: Object.keys(EXT_MAP),
    maxSizes: Object.fromEntries(
      Object.entries(MAX_SIZES).map(([k, v]) => [k, `${Math.round(v / 1024 / 1024)} MB`])
    ),
  }))
})
