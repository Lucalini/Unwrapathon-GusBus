import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { dataCompiler } from '../services/dataCompiler';
import { apiService } from '../services/apiService';
import { webHistoryTracker } from '../utils/webHistoryTracker';
import { patternDetector } from '../utils/patternDetector';
import { sendMessageToChatbot } from '../chatbot/chatbotApi';
import './ChatWidget.css';

interface ChatWidgetProps {
  onClose?: () => void;
}

const ChatWidget: React.FC<ChatWidgetProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoOpenReason, setAutoOpenReason] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastURLRef = useRef<string>('');

  // Track page visit and check for patterns
  useEffect(() => {
    webHistoryTracker.trackCurrentPage();
    patternDetector.trackVisit(window.location.href);
    lastURLRef.current = window.location.href;

    // Check if we should auto-open based on patterns
    const patternCheck = patternDetector.shouldShowHelp();
    if (patternCheck.show && !isOpen) {
      console.log('🤖 Auto-opening chat due to pattern detection');
      setAutoOpenReason(patternCheck.reason || 'repeated_visits');
      setIsOpen(true);
      patternDetector.markPromptShown();
    }
  }, []);

  // Monitor URL changes (for SPAs)
  useEffect(() => {
    const checkURLChange = setInterval(() => {
      if (window.location.href !== lastURLRef.current) {
        console.log('🔄 URL changed, tracking visit');
        webHistoryTracker.trackCurrentPage();
        patternDetector.trackVisit(window.location.href);
        lastURLRef.current = window.location.href;

        // Check patterns on URL change
        const patternCheck = patternDetector.shouldShowHelp();
        if (patternCheck.show && !isOpen) {
          console.log('🤖 Auto-opening chat due to pattern detection');
          setAutoOpenReason(patternCheck.reason || 'repeated_visits');
          setIsOpen(true);
          patternDetector.markPromptShown();
        }
      }
    }, 1000);

    return () => clearInterval(checkURLChange);
  }, [isOpen]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleToggleChat = () => {
    if (isOpen && autoOpenReason) {
      // User is closing an auto-opened chat - mark as dismissed
      patternDetector.markDismissed();
      setAutoOpenReason(null);
    }
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      Sender: 'User',
      Timestamp: new Date().toISOString(),
      Text: inputValue.trim()
    };

    const messageText = inputValue.trim();
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Get chatbot response with web history context
    try {
      const webHistory = webHistoryTracker.getHistory();
      const botResponseText = await sendMessageToChatbot(
        messageText, 
        [...messages, userMessage],
        webHistory // Pass web history for context-aware responses
      );
      const botMessage: ChatMessage = {
        Sender: 'Chatbot',
        Timestamp: new Date().toISOString(),
        Text: botResponseText
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting chatbot response:', error);
      // Fallback message
      const botMessage: ChatMessage = {
        Sender: 'Chatbot',
        Timestamp: new Date().toISOString(),
        Text: 'I apologize, but I\'m having trouble responding right now. Please try again.'
      };
      setMessages(prev => [...prev, botMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEndConversation = async () => {
    setIsSubmitting(true);

    try {
      // Compile all data
      const compiledData = await dataCompiler.compileData(messages);
      
      console.log('Compiled data:', compiledData);

      // Send to backend
      await apiService.submitReview(compiledData);

      // Clear messages and close
      setMessages([]);
      setIsOpen(false);
      
      alert('Conversation submitted successfully!');
    } catch (error) {
      console.error('Error submitting conversation:', error);
      alert('Error submitting conversation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="chat-widget-container">
      {/* Floating Chat Button */}
      {!isOpen && (
        <button 
          className="chat-toggle-button"
          onClick={handleToggleChat}
          aria-label="Open chat"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z" fill="white"/>
          </svg>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          {/* Header */}
          <div className="chat-header">
            <h3>AI Assistant</h3>
            <button 
              className="close-button"
              onClick={handleToggleChat}
              aria-label="Close chat"
            >
              ×
            </button>
          </div>

          {/* Messages Container */}
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="welcome-message">
                {autoOpenReason === 'repeated_visits' ? (
                  <>
                    <p>👋 Hi! I noticed you've been browsing this page a few times.</p>
                    <p>Can I help you find something or answer any questions?</p>
                  </>
                ) : (
                  <p>👋 Hello! How can I help you today?</p>
                )}
              </div>
            ) : (
              messages.map((message, index) => (
                <div 
                  key={index}
                  className={`message ${message.Sender === 'User' ? 'user-message' : 'bot-message'}`}
                >
                  <div className="message-content">
                    <span className="message-sender">{message.Sender}</span>
                    <p>{message.Text}</p>
                    <span className="message-timestamp">
                      {new Date(message.Timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="chat-input-container">
            <input
              type="text"
              className="chat-input"
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isSubmitting}
            />
            <button 
              className="send-button"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isSubmitting}
              aria-label="Send message"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 10L18 2L10 18L8 10L2 10Z" fill="white"/>
              </svg>
            </button>
          </div>

          {/* End Conversation Button */}
          {messages.length > 0 && (
            <div className="chat-footer">
              <button 
                className="end-conversation-button"
                onClick={handleEndConversation}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'End Conversation & Submit'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatWidget;

