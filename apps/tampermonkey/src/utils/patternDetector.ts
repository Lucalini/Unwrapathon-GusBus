/**
 * Pattern Detector - Detects user behavior patterns that suggest confusion
 */

interface URLVisit {
  url: string;
  timestamp: number;
}

const STORAGE_KEY_VISITS = 'tampermonkey_url_visits';
const STORAGE_KEY_LAST_PROMPT = 'tampermonkey_last_auto_prompt';
const STORAGE_KEY_DISMISSED = 'tampermonkey_dismissed_patterns';

// Configuration
const CONFIG = {
  REPEATED_VISIT_THRESHOLD: 3,      // Number of visits to trigger
  TIME_WINDOW_MS: 10 * 60 * 1000,   // 10 minutes
  COOLDOWN_MS: 5 * 60 * 1000,       // 5 minute cooldown between prompts
  SESSION_COOLDOWN_MS: 30 * 60 * 1000, // 30 minute session cooldown
  MAX_STORED_VISITS: 50             // Limit storage
};

export class PatternDetector {
  private isLocalStorageAvailable: boolean = false;

  constructor() {
    this.checkLocalStorageAvailability();
    this.cleanOldData();
  }

  /**
   * Check if localStorage is accessible
   */
  private checkLocalStorageAvailability(): void {
    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      this.isLocalStorageAvailable = true;
    } catch (error) {
      this.isLocalStorageAvailable = false;
    }
  }

  /**
   * Clean old visit data
   */
  private cleanOldData(): void {
    if (!this.isLocalStorageAvailable) return;

    try {
      const visits = this.getVisits();
      const now = Date.now();
      const cutoff = now - CONFIG.TIME_WINDOW_MS;

      // Keep only recent visits
      const recentVisits = visits.filter(v => v.timestamp > cutoff);
      
      // Limit to max stored visits
      const limitedVisits = recentVisits.slice(-CONFIG.MAX_STORED_VISITS);
      
      localStorage.setItem(STORAGE_KEY_VISITS, JSON.stringify(limitedVisits));
    } catch (error) {
      console.error('Error cleaning pattern data:', error);
    }
  }

  /**
   * Get all stored visits
   */
  private getVisits(): URLVisit[] {
    if (!this.isLocalStorageAvailable) return [];

    try {
      const stored = localStorage.getItem(STORAGE_KEY_VISITS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Track a URL visit
   */
  trackVisit(url: string): void {
    if (!this.isLocalStorageAvailable) return;

    try {
      const visits = this.getVisits();
      visits.push({
        url: this.normalizeURL(url),
        timestamp: Date.now()
      });

      localStorage.setItem(STORAGE_KEY_VISITS, JSON.stringify(visits));
      this.cleanOldData();
    } catch (error) {
      console.error('Error tracking visit:', error);
    }
  }

  /**
   * Normalize URL (remove hash, query params for comparison)
   */
  private normalizeURL(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.origin + urlObj.pathname;
    } catch {
      return url;
    }
  }

  /**
   * Check if we should show help prompt based on patterns
   */
  shouldShowHelp(): { show: boolean; reason?: string; url?: string } {
    if (!this.isLocalStorageAvailable) {
      return { show: false };
    }

    // Check cooldown
    if (this.isInCooldown()) {
      return { show: false };
    }

    // Check if user dismissed recently
    if (this.wasRecentlyDismissed()) {
      return { show: false };
    }

    // Detect repeated visits to same URL
    const repeatedURL = this.detectRepeatedVisits();
    if (repeatedURL) {
      return {
        show: true,
        reason: 'repeated_visits',
        url: repeatedURL
      };
    }

    return { show: false };
  }

  /**
   * Detect if user has visited the same URL multiple times
   */
  private detectRepeatedVisits(): string | null {
    const visits = this.getVisits();
    const now = Date.now();
    const cutoff = now - CONFIG.TIME_WINDOW_MS;

    // Filter to recent visits
    const recentVisits = visits.filter(v => v.timestamp > cutoff);

    // Count visits per URL
    const urlCounts = new Map<string, number>();
    for (const visit of recentVisits) {
      urlCounts.set(visit.url, (urlCounts.get(visit.url) || 0) + 1);
    }

    // Find URLs with repeated visits
    for (const [url, count] of urlCounts.entries()) {
      if (count >= CONFIG.REPEATED_VISIT_THRESHOLD) {
        console.log(`🔔 Pattern detected: User visited ${url} ${count} times in last 10 minutes`);
        return url;
      }
    }

    return null;
  }

  /**
   * Check if we're in cooldown period
   */
  private isInCooldown(): boolean {
    if (!this.isLocalStorageAvailable) return false;

    try {
      const lastPrompt = localStorage.getItem(STORAGE_KEY_LAST_PROMPT);
      if (!lastPrompt) return false;

      const lastPromptTime = parseInt(lastPrompt, 10);
      const now = Date.now();
      return (now - lastPromptTime) < CONFIG.COOLDOWN_MS;
    } catch {
      return false;
    }
  }

  /**
   * Check if user dismissed pattern help recently
   */
  private wasRecentlyDismissed(): boolean {
    if (!this.isLocalStorageAvailable) return false;

    try {
      const dismissed = localStorage.getItem(STORAGE_KEY_DISMISSED);
      if (!dismissed) return false;

      const dismissedTime = parseInt(dismissed, 10);
      const now = Date.now();
      return (now - dismissedTime) < CONFIG.SESSION_COOLDOWN_MS;
    } catch {
      return false;
    }
  }

  /**
   * Mark that we showed help prompt
   */
  markPromptShown(): void {
    if (!this.isLocalStorageAvailable) return;

    try {
      localStorage.setItem(STORAGE_KEY_LAST_PROMPT, Date.now().toString());
    } catch (error) {
      console.error('Error marking prompt shown:', error);
    }
  }

  /**
   * Mark that user dismissed the help prompt
   */
  markDismissed(): void {
    if (!this.isLocalStorageAvailable) return;

    try {
      localStorage.setItem(STORAGE_KEY_DISMISSED, Date.now().toString());
    } catch (error) {
      console.error('Error marking dismissed:', error);
    }
  }

  /**
   * Clear all pattern data (for testing)
   */
  clearData(): void {
    if (!this.isLocalStorageAvailable) return;

    try {
      localStorage.removeItem(STORAGE_KEY_VISITS);
      localStorage.removeItem(STORAGE_KEY_LAST_PROMPT);
      localStorage.removeItem(STORAGE_KEY_DISMISSED);
    } catch (error) {
      console.error('Error clearing pattern data:', error);
    }
  }
}

// Singleton instance
export const patternDetector = new PatternDetector();

