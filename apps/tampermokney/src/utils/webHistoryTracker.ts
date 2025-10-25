import { WebPageVisit } from '../types';

const MAX_HISTORY_ITEMS = 10;
const STORAGE_KEY = 'tampermonkey_web_history';

/**
 * Web History Tracker - Collects and stores up to 10 most recent page visits
 */
export class WebHistoryTracker {
  private history: WebPageVisit[] = [];

  constructor() {
    this.loadHistory();
  }

  /**
   * Load history from localStorage
   */
  private loadHistory(): void {
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
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.history));
    } catch (error) {
      console.error('Error saving web history:', error);
    }
  }

  /**
   * Track current page visit
   */
  trackCurrentPage(): void {
    const visit: WebPageVisit = {
      URL: window.location.href,
      VisitTime: new Date().toISOString(),
      FullPageHTML: document.documentElement.outerHTML
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
    localStorage.removeItem(STORAGE_KEY);
  }
}

// Singleton instance
export const webHistoryTracker = new WebHistoryTracker();

