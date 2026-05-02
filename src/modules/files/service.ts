import type { FileType } from '@/src/types/orders'

// ─── Upload constraints ────────────────────────────────────────────────────────

export const ALLOWED_FILE_TYPES: FileType[] = ['stl', 'dicom', 'jpg', 'png', 'obj', 'ply', 'pdf', 'dcm', 'zip']

export const MAX_FILE_SIZES: Record<FileType, number> = {
  stl: 500 * 1024 * 1024,     // 500 MB
  dicom: 200 * 1024 * 1024,   // 200 MB
  dcm: 200 * 1024 * 1024,     // 200 MB
  obj: 100 * 1024 * 1024,     // 100 MB
  ply: 100 * 1024 * 1024,     // 100 MB
  pdf: 50 * 1024 * 1024,      // 50 MB
  jpg: 20 * 1024 * 1024,      // 20 MB
  png: 20 * 1024 * 1024,      // 20 MB
  zip: 1024 * 1024 * 1024,    // 1 GB
}

export const MIME_TYPE_MAP: Record<string, FileType> = {
  'model/stl': 'stl',
  'application/sla': 'stl',
  'application/dicom': 'dicom',
  'application/octet-stream': 'stl',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'application/pdf': 'pdf',
  'application/zip': 'zip',
  'application/x-zip-compressed': 'zip',
}

// ─── Upload result ────────────────────────────────────────────────────────────

export interface UploadResult {
  id: string
  name: string
  type: FileType
  url: string
  sizeBytes: number
  uploadedAt: string
}

// ─── Service interface ────────────────────────────────────────────────────────

export interface IFileService {
  /** Upload a file to storage and return a signed URL */
  upload(
    clinicId: string,
    file: { buffer: Buffer; name: string; mimeType: string; sizeBytes: number },
    context: { orderId?: string; patientId?: string; uploadedBy: string }
  ): Promise<UploadResult>

  /** Generate a time-limited signed URL for viewing/downloading */
  getSignedUrl(fileId: string, expiresInSec?: number): Promise<string>

  /** Delete a file from storage */
  delete(clinicId: string, fileId: string): Promise<void>

  /** Validate file before upload */
  validate(name: string, mimeType: string, sizeBytes: number): { valid: boolean; error?: string }
}
