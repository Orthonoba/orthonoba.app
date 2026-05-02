export interface Invoice {
  id: string;
  patientId: string;
  clinicId: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
  issuedDate: string;
  dueDate: string;
  notes?: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  method: "cash" | "card" | "transfer";
  amount: number;
  paymentDate: string;
}
