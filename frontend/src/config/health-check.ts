// Health Check Configuration
export const HEALTH_CHECK_CONFIG = {
  // Default interval in minutes
  DEFAULT_INTERVAL_MINUTES: 5,

  // Alternative interval options
  INTERVALS: {
    FIVE_MINUTES: 5,
    TEN_MINUTES: 10,
    FIFTEEN_MINUTES: 15,
  },

  // Retry configuration
  RETRY: {
    MAX_ATTEMPTS: 3,
    RETRY_DELAY_MS: 30 * 1000, // 30 seconds
  },

  // Request timeout in milliseconds
  REQUEST_TIMEOUT_MS: 10 * 1000, // 10 seconds

  // Environment-specific settings
  PRODUCTION: {
    AUTO_START: true,
    INTERVAL_MINUTES: 10,
  },

  DEVELOPMENT: {
    AUTO_START: true,
    INTERVAL_MINUTES: 10,
    SHOW_DEBUG_UI: true,
  },
} as const;

// Get current environment configuration
export function getHealthCheckConfig() {
  if (import.meta.env.PROD) {
    return HEALTH_CHECK_CONFIG.PRODUCTION;
  }
  return HEALTH_CHECK_CONFIG.DEVELOPMENT;
} 