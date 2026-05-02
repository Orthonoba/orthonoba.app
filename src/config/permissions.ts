// ─── Permission registry ──────────────────────────────────────────────────────
// Format: <resource>.<action>
// Add new permissions here and in rolePermissions (roles.ts).

export type Permission =
  // Patients
  | 'patients.read'
  | 'patients.write'
  | 'patients.delete'
  | 'patients.export'

  // Cases
  | 'cases.read'
  | 'cases.write'
  | 'cases.delete'
  | 'cases.assign'

  // Doctors
  | 'doctors.read'
  | 'doctors.write'
  | 'doctors.delete'

  // Orders (lab work)
  | 'orders.read'
  | 'orders.write'
  | 'orders.delete'

  // Billing
  | 'billing.read'
  | 'billing.write'
  | 'billing.delete'
  | 'billing.export'

  // Files (STL, DICOM, images)
  | 'files.read'
  | 'files.upload'
  | 'files.delete'

  // CAD/CAM
  | 'cad.access'
  | 'cad.export'

  // Clinic administration
  | 'clinic.manage'
  | 'clinic.settings'
  | 'clinic.integrations'

  // Lab administration
  | 'lab.manage'
  | 'lab.production'
  | 'lab.inventory'

  // Staff management
  | 'staff.read'
  | 'staff.manage'
  | 'staff.invite'

  // Reports & analytics
  | 'reports.view'
  | 'reports.export'

  // Platform (super_admin only)
  | 'platform.clinics'
  | 'platform.billing'
  | 'platform.users'
