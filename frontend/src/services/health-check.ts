import axios from 'axios';
import { HEALTH_CHECK_CONFIG } from '@/config/health-check';

// Get API base URL from environment or default to backend-nest
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

class HealthCheckService {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;
  private pingInterval = HEALTH_CHECK_CONFIG.DEFAULT_INTERVAL_MINUTES * 60 * 1000; // Default interval in milliseconds
  private retryInterval = HEALTH_CHECK_CONFIG.RETRY.RETRY_DELAY_MS; // Retry delay
  private maxRetries = HEALTH_CHECK_CONFIG.RETRY.MAX_ATTEMPTS;

  /**
   * Start the health check service
   * @param intervalMinutes - Optional custom interval in minutes (default: 5)
   */
  start(intervalMinutes: number = 5): void {
    if (this.isRunning) {
      console.log('Health check service is already running');
      return;
    }

    this.pingInterval = intervalMinutes * 60 * 1000;
    this.isRunning = true;

    console.log(`Starting health check service - pinging every ${intervalMinutes} minutes`);

    // Initial ping
    this.ping();

    // Set up interval
    this.intervalId = setInterval(() => {
      this.ping();
    }, this.pingInterval);
  }

  /**
   * Stop the health check service
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('Health check service stopped');
  }

  /**
   * Perform a single health check ping
   */
  private async ping(retryCount: number = 0): Promise<void> {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`, {
        timeout: HEALTH_CHECK_CONFIG.REQUEST_TIMEOUT_MS,
      });

      if (response.status === 200) {
        console.log(`✅ Health check successful - ${new Date().toISOString()}`);
      } else {
        console.warn(`⚠️ Health check returned status ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ Health check failed (attempt ${retryCount + 1}/${this.maxRetries + 1}):`, error);

      // Retry logic
      if (retryCount < this.maxRetries) {
        console.log(`Retrying in ${this.retryInterval / 1000} seconds...`);
        setTimeout(() => {
          this.ping(retryCount + 1);
        }, this.retryInterval);
      } else {
        console.error('Health check failed after maximum retries');
      }
    }
  }

  /**
   * Get the current status of the health check service
   */
  getStatus(): { isRunning: boolean; intervalMinutes: number } {
    return {
      isRunning: this.isRunning,
      intervalMinutes: this.pingInterval / (60 * 1000),
    };
  }

  /**
   * Manually trigger a health check
   */
  async manualPing(): Promise<boolean> {
    try {
      await this.ping();
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Create a singleton instance
const healthCheckService = new HealthCheckService();

export default healthCheckService; 