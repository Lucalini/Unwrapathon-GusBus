import { RawCustomerReviewInput } from '../types';

// Placeholder API endpoint - replace with actual backend URL
const API_ENDPOINT = 'https://api.example.com/customer-reviews';

/**
 * API Service - Handles communication with backend
 */
export class ApiService {
  /**
   * Send customer review data to backend
   */
  async submitReview(data: RawCustomerReviewInput): Promise<void> {
    try {
      console.log('Submitting review to backend:', data);

      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Review submitted successfully:', result);
    } catch (error) {
      console.error('Error submitting review:', error);
      // In a real implementation, you might want to queue the data for retry
      throw error;
    }
  }
}

export const apiService = new ApiService();

