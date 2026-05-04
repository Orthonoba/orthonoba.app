import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { storageService, STORAGE_BUCKETS, buildFilePath } from '@/src/services/storage'
import { MIME_TYPE_MAP, MAX_FILE_SIZES } from '@/src/modules/files/service'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'

const _MAX_REQUEST_SIZE = 1024 * 1024 * 1024 // 1 GB

export const POST = withTenant(async (req, { tenant, session: _session }) => {
  const formData = await req.formData().catch(() => null)
  if (!formData) {
    return NextResponse.json(fail('VALIDATION_ERROR', 'Invalid form data.'), {
      status: HTTP_STATUS.VALIDATION_ERROR,
    })
  }

  const file = formData.get('file') as File | null
  const orderId = formData.get('orderId') as string | null

  if (!file) {
    return NextResponse.json(fail('VALIDATION_ERROR', 'No file provided.'), {
      status: HTTP_STATUS.VALIDATION_ERROR,
    })
  }

  const fileType = MIME_TYPE_MAP[file.type]
  if (!fileType) {
    return NextResponse.json(
      fail('INVALID_FILE_TYPE', `Tipo de archivo no permitido: ${file.type}`),
      { status: HTTP_STATUS.INVALID_FILE_TYPE }
    )
  }

  const maxSize = MAX_FILE_SIZES[fileType]
  if (file.size > maxSize) {
    return NextResponse.json(
      fail('FILE_TOO_LARGE', `El archivo supera el límite de ${Math.round(maxSize / 1024 / 1024)} MB.`),
      { status: HTTP_STATUS.FILE_TOO_LARGE }
    )
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const path = orderId
    ? buildFilePath(tenant.clinicId, orderId, file.name)
    : `${tenant.clinicId}/misc/${Date.now()}-${file.name}`

  const result = await storageService.upload({
    bucket: STORAGE_BUCKETS.files,
    path,
    buffer,
    mimeType: file.type,
  })

  return NextResponse.json(
    ok({
      name: file.name,
      type: fileType,
      url: result.url,
      sizeBytes: file.size,
      path: result.path,
    }),
    { status: 201 }
  )
})
