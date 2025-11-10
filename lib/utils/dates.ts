/**
 * Date formatting utilities using Intl.DateTimeFormat for consistency
 */

/**
 * Format a date to a readable string
 * @example "Nov 10, 2025"
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

/**
 * Format a date with time
 * @example "Nov 10, 2025 at 2:30 PM"
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(d);
}

/**
 * Format a date for form inputs (YYYY-MM-DD)
 */
export function formatDateForInput(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

/**
 * Format a datetime for form inputs (YYYY-MM-DDTHH:mm)
 */
export function formatDateTimeForInput(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().slice(0, 16);
}

/**
 * Get relative time string
 * @example "2 hours ago", "in 3 days"
 */
export function getRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
  if (diffDays < 0) return `${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''} ago`;
  if (diffHours > 0) return `in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
  if (diffHours < 0) return `${Math.abs(diffHours)} hour${Math.abs(diffHours) > 1 ? 's' : ''} ago`;
  if (diffMin > 0) return `in ${diffMin} minute${diffMin > 1 ? 's' : ''}`;
  if (diffMin < 0) return `${Math.abs(diffMin)} minute${Math.abs(diffMin) > 1 ? 's' : ''} ago`;
  return 'just now';
}

/**
 * Check if a date is in the past
 */
export function isPast(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d < new Date();
}

/**
 * Check if a date is in the future
 */
export function isFuture(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d > new Date();
}

/**
 * Check if a date is today
 */
export function isToday(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

/**
 * Get ISO string for current date/time
 */
export function now(): string {
  return new Date().toISOString();
}

/**
 * Add days to a date
 */
export function addDays(date: string | Date, days: number): Date {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Add hours to a date
 */
export function addHours(date: string | Date, hours: number): Date {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  d.setHours(d.getHours() + hours);
  return d;
}
