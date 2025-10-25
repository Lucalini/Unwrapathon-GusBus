# Architecture Overview

This document explains the technical architecture of the AI Agent Chat Widget.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Host Website                             │
│  (e.g., lululemon.com, nike.com, homedepot.com, etc.)          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Tampermonkey injects
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Chat Widget (React App)                       │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   ChatUI     │  │  Web History │  │Data Compiler │         │
│  │  Component   │  │   Tracker    │  │   Service    │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                  │                  │                  │
│         └──────────────────┴──────────────────┘                  │
│                            │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │
            ┌────────────────┴────────────────┐
            │                                  │
            ▼                                  ▼
┌─────────────────────┐          ┌─────────────────────┐
│   Chatbot API       │          │   Backend API       │
│                     │          │                     │
│  - Process messages │          │  - Store reviews    │
│  - Generate replies │          │  - Process data     │
│  - AI/ML models     │          │  - Analytics        │
└─────────────────────┘          └─────────────────────┘
```

## Component Hierarchy

```
App
└── ChatWidget
    ├── FloatingButton (collapsed state)
    └── ChatWindow (expanded state)
        ├── ChatHeader
        ├── MessagesContainer
        │   └── Message[] (User/Bot)
        ├── InputContainer
        │   ├── TextInput
        │   └── SendButton
        └── FooterActions
            └── EndConversationButton
```

## Data Flow

### 1. User Opens Chat
```
User clicks button
    → ChatWidget.isOpen = true
    → WebHistoryTracker.trackCurrentPage()
    → Render ChatWindow
```

### 2. User Sends Message
```
User types message
    → handleSendMessage()
    → Create ChatMessage (User)
    → Add to messages state
    → Call sendMessageToChatbot()
    → Receive bot response
    → Create ChatMessage (Chatbot)
    → Add to messages state
```

### 3. User Ends Conversation
```
User clicks "End Conversation"
    → handleEndConversation()
    → DataCompiler.compileData()
        ├── Get chat history
        ├── Get web history (10 pages)
        ├── Get user metadata
        │   ├── Email
        │   ├── Subscription level
        │   └── Geolocation
        └── Format as JSON schema
    → ApiService.submitReview()
    → POST to backend
    → Clear state & close widget
