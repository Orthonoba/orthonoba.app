export interface DentalOrder {
  id: string;
  clinicId: string;
  patientId: string;
  type: "aligner" | "retainer" | "mouthguard" | "sleep-apnea";
  status: "new" | "in-progress" | "completed" | "delivered";
  createdAt: string;
  dueDate?: string;
  notes?: string;
}
