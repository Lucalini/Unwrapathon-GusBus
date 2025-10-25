// TypeScript interfaces for the data structures

export interface ChatMessage {
  Sender: 'User' | 'Chatbot';
  Timestamp: string; // ISO 8601 format
  Text: string;
}

export interface WebPageVisit {
  URL: string;
  VisitTime: string; // ISO 8601 format
  FullPageHTML: string;
}

export interface Geolocation {
  City: string;
  Country: string;
}

export interface UserMetadata {
  Email: string;
  SubscriptionLevel: string; // e.g., 'Free', 'Premium', 'Pro'
  Geolocation: Geolocation;
}

export interface RawCustomerReviewInput {
  CustomerID: string;
  ReviewSubmissionTimestamp: string; // ISO 8601 format
  UserMetadata: UserMetadata;
  RawChatHistory: ChatMessage[];
  RawWebHistory: WebPageVisit[];
}

export interface ChatWidgetState {
  isOpen: boolean;
  messages: ChatMessage[];
  currentInput: string;
}

