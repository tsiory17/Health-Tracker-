export interface Vital {
  vitalId: number;
  userId: number;
  recordedAt: Date;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  weight?: number;
}
