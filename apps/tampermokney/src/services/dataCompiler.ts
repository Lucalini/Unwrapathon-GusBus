import { ChatMessage, RawCustomerReviewInput, UserMetadata } from '../types';
import { webHistoryTracker } from '../utils/webHistoryTracker';

/**
 * Data Compiler - Compiles chat and web history into JSON schema format
 */
export class DataCompiler {
  /**
   * Generate a unique customer ID
   * In a real implementation, this would come from authentication or be generated securely
   */
  private generateCustomerId(): string {
    return `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get user geolocation
   * In a real implementation, this would use a geolocation API
   */
  private async getUserGeolocation(): Promise<{ City: string; Country: string }> {
    // Placeholder implementation
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      return {
        City: data.city || 'Unknown',
        Country: data.country_name || 'Unknown'
      };
    } catch (error) {
      console.error('Error fetching geolocation:', error);
      return {
        City: 'Unknown',
        Country: 'Unknown'
      };
    }
  }

  /**
   * Get user metadata
   * In a real implementation, this would come from authentication/user profile
   */
  private async getUserMetadata(): Promise<UserMetadata> {
    const geolocation = await this.getUserGeolocation();
    
    return {
      Email: 'user@example.com', // Placeholder
      SubscriptionLevel: 'Free', // Placeholder
      Geolocation: geolocation
    };
  }

  /**
   * Compile all data into the required JSON schema format
   */
  async compileData(chatHistory: ChatMessage[]): Promise<RawCustomerReviewInput> {
    const webHistory = webHistoryTracker.getHistory();
    const userMetadata = await this.getUserMetadata();

    const data: RawCustomerReviewInput = {
      CustomerID: this.generateCustomerId(),
      ReviewSubmissionTimestamp: new Date().toISOString(),
      UserMetadata: userMetadata,
      RawChatHistory: chatHistory,
      RawWebHistory: webHistory
    };

    return data;
  }
}

export const dataCompiler = new DataCompiler();

