import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { DateTime } from "luxon"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get user timezone consistently across the application
 * @param userSettings - User settings object that may contain timezone
 * @returns User's timezone string
 */
export function getUserTimezone(userSettings?: { timezone?: string }): string {
  return userSettings?.timezone || DateTime.now().zoneName || 'UTC'
}

/**
 * Get current date in user's timezone
 * @param userSettings - User settings object that may contain timezone
 * @returns Current date in user's timezone as ISO string
 */
export function getCurrentDateInUserTimezone(userSettings?: { timezone?: string }): string {
  const timezone = getUserTimezone(userSettings)
  return DateTime.now().setZone(timezone).toISODate() || ''
}
