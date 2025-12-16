/**
 * Parses a dosage string into amount and unit components
 * @param dosageStr - Dosage string like "500mg", "2 tablets", "10ml"
 * @returns Object with amount (number) and unit (string)
 * @example parseDosage("500mg") // { amount: 500, unit: "mg" }
 */
export function parseDosage(dosageStr: string): { amount: number, unit: string } {
  // Match number at start followed by optional text
  const match = dosageStr.match(/^([\d.]+)(.*)$/);
  if (match) {
    return {
      amount: parseFloat(match[1]),
      unit: match[2].trim() || 'mg' // Default to 'mg' if no unit specified
    };
  }
  // Fallback for malformed data
  return { amount: 0, unit: 'mg' };
}

/**
 * Combines dosage amount and unit into a single string
 * @param amount - Numeric dosage amount
 * @param unit - Unit string (mg, ml, tablets, etc.)
 * @returns Combined dosage string
 * @example combineDosage(500, "mg") // "500mg"
 */
export function combineDosage(amount: number, unit: string): string {
  return `${amount}${unit}`;
}
