/**
 * Chatbot API Integration
 * This module handles communication with the AI chatbot service
 */

import { ChatMessage, WebPageVisit } from '../types';

// Real AI chatbot endpoint (AWS API Gateway)
const CHATBOT_API_ENDPOINT = 'https://cfex7cfhal.execute-api.us-west-2.amazonaws.com/prod/chat';

export interface ChatbotResponse {
  RawChatHistory: ChatMessage[];
}

/**
 * Send a message to the chatbot and get a response
 * @param message - The user's message
 * @param conversationHistory - The chat history
 * @param webHistory - Optional web history for context-aware responses
 */
export async function sendMessageToChatbot(
  message: string,
  conversationHistory: ChatMessage[],
  webHistory?: WebPageVisit[]
): Promise<string> {
  try {
    console.log('Sending message to chatbot:', message);
    console.log('Conversation history:', conversationHistory);
    if (webHistory && webHistory.length > 0) {
      console.log('Including web history:', webHistory.length, 'pages');
    }

    // Build request body according to ChatbotRequest schema
    const requestBody: {
      RawChatHistory: ChatMessage[];
      RawWebHistory?: WebPageVisit[];
    } = {
      RawChatHistory: conversationHistory,
    };

    // Include web history if available (allows context-aware responses)
    if (webHistory && webHistory.length > 0) {
      requestBody.RawWebHistory = webHistory;
    }

    // Call the real AI chatbot API
    const response = await fetch(CHATBOT_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Chatbot API error: ${response.status} - ${errorText}`);
    }

    const data: ChatbotResponse = await response.json();
    
    // The API returns the full chat history including the new bot message
    // Extract the last message (which should be from the Chatbot)
    const lastMessage = data.RawChatHistory[data.RawChatHistory.length - 1];
    
    if (lastMessage && lastMessage.Sender === 'Chatbot') {
      return lastMessage.Text;
    } else {
      throw new Error('Invalid response format from chatbot API');
    }
  } catch (error) {
    console.error('Error communicating with chatbot:', error);
    
    // Fallback response
    return generateFallbackResponse(message);
  }
}

/**
 * Generate a fallback response when the API is unavailable
 */
function generateFallbackResponse(userMessage: string): string {
  const responses = [
    "Thank you for your message! How can I assist you further?",
    "I understand. Is there anything specific I can help you with?",
    "I'm here to help! What would you like to know more about?",
    "Thanks for reaching out. Let me know if you have any questions.",
  ];

  // Simple keyword-based responses
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('help')) {
    return "I'm here to help! What do you need assistance with?";
  } else if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
    return "I can help you with pricing information. What product are you interested in?";
  } else if (lowerMessage.includes('shipping') || lowerMessage.includes('delivery')) {
    return "I can provide information about shipping and delivery. What would you like to know?";
  } else if (lowerMessage.includes('return') || lowerMessage.includes('refund')) {
    return "I can assist with returns and refunds. What's your concern?";
  }

  // Random response
  return responses[Math.floor(Math.random() * responses.length)];
}

