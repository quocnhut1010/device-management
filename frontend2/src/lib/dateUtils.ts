/**
 * Date formatting utilities with proper timezone handling
 * Ensures dates are displayed correctly in Vietnam timezone (Asia/Ho_Chi_Minh)
 */

/**
 * Parse date string safely to avoid timezone shift issues
 * For date-only strings (YYYY-MM-DD), parse as local date
 * @param dateStr - Date string
 * @returns Date object or null if invalid
 */
function parseDateSafely(dateStr: string): Date | null {
  try {
    // If date string is in date-only format (YYYY-MM-DD), parse as local date
    const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/
    if (dateOnlyPattern.test(dateStr)) {
      const [year, month, day] = dateStr.split('-').map(Number)
      // month is 0-indexed in JavaScript Date
      return new Date(year, month - 1, day)
    }
    
    // If date string has time but no timezone, treat as local
    const dateTimePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/
    if (dateTimePattern.test(dateStr)) {
      const [datePart, timePart] = dateStr.split('T')
      const [year, month, day] = datePart.split('-').map(Number)
      const [hour, minute, second] = timePart.split(':').map(Number)
      return new Date(year, month - 1, day, hour, minute, second)
    }
    
    // Otherwise, use standard Date parsing
    return new Date(dateStr)
  } catch (error) {
    console.error('Error parsing date:', error)
    return null
  }
}

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
    let dateObj: Date
    if (typeof date === 'string') {
      const parsed = parseDateSafely(date)
      if (!parsed || Number.isNaN(parsed.getTime())) return '—'
      dateObj = parsed
    } else {
      dateObj = date
      if (Number.isNaN(dateObj.getTime())) return '—'
    }

    const timezone = options?.timezone || 'Asia/Ho_Chi_Minh'
    const withTime = options?.withTime ?? false

    // For date-only formatting, format directly from date components to avoid timezone shift
    if (!withTime) {
      // Extract date components from local date to avoid timezone conversion issues
      const year = dateObj.getFullYear()
      const month = dateObj.getMonth() + 1 // getMonth() returns 0-11
      const day = dateObj.getDate()
      
      // Format as DD/MM/YYYY (Vietnamese format)
      return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`
    }

    // For date-time formatting, use timezone conversion
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
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

