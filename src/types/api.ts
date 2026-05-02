// ─── Standard API response envelope ──────────────────────────────────────────
// Every v1 route returns one of these shapes.

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: ApiError
  meta?: PaginationMeta
}

export interface ApiError {
  code: ErrorCode
  message: string
  details?: unknown
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

// ─── Standard pagination query params ────────────────────────────────────────

export interface PaginationQuery {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
}

// ─── Error codes (machine-readable) ──────────────────────────────────────────

export type ErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'CONFLICT'
  | 'TENANT_REQUIRED'
  | 'PLAN_LIMIT_EXCEEDED'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'STRIPE_ERROR'
  | 'FILE_TOO_LARGE'
  | 'INVALID_FILE_TYPE'

// ─── Factory helpers (used in route handlers) ────────────────────────────────

export function ok<T>(data: T, meta?: PaginationMeta): ApiResponse<T> {
  return { success: true, data, ...(meta ? { meta } : {}) }
}

export function paginated<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): ApiResponse<T[]> {
  const totalPages = Math.ceil(total / limit)
  return {
    success: true,
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  }
}

export function fail(
  code: ErrorCode,
  message: string,
  details?: unknown
): ApiResponse<never> {
  return { success: false, error: { code, message, details } }
}

// ─── HTTP status map ──────────────────────────────────────────────────────────

export const HTTP_STATUS: Record<ErrorCode, number> = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 422,
  CONFLICT: 409,
  TENANT_REQUIRED: 400,
  PLAN_LIMIT_EXCEEDED: 402,
  RATE_LIMIT_EXCEEDED: 429,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
  STRIPE_ERROR: 402,
  FILE_TOO_LARGE: 413,
  INVALID_FILE_TYPE: 415,
}
