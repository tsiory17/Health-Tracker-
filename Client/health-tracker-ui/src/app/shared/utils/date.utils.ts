/**
 * Formats a Date object to string format for HTML date input (yyyy-MM-dd)
 * @param date - Date object to format
 * @returns Formatted date string in yyyy-MM-dd format
 * @example formatDateForInput(new Date('2024-01-15')) // "2024-01-15"
 */
export function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Gets today's date formatted for HTML date input
 * @returns Today's date in yyyy-MM-dd format
 */
export function getTodayFormatted(): string {
  return formatDateForInput(new Date());
}

/**
 * Converts a date input string (yyyy-MM-dd) to ISO format preserving local date
 * without timezone conversion. Sends date at midnight in ISO format.
 * @param dateString - Date string in yyyy-MM-dd format
 * @returns ISO string representing midnight on that date (e.g., "2024-01-15T00:00:00")
 * @example formatDateToLocalISO("2024-01-15") // "2024-01-15T00:00:00"
 */
export function formatDateToLocalISO(dateString: string): string {
  // Don't use Date constructor as it may interpret timezone
  // Instead, build the ISO string directly
  return `${dateString}T00:00:00`;
}

/**
 * Parses a date from backend (which may include timezone) and extracts just the date portion
 * @param dateString - ISO date string from backend
 * @returns Date string in yyyy-MM-dd format
 * @example parseDateFromBackend("2024-01-15T00:00:00Z") // "2024-01-15"
 */
export function parseDateFromBackend(dateString: string): string {
  const date = new Date(dateString);
  return formatDateForInput(date);
}
