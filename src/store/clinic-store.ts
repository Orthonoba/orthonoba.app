import { create } from "zustand";

interface ClinicState {
  clinicId: string | null;
  clinicName: string | null;
  setClinic: (id: string, name: string) => void;
  clearClinic: () => void;
}

export const useClinicStore = create<ClinicState>((set) => ({
  clinicId: null,
  clinicName: null,
  setClinic: (id, name) =>
    set({
      clinicId: id,
      clinicName: name,
    }),
  clearClinic: () =>
    set({
      clinicId: null,
      clinicName: null,
    }),
}));
