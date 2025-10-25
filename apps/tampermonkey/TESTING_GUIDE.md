# Testing Guide - Complete End-to-End Test

**All APIs are now integrated!** Here's how to test the full workflow.

## 🎯 Complete End-to-End Test

### Prerequisites
- Node.js installed
- Dev server running
- Browser with DevTools open (F12)

---

## Step-by-Step Test

### 1. Start Development Server

```bash
cd apps/tampermonkey
npm run dev
```

Expected output:
```
VITE v5.0.8  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

### 2. Open Browser

Navigate to: `http://localhost:5173`

**What you should see:**
- Mostly blank white page
- **Purple gradient chat button** in bottom-right corner
- Button has shadow and hover effect

---

### 3. Open Chat Widget

Click the purple chat button.

**What you should see:**
- Chat window slides in (380x600px)
- Purple gradient header: "AI Assistant"
- Welcome message: "👋 Hello! How can I help you today?"
- Input field at bottom
- Send button (►)

---

### 4. Test AI Chatbot (AWS Integration)

**Type a message:**
```
Hello! I'm looking for running shoes. What do you recommend?
```

**Press Enter or click Send button**

**Expected behavior:**
1. Your message appears on the right (purple bubble)
2. Brief pause (1-2 seconds)
3. AI response appears on the left (white bubble)
4. Response should be contextual and intelligent

**Check Console (F12 → Console tab):**
```javascript
Sending message to chatbot: "Hello! I'm looking for running shoes..."
Conversation history: [...]
// AI response will be logged
```

---

### 5. Continue Conversation

**Send follow-up messages:**
```
What size do you have available?
```
```
What's the price range?
```

**Expected behavior:**
- Bot maintains context from previous messages
- Responses are relevant to conversation flow
- Each message has timestamp

---

### 6. Test Backend Submission (Full Data Pipeline)

**Click "End Conversation & Submit" button** (red button at bottom)

**Expected behavior:**

1. **Console logs appear:**
```javascript
Submitting review to backend: {
  CustomerID: "customer_1729891234567_abc123",
  ReviewSubmissionTimestamp: "2025-10-25T20:30:00.000Z",
  UserMetadata: {
    Email: "user@example.com",
    SubscriptionLevel: "Free",
    Geolocation: {
      City: "Your City",
      Country: "Your Country"
    }
  },
  RawChatHistory: [
    {
      Sender: "User",
      Timestamp: "2025-10-25T20:25:00.000Z",
      Text: "Hello! I'm looking for running shoes..."
    },
    {
      Sender: "Chatbot",
      Timestamp: "2025-10-25T20:25:02.000Z",
      Text: "I'd be happy to help you find running shoes..."
    },
    // ... more messages
  ],
  RawWebHistory: [
    {
      URL: "http://localhost:5173",
      VisitTime: "2025-10-25T20:20:00.000Z",
      FullPageHTML: "<!DOCTYPE html>..."
    }
  ]
}

Review submitted successfully: { ... }
```

2. **Success alert appears:**
```
Conversation submitted successfully!
```

3. **Chat resets:**
- Messages cleared
- Chat window closes
- Widget returns to collapsed state

---

## 🔍 What to Check in Console

### Network Tab (F12 → Network)

**When sending chat message:**
```
Request URL: https://cfex7cfhal.execute-api.us-west-2.amazonaws.com/prod/chat
Method: POST
Status: 200 OK
```

**When submitting review:**
```
Request URL: https://cfex7cfhal.execute-api.us-west-2.amazonaws.com/prod/review
Method: POST
Status: 200 OK
```

---

## ✅ Success Criteria

### Chat Functionality
- [x] Chat button appears
- [x] Chat opens/closes smoothly
- [x] Messages display correctly
- [x] User messages on right (purple)
- [x] Bot messages on left (white)
- [x] Timestamps shown
- [x] Auto-scroll to bottom

### AI Integration
- [x] Bot responds within 1-3 seconds
- [x] Responses are contextual
- [x] Conversation history maintained
- [x] No console errors
- [x] Graceful error handling

### Data Submission
- [x] Submit button appears after messages
- [x] Data compiles correctly
- [x] Includes all required fields
- [x] Geolocation detected
- [x] Web history captured
- [x] Backend receives data (200 OK)
- [x] Success message shown
- [x] Chat resets properly

---

## 🐛 Troubleshooting

### Chat button not appearing
**Check:**
- Dev server is running
- No errors in console
- Correct URL (localhost:5173)

**Solution:**
```bash
# Stop and restart dev server
Ctrl+C
npm run dev
```

---

### Bot not responding
**Check console for:**
```javascript
Error communicating with chatbot: ...
```

**Possible causes:**
- Network issue
- API rate limit
- Invalid request format

**Fallback behavior:**
- Widget automatically uses fallback responses
- User experience not interrupted

---

### Submit button not working
**Check console for:**
```javascript
Error submitting review: ...
```

**Possible causes:**
- Backend API not available
- CORS issue
- Invalid data format

**Debug steps:**
1. Check Network tab for failed request
2. Look at error message details
3. Verify backend endpoint is correct

---

## 📊 Data Flow Diagram

```
User opens chat
    ↓
User types message
    ↓
Frontend → AWS Chatbot API
    ↓
AI processes with context
    ↓
Response displayed
    ↓
(repeat conversation)
    ↓
User clicks "End & Submit"
    ↓
Data Compiler runs:
  - Get chat history
  - Get web history (localStorage)
  - Get geolocation (IP API)
  - Generate customer ID
  - Format JSON schema
    ↓
Frontend → AWS Review API
    ↓
Backend receives full data:
  - CustomerID
  - Timestamp
  - UserMetadata
  - RawChatHistory
  - RawWebHistory
    ↓
Success response
    ↓
User sees confirmation
    ↓
Chat resets
```

---

## 🔬 Advanced Testing

### Test Web History Tracking

1. **Check localStorage:**
```javascript
// In browser console
console.log(JSON.parse(localStorage.getItem('tampermonkey_web_history')))
```

Expected output:
```javascript
[
  {
    URL: "http://localhost:5173",
    VisitTime: "2025-10-25T20:20:00.000Z",
    FullPageHTML: "<!DOCTYPE html>..."
  }
]
```

### Test Geolocation

1. **Check in compiled data:**
```javascript
// Look for in console after submit
UserMetadata: {
  Geolocation: {
    City: "San Francisco",
    Country: "United States"
  }
}
```

### Test Error Handling

1. **Simulate network failure:**
```javascript
// In browser console, before sending message
window.fetch = () => Promise.reject(new Error('Network error'))
```

2. **Send message** → Should use fallback response

3. **Refresh page** to restore fetch

---

## 📈 Performance Metrics

**Expected timings:**
- Widget load: < 500ms
- Chat open animation: 300ms
- Message send: < 100ms
- AI response: 1-3 seconds
- Data compilation: < 500ms
- Backend submission: < 1 second

---

## 🎉 Test Complete!

If all checks pass, your widget is **production-ready** for:
- ✅ Real AI conversations
- ✅ Complete data collection
- ✅ Backend integration
- ✅ Error handling
- ✅ User experience

**Next Steps:**
1. Test on target websites (with Tampermonkey)
2. Monitor backend data quality
3. Gather user feedback
4. Iterate and improve

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify Network tab shows successful requests
3. Review `API_INTEGRATION_STATUS.md` for configuration
4. Check `README.md` for troubleshooting

**All systems operational!** 🚀

