import { WebPageVisit } from '../types';

const MAX_HISTORY_ITEMS = 10;
const STORAGE_KEY = 'tampermonkey_web_history';
const VERSION_KEY = 'tampermonkey_web_history_version';
const CURRENT_VERSION = '2.0'; // Incremented to clear old full-HTML entries
const MAX_HTML_SIZE = 50000; // Limit HTML to 50KB to avoid DynamoDB size limits

/**
 * Web History Tracker - Collects and stores up to 10 most recent page visits
 */
export class WebHistoryTracker {
  private history: WebPageVisit[] = [];
  private isLocalStorageAvailable: boolean = false;

  constructor() {
    this.checkLocalStorageAvailability();
    this.migrateDataIfNeeded();
    this.loadHistory();
  }

  /**
   * Clear old data if version changed (migration)
   */
  private migrateDataIfNeeded(): void {
    if (!this.isLocalStorageAvailable) {
      return;
    }

    try {
      const storedVersion = localStorage.getItem(VERSION_KEY);
      if (storedVersion !== CURRENT_VERSION) {
        console.log('🔄 Migrating web history data to new version');
        localStorage.removeItem(STORAGE_KEY);
        localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
      }
    } catch (error) {
      console.error('Error migrating web history:', error);
    }
  }

  /**
   * Check if localStorage is accessible (not blocked by iframe security)
   */
  private checkLocalStorageAvailability(): void {
    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      this.isLocalStorageAvailable = true;
    } catch (error) {
      // localStorage not available (iframe, private mode, etc.)
      this.isLocalStorageAvailable = false;
      console.warn('localStorage not available, web history will not persist');
    }
  }

  /**
   * Load history from localStorage
   */
  private loadHistory(): void {
    if (!this.isLocalStorageAvailable) {
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.history = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading web history:', error);
      this.history = [];
    }
  }

  /**
   * Save history to localStorage
   */
  private saveHistory(): void {
    if (!this.isLocalStorageAvailable) {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.history));
    } catch (error) {
      console.error('Error saving web history:', error);
    }
  }

  /**
   * Extract main content from the page
   * Tries multiple selectors to find the primary content area
   */
  private extractMainContent(): string {
    // Try to find main content using common selectors (in priority order)
    const selectors = [
      'main',                          // Semantic <main> tag
      '[role="main"]',                 // ARIA main role
      '#main',                         // Common ID
      '#content',                      // Common ID
      '.main-content',                 // Common class
      '.content',                      // Common class
      'article',                       // Article tag
      '[id*="content"]',               // Any ID containing "content"
      '[class*="content"]',            // Any class containing "content"
      'body > div:first-of-type'       // First major div in body
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.innerHTML && element.innerHTML.length > 100) {
        // Found a substantial content area
        const html = element.outerHTML;
        console.log(`📄 Captured main content using selector: ${selector} (${html.length} bytes)`);
        return this.truncateHTML(html);
      }
    }

    // Fallback: use entire body if we can't find main content
    console.log('📄 Using fallback: entire body');
    return this.truncateHTML(document.body.outerHTML);
  }

  /**
   * Truncate HTML to avoid exceeding DynamoDB size limits
   */
  private truncateHTML(html: string): string {
    if (html.length <= MAX_HTML_SIZE) {
      return html;
    }

    // Truncate and add a note
    const truncated = html.substring(0, MAX_HTML_SIZE);
    return truncated + '\n\n<!-- [TRUNCATED: Original size was ' + html.length + ' bytes] -->';
  }

  /**
   * Track current page visit
   */
  trackCurrentPage(): void {
    // Skip tracking if we're in an iframe (not the main page)
    if (window !== window.top) {
      return;
    }

    const visit: WebPageVisit = {
      URL: window.location.href,
      VisitTime: new Date().toISOString(),
      FullPageHTML: this.extractMainContent()
    };

    // Add to beginning of array
    this.history.unshift(visit);

    // Keep only the most recent MAX_HISTORY_ITEMS
    if (this.history.length > MAX_HISTORY_ITEMS) {
      this.history = this.history.slice(0, MAX_HISTORY_ITEMS);
    }

    this.saveHistory();
  }

  /**
   * Get all tracked history
   */
  getHistory(): WebPageVisit[] {
    return [...this.history];
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.history = [];
    if (this.isLocalStorageAvailable) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.error('Error clearing web history:', error);
      }
    }
  }
}

// Singleton instance
export const webHistoryTracker = new WebHistoryTracker();

