import { DoseStatus } from './dose-status.enum';

export interface Medication {
  medicationId: number;
  userId: number;
  name: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  endDate?: Date;
  notes?: string;
  doseTimes?: string; // JSON array of times e.g., '["09:00","21:00"]'
}

export interface MedicationDose {
  doseId: number;
  medicationId: number;
  scheduledTime: Date;
  takenAt?: Date;
  isTaken: boolean;
  status: DoseStatus;
  notes?: string;
}
