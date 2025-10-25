import { RawCustomerReviewInput } from '../types';

// Real backend API endpoint (AWS API Gateway)
const API_ENDPOINT = 'https://cfex7cfhal.execute-api.us-west-2.amazonaws.com/prod/reviews';

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
        const errorText = await response.text();
        
        // Check for CORS issues
        if (response.status === 403 && errorText.includes('MissingAuthenticationToken')) {
          throw new Error(
            'CORS Error: The backend API needs CORS configuration. ' +
            'Please enable CORS for the /prod/review endpoint in AWS API Gateway. ' +
            'See CORS_SETUP_GUIDE.md for instructions.'
          );
        }
        
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      console.log('Review submitted successfully:', result);
      
      return result;
    } catch (error) {
      // Check if it's a network/CORS error (before request even completes)
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.error('❌ CORS Error: Unable to reach backend API');
        console.error('The backend needs CORS enabled. See CORS_SETUP_GUIDE.md');
        throw new Error(
          'CORS Error: Cannot connect to backend. ' +
          'Please enable CORS on the API Gateway endpoint.'
        );
      }
      
      console.error('Error submitting review:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();

