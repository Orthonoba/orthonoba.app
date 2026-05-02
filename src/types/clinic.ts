import type { UserRole } from '@/src/types/user'

// ─── Tenant Classification ────────────────────────────────────────────────────

export type TenantType = 'clinic' | 'lab'

export type TenantStatus = 'active' | 'inactive' | 'suspended' | 'trial'

export type PlanTier = 'starter' | 'growth' | 'scale' | 'enterprise'

// ─── Structured Address ───────────────────────────────────────────────────────

export interface Address {
  street: string
  city: string
  province?: string
  postalCode: string
  /** ISO 3166-1 alpha-2 country code, e.g. 'ES' */
  countryCode: string
}

// ─── Business Hours ───────────────────────────────────────────────────────────

export interface DaySchedule {
  open: boolean
  /** 'HH:MM' in 24h format */
  start?: string
  end?: string
  /** Mid-day break */
  breakStart?: string
  breakEnd?: string
}

export interface BusinessHours {
  clinicId: string
  monday: DaySchedule
  tuesday: DaySchedule
  wednesday: DaySchedule
  thursday: DaySchedule
  friday: DaySchedule
  saturday: DaySchedule
  sunday: DaySchedule
}

// ─── Core Clinic / Tenant Entity ─────────────────────────────────────────────

export interface Clinic {
  id: string
  name: string
  subdomain: string
  type: TenantType
  status: TenantStatus
  plan: PlanTier
  /** Flat address string — use Address interface for structured data */
  address: string
  phone: string
  email: string
  logo?: string
  /** Tax identification number (NIF / CIF) */
  taxId?: string
  website?: string
  /** IANA timezone identifier, e.g. 'Europe/Madrid' */
  timezone: string
  /** ISO 4217 currency code, e.g. 'EUR' */
  currency: string
  isActive: boolean
  trialEndsAt?: string
  createdAt: string
  updatedAt?: string
}

// ─── Staff ────────────────────────────────────────────────────────────────────

export interface StaffMember {
  id: string
  clinicId: string
  userId: string
  name: string
  role: UserRole
  email: string
  isActive: boolean
  joinedAt: string
}

// ─── Tenant Context (resolved per-request via middleware) ─────────────────────

export interface TenantContext {
  clinicId: string
  subdomain: string
  clinicName: string
  type: TenantType
  plan: PlanTier
}

// ─── Clinic Settings (per-tenant feature configuration) ──────────────────────

export interface ClinicSettings {
  clinicId: string
  locale: string
  logoUrl?: string
  primaryColor?: string
  enableCad: boolean
  enablePickup: boolean
  enableBilling: boolean
  enableMarketing: boolean
  enablePatientCrm: boolean
  enableLabIntegration: boolean
  maxStorageGb: number
}

// ─── Feature Modules ──────────────────────────────────────────────────────────

export type ClinicModuleKey =
  | 'billing'
  | 'cad'
  | 'pickup'
  | 'marketing'
  | 'patients-crm'
  | 'lab-integration'
  | 'appointments'
  | 'referrals'
  | 'reports'

export interface ClinicModule {
  clinicId: string
  module: ClinicModuleKey
  enabled: boolean
  enabledAt?: string
  disabledAt?: string
}

// ─── Third-party Integrations ─────────────────────────────────────────────────

export type IntegrationType =
  | 'stripe'
  | 'google-ads'
  | 'google-analytics'
  | 'google-business-profile'
  | 'meta-ads'
  | 'mailchimp'
  | 'brevo'
  | 'whatsapp-business'
  | 'doctoralia'
  | 'topdoctors'
  | 'zapier'

export interface ClinicIntegration {
  id: string
  clinicId: string
  type: IntegrationType
  isActive: boolean
  /** Stored encrypted in DB — never exposed to client */
  accessToken?: string
  refreshToken?: string
  externalAccountId?: string
  configuredAt: string
  expiresAt?: string
}
