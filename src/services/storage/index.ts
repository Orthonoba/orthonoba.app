// ─── Storage service interface ────────────────────────────────────────────────
// Implementation: Supabase Storage (swap for AWS S3 / GCS by replacing adapter)

export interface StorageUploadParams {
  bucket: string
  path: string
  buffer: Buffer
  mimeType: string
  /** Cache control header */
  cacheControl?: string
  /** Make file publicly accessible (default: false) */
  upsert?: boolean
}

export interface StorageUploadResult {
  path: string
  url: string
}

export interface IStorageService {
  upload(params: StorageUploadParams): Promise<StorageUploadResult>
  getSignedUrl(bucket: string, path: string, expiresInSec?: number): Promise<string>
  getPublicUrl(bucket: string, path: string): string
  delete(bucket: string, path: string): Promise<void>
  move(bucket: string, fromPath: string, toPath: string): Promise<void>
}

// ─── Bucket configuration ─────────────────────────────────────────────────────

export const STORAGE_BUCKETS = {
  files: process.env.STORAGE_BUCKET_FILES ?? 'orthonoba-files',
  dicom: process.env.STORAGE_BUCKET_DICOM ?? 'orthonoba-dicom',
  avatars: process.env.STORAGE_BUCKET_AVATARS ?? 'orthonoba-avatars',
} as const

export type StorageBucket = keyof typeof STORAGE_BUCKETS

/** Build the storage path for an order file */
export function buildFilePath(clinicId: string, orderId: string, filename: string): string {
  return `${clinicId}/orders/${orderId}/${filename}`
}

/** Build the storage path for a patient attachment */
export function buildPatientFilePath(clinicId: string, patientId: string, filename: string): string {
  return `${clinicId}/patients/${patientId}/${filename}`
}

// ─── Mock storage service ─────────────────────────────────────────────────────

class MockStorageService implements IStorageService {
  async upload(params: StorageUploadParams): Promise<StorageUploadResult> {
    console.warn('[storage:mock] Would upload:', params.path)
    return {
      path: params.path,
      url: `https://storage.mock/${params.bucket}/${params.path}`,
    }
  }

  async getSignedUrl(bucket: string, path: string, expiresInSec = 3600): Promise<string> {
    return `https://storage.mock/${bucket}/${path}?expires=${expiresInSec}`
  }

  getPublicUrl(bucket: string, path: string): string {
    return `https://storage.mock/${bucket}/${path}`
  }

  async delete(bucket: string, path: string): Promise<void> {
    console.warn('[storage:mock] Would delete:', `${bucket}/${path}`)
  }

  async move(bucket: string, fromPath: string, toPath: string): Promise<void> {
    console.warn('[storage:mock] Would move:', fromPath, '->', toPath)
  }
}

export const storageService: IStorageService = new MockStorageService()
