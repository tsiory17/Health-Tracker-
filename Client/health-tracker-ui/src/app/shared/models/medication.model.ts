export interface Medication {
  
  medicationId: number;
  userId: number;
  name: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  endDate?: Date;
  notes?: string;
}

export interface MedicationDose {
  doseId: number;
  medicationId: number;
  scheduledTime: Date;
  takenAt?: Date;
  isTaken: boolean;
}
