# Quick Start Guide

Get the AI Agent Chat Widget running in 5 minutes!

## Prerequisites

- Node.js 16+ installed
- npm or yarn
- Tampermonkey browser extension

## Step 1: Install Dependencies

```bash
cd apps/tampermokney
npm install
```

## Step 2: Start Development Server

```bash
npm run dev
```

The widget will be available at `http://localhost:5173`

## Step 3: Install Tampermonkey Script

1. Install [Tampermonkey](https://www.tampermonkey.net/) extension in your browser
2. Open Tampermonkey Dashboard (click extension icon → Dashboard)
3. Click the "+" tab to create a new script
4. Replace the default content with the contents of `userscript.js`
5. Save (Ctrl+S or Cmd+S)

## Step 4: Test the Widget

1. Navigate to any website (e.g., `https://www.example.com`)
2. You should see a purple gradient chat button in the bottom right corner
3. Click it to open the chat
4. Type a message and press Enter
5. The chatbot will respond automatically
6. Click "End Conversation & Submit" to compile and send data

## What Happens When You Submit?

1. **Chat History** is compiled with timestamps
2. **Web Navigation History** (last 10 pages) is collected
3. **User Metadata** (email, subscription, location) is gathered
4. All data is formatted into JSON schema
5. Data is sent to the backend API endpoint

## Check the Data

Open browser console (F12) and click "End Conversation & Submit". You'll see:

```javascript
Compiled data: {
  CustomerID: "customer_...",
  ReviewSubmissionTimestamp: "2025-10-25T...",
  UserMetadata: {...},
  RawChatHistory: [...],
  RawWebHistory: [...]
}
```

## Customization

### Change Target Domains

Edit `userscript.js`:

```javascript
const CONFIG = {
    allowedDomains: ['yoursite.com'],
    injectOnAllSites: false, // Restrict to specific domains
};
```

### Update API Endpoints

Edit `src/services/apiService.ts`:
```typescript
const API_ENDPOINT = 'https://your-backend.com/api';
```

Edit `src/chatbot/chatbotApi.ts`:
```typescript
const CHATBOT_API_ENDPOINT = 'https://your-chatbot.com/api';
```

Then rebuild:
```bash
npm run build
```

## Troubleshooting

### Widget Not Appearing?

1. **Check Tampermonkey is enabled**: Click extension icon, ensure script is running
2. **Check domain restrictions**: Set `injectOnAllSites: true` in `userscript.js`
3. **Verify dev server is running**: Should see "Local: http://localhost:5173" in terminal
4. **Check browser console**: Look for errors or "AI Agent Chat Widget loaded" message

### Chatbot Not Responding?

The default implementation uses fallback responses. To integrate a real AI:

1. Update `src/chatbot/chatbotApi.ts` with your AI API
2. Set proper API endpoint and authentication
3. Rebuild the widget

### Module Errors in Console?

If you see React module errors before running `npm install`, that's normal. Run:
```bash
npm install
```

## File Structure

```
📁 apps/tampermokney/
├── 📄 userscript.js          ← Tampermonkey script (install this)
├── 📁 src/
│   ├── 📁 components/
│   │   ├── ChatWidget.tsx    ← Main UI component
│   │   └── ChatWidget.css    ← Styles
│   ├── 📁 services/
│   │   ├── apiService.ts     ← Backend API
│   │   └── dataCompiler.ts   ← JSON schema compiler
│   ├── 📁 chatbot/
│   │   └── chatbotApi.ts     ← AI chatbot integration
│   ├── 📁 utils/
│   │   └── webHistoryTracker.ts ← Track page visits
│   └── 📁 types/
│       └── index.ts          ← TypeScript types
├── 📄 package.json
├── 📄 README.md              ← Full documentation
└── 📄 DEPLOYMENT.md          ← Production deployment guide
```

## Next Steps

- ✅ Widget is working locally
- 📝 Customize UI colors in `ChatWidget.css`
- 🤖 Connect real AI chatbot API
- 🔧 Set up backend to receive data
- 🚀 Deploy to production (see `DEPLOYMENT.md`)

## Need Help?

- Check `README.md` for detailed documentation
- Review `TampermonkeyWidgetIssues.txt` for requirements
- Open an issue on GitHub

---

**That's it! You now have a working AI chat widget that can be injected into any website.** 🎉

