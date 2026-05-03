import type { ClinicDashboard, LabDashboard, FinanceDashboard, ExecutiveReport } from '@/src/types/dashboard'

// ─── TTL cache (5-minute default) ────────────────────────────────────────────

const TTL_MS = 5 * 60 * 1000

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

const cache = new Map<string, CacheEntry<unknown>>()

function cacheKey(type: string, id: string, period: string): string {
  return `${type}:${id}:${period}`
}

function get<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    cache.delete(key)
    return null
  }
  return entry.data
}

function set<T>(key: string, data: T, ttlMs = TTL_MS): void {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs })
}

function invalidate(prefix: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key)
  }
}

// ─── Typed cache helpers ──────────────────────────────────────────────────────

export const dashboardCache = {
  getClinic:    (id: string, period: string) => get<ClinicDashboard>(cacheKey('clinic', id, period)),
  setClinic:    (id: string, period: string, data: ClinicDashboard) => set(cacheKey('clinic', id, period), data),
  getLab:       (id: string, period: string) => get<LabDashboard>(cacheKey('lab', id, period)),
  setLab:       (id: string, period: string, data: LabDashboard) => set(cacheKey('lab', id, period), data),
  getFinance:   (id: string, period: string) => get<FinanceDashboard>(cacheKey('finance', id, period)),
  setFinance:   (id: string, period: string, data: FinanceDashboard) => set(cacheKey('finance', id, period), data),
  getExecutive: (period: string) => get<ExecutiveReport>(cacheKey('executive', '__platform__', period)),
  setExecutive: (period: string, data: ExecutiveReport) => set(cacheKey('executive', '__platform__', period), data),
  invalidateTenant: (tenantId: string) => invalidate(`clinic:${tenantId}`),
  invalidateAll: () => cache.clear(),
}

// ─── Period helpers ───────────────────────────────────────────────────────────

export function currentPeriod(): string {
  return new Date().toISOString().slice(0, 7)   // 'YYYY-MM'
}

export function previousPeriod(period: string): string {
  const [year, month] = period.split('-').map(Number)
  const d = new Date((year ?? 2024), (month ?? 1) - 2, 1)
  return d.toISOString().slice(0, 7)
}

export function periodToRange(period: string): { start: string; end: string } {
  const start = `${period}-01T00:00:00.000Z`
  const [year, month] = period.split('-').map(Number)
  const lastDay = new Date((year ?? 2024), (month ?? 1), 0).getDate()
  const end = `${period}-${String(lastDay).padStart(2, '0')}T23:59:59.999Z`
  return { start, end }
}
