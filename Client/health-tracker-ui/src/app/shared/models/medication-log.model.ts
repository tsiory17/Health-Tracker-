import { DoseStatus } from './dose-status.enum';

export interface MedicationDoseResponse {
  doseId: number;
  medicationId: number;
  medicationName: string;
  dosage: string;
  scheduledTime: Date;
  takenAt?: Date;
  status: DoseStatus;
  notes?: string;
}

export interface DosesSummary {
  totalScheduled: number;
  taken: number;
  skipped: number;
  missed: number;
  pending: number;
}

export interface UpdateDoseStatusRequest {
  status: DoseStatus;
  notes?: string;
}
