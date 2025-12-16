/**
 * Data Transfer Object for creating/updating medications
 * Uses string dates for API compatibility (ISO format)
 */
export interface MedicationDto {
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string | null;
  notes?: string | null;
}
