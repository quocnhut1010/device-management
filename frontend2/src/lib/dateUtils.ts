/**
 * Date formatting utilities with proper timezone handling
 * Ensures dates are displayed correctly in Vietnam timezone (Asia/Ho_Chi_Minh)
 */

/**
 * Format a date string or Date object with Vietnam timezone
 * @param date - Date string or Date object
 * @param options - Formatting options
 * @returns Formatted date string or '—' if invalid
 */
export function formatDate(
  date?: string | Date | null,
  options?: { withTime?: boolean; timezone?: string }
): string {
  if (!date) return '—'

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    if (Number.isNaN(dateObj.getTime())) return '—'

    const timezone = options?.timezone || 'Asia/Ho_Chi_Minh'
    const withTime = options?.withTime ?? false

    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      ...(withTime && {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: timezone,
      }),
      timeZone: timezone,
    }).format(dateObj)
  } catch (error) {
    console.error('Error formatting date:', error)
    return '—'
  }
}

/**
 * Format date only (without time) in Vietnam timezone
 * @param date - Date string or Date object
 * @returns Formatted date string (DD/MM/YYYY) or '—' if invalid
 */
export function formatDateOnly(date?: string | Date | null): string {
  return formatDate(date, { withTime: false })
}

/**
 * Format date and time in Vietnam timezone
 * @param date - Date string or Date object
 * @returns Formatted date and time string or '—' if invalid
 */
export function formatDateTime(date?: string | Date | null): string {
  return formatDate(date, { withTime: true })
}

/**
 * Format date for display in tables (short format)
 * @param date - Date string or Date object
 * @returns Formatted date string or 'N/A' if invalid
 */
export function formatDateForTable(date?: string | Date | null): string {
  if (!date) return 'N/A'
  const formatted = formatDateOnly(date)
  return formatted === '—' ? 'N/A' : formatted
}

/**
 * Format date and time for display in tables
 * @param date - Date string or Date object
 * @returns Formatted date and time string or 'N/A' if invalid
 */
export function formatDateTimeForTable(date?: string | Date | null): string {
  if (!date) return 'N/A'
  const formatted = formatDateTime(date)
  return formatted === '—' ? 'N/A' : formatted
}

