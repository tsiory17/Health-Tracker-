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
