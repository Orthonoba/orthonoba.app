export interface Clinic {
  id: string;
  name: string;
  subdomain: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
  createdAt: string;
}

export interface StaffMember {
  id: string;
  clinicId: string;
  name: string;
  role: "admin" | "dentist" | "assistant" | "lab";
  email: string;
}