```

## Module Responsibilities

### 🎨 **Components** (`src/components/`)

#### `ChatWidget.tsx`
- Main UI component
- State management (messages, isOpen, input)
- Event handlers (send, close, submit)
- Integration point for all services

**State:**
```typescript
{
  isOpen: boolean
  messages: ChatMessage[]
  inputValue: string
  isSubmitting: boolean
}
```

### 🔧 **Services** (`src/services/`)

#### `dataCompiler.ts`
**Purpose:** Compile all data into JSON schema format

**Methods:**
- `compileData(chatHistory)` - Main compilation function
- `generateCustomerId()` - Generate unique ID
- `getUserMetadata()` - Get user info
- `getUserGeolocation()` - Get location data

**Output Schema:**
```typescript
interface RawCustomerReviewInput {
  CustomerID: string
  ReviewSubmissionTimestamp: string
  UserMetadata: UserMetadata
  RawChatHistory: ChatMessage[]
  RawWebHistory: WebPageVisit[]
}
```

#### `apiService.ts`
**Purpose:** Handle backend communication

**Methods:**
- `submitReview(data)` - POST review to backend

**Configuration:**
- Endpoint: `API_ENDPOINT`
- Method: POST
- Headers: `Content-Type: application/json`

### 🤖 **Chatbot** (`src/chatbot/`)

#### `chatbotApi.ts`
**Purpose:** Integrate with AI chatbot service

**Methods:**
- `sendMessageToChatbot(message, history)` - Get AI response
- `generateFallbackResponse(message)` - Fallback when API unavailable

**Features:**
- Keyword-based fallback responses
- Conversation history context
- Error handling

### 🛠️ **Utils** (`src/utils/`)

#### `webHistoryTracker.ts`
**Purpose:** Track and store web navigation history

**Storage:** localStorage (`tampermonkey_web_history`)

**Data Structure:**
```typescript
interface WebPageVisit {
  URL: string
  VisitTime: string (ISO 8601)
  FullPageHTML: string (entire page HTML)
}
```

**Methods:**
- `trackCurrentPage()` - Capture current page
- `getHistory()` - Retrieve all visits (max 10)
- `clearHistory()` - Delete all tracked data

**Storage Strategy:**
- Ring buffer (FIFO)
- Max 10 items
- Persists across page reloads
- Full HTML snapshot per visit

### 📘 **Types** (`src/types/`)

#### `index.ts`
**Purpose:** TypeScript type definitions

**Interfaces:**
- `ChatMessage` - Individual message
- `WebPageVisit` - Page visit record
- `UserMetadata` - User profile
- `Geolocation` - Location data
- `RawCustomerReviewInput` - Complete payload

## Storage & Persistence

### localStorage Keys

| Key | Content | Max Size |
|-----|---------|----------|
| `tampermonkey_web_history` | WebPageVisit[] | 10 items |

**Note:** HTML snapshots can be large. Monitor localStorage usage.

## Security Considerations

### Content Security Policy (CSP)
The widget must work with strict CSP. Strategies:
- Inline styles avoided (external CSS)
- No `eval()` or `new Function()`
- External scripts from trusted CDN

### Cross-Origin Resource Sharing (CORS)
Backend APIs must allow cross-origin requests:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

### Data Privacy
- Full HTML capture includes sensitive data
- Implement opt-out mechanism
- Comply with GDPR/CCPA
- Secure data transmission (HTTPS)
- Encrypt sensitive fields

### XSS Prevention
- React automatically escapes content
- Validate all user input
- Sanitize HTML before storage
- Use Content Security Policy

## Performance Optimization

### Bundle Size
Current build output (~150-200KB):
- React: ~40KB (gzipped)
- React-DOM: ~130KB (gzipped)
- Widget code: ~20KB (gzipped)

**Optimization strategies:**
- Code splitting
- Lazy loading
- Tree shaking (Vite automatic)
- Minification (Vite automatic)

### Runtime Performance
- Virtual DOM (React)
- Memoization for expensive operations
- Debounce user input
- Throttle scroll events
- Lazy load history on demand

### Network Optimization
- Compress HTML before storage
- Batch API requests
- Implement request retry logic
- Use HTTP/2 multiplexing
- CDN for static assets

## Scalability

### Client-Side
- **Memory:** HTML storage can grow large
  - Solution: Compress with pako/lz-string
  - Solution: Limit HTML snapshot size
  
- **localStorage limit:** 5-10MB per origin
  - Solution: Use IndexedDB for larger storage
  - Solution: Implement storage quota monitoring

### Server-Side
- **Data volume:** Large HTML payloads
  - Solution: Backend compression
  - Solution: Async processing queue
  - Solution: Rate limiting

## Error Handling

### Strategy
1. **Graceful degradation:** Widget works even if APIs fail
2. **User feedback:** Show errors in UI
3. **Logging:** Console logs for debugging
4. **Retry logic:** Automatic retry for transient failures

### Error Types

| Error | Handling |
|-------|----------|
| Chatbot API failure | Show fallback responses |
| Backend API failure | Queue data, retry later |
| Storage quota exceeded | Clear old history |
| Network timeout | Show retry button |
| CORS error | Show configuration warning |

## Testing Strategy

### Unit Tests
- Test data compilation
- Test message formatting
- Test history tracking

### Integration Tests
- Test API communication
- Test data flow end-to-end

### E2E Tests
- Test on multiple websites
- Test different browsers
- Test mobile responsiveness

### Manual Testing Checklist
- [ ] Widget loads correctly
- [ ] Chat opens/closes smoothly
- [ ] Messages send and display
- [ ] History tracked correctly
- [ ] Data compiles properly
- [ ] Backend receives data
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Works with CSP
- [ ] CORS configured properly

## Monitoring & Observability

### Metrics to Track
- Widget load time
- Message send latency
- API success/failure rates
- Storage usage
- User engagement (messages per session)
- Conversion rate (conversations submitted)

### Logging
- Client-side: console.log (development)
- Production: Send to analytics service
- Error tracking: Sentry, Rollbar, etc.

### Analytics Events
```javascript
// Example events to track
'widget_loaded'
'chat_opened'
'message_sent'
'conversation_ended'
'data_submitted'
'api_error'
```

## Future Enhancements

### Planned Features
- [ ] File upload support
- [ ] Voice input
- [ ] Multi-language support
- [ ] Emoji reactions
- [ ] Typing indicators
- [ ] Read receipts
- [ ] Conversation history persistence
- [ ] Dark mode
- [ ] Customizable themes
- [ ] Analytics dashboard
- [ ] A/B testing framework

### Technical Improvements
- [ ] WebSocket for real-time chat
- [ ] Service Worker for offline support
- [ ] IndexedDB for larger storage
- [ ] Web Workers for processing
- [ ] Progressive Web App (PWA)
- [ ] Automated testing suite
- [ ] CI/CD pipeline
- [ ] Performance monitoring

---

## Key Design Decisions

### Why React?
- Component reusability
- Virtual DOM performance
- Rich ecosystem
- TypeScript support
- Easy to bundle

### Why Vite?
- Fast dev server (HMR)
- Optimized builds
- Modern ES modules
- Built-in TypeScript support
- Small bundle sizes

### Why localStorage?
- Simple API
- Synchronous access
- Persistent across sessions
- No server dependency
- Good for small data

### Why Full HTML Snapshots?
- Complete page context
- Capture dynamic content
- No API/scraping needed
- Works on any site
- Preserves state at visit time

---

**This architecture provides a solid foundation for a production-ready Tampermonkey widget that can scale to millions of users.**

