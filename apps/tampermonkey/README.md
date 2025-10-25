# AI Agent Chat Widget - Tampermonkey Extension

A React-based chat widget that can be injected into any website using Tampermonkey. Designed for customer support on e-commerce sites, it collects conversation data and web navigation history, then sends it to a backend for processing.

## Features

- 🎨 **Modern, Beautiful UI** - Gradient-styled chat interface with smooth animations
- 💬 **Real-time Chat** - Interactive chat with AI agent integration
- 📊 **Data Collection** - Automatically tracks:
  - Chat conversation history
  - Web page navigation (up to 10 most recent pages)
  - Full HTML snapshots of visited pages
  - User metadata and geolocation
- 📤 **Backend Integration** - Compiles and sends data in structured JSON format
- 🔧 **Customizable** - Easy to configure for specific domains or universal injection

## Project Structure

```
apps/tampermokney/
├── src/
│   ├── components/
│   │   ├── ChatWidget.tsx       # Main chat widget component
│   │   └── ChatWidget.css       # Widget styles
│   ├── services/
│   │   ├── apiService.ts        # Backend API communication
│   │   └── dataCompiler.ts      # JSON schema compilation
│   ├── chatbot/
│   │   └── chatbotApi.ts        # Chatbot API integration
│   ├── utils/
│   │   └── webHistoryTracker.ts # Web navigation tracking
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces
│   ├── App.tsx                  # Root component
│   ├── main.tsx                 # Entry point
│   └── index.css                # Global styles
├── userscript.js                # Tampermonkey userscript
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd apps/tampermokney
npm install
```

### 2. Development Mode

Start the development server:

```bash
npm run dev
```

This will start Vite dev server at `http://localhost:5173`

### 3. Build for Production

Build the widget for production:

```bash
npm run build
```

The bundled files will be in the `dist/` directory.

### 4. Install Tampermonkey Script

1. Install [Tampermonkey](https://www.tampermonkey.net/) browser extension
2. Open Tampermonkey Dashboard
3. Click "Create a new script"
4. Copy the contents of `userscript.js`
5. Paste into the editor
6. Update the URLs in the script:
   - For **development**: Use `http://localhost:5173` (already configured)
   - For **production**: Host your built files on a CDN and update the URLs

Example production URLs in `userscript.js`:
```javascript
const WIDGET_JS_URL = 'https://your-cdn.com/widget.js';
const WIDGET_CSS_URL = 'https://your-cdn.com/widget.css';
```

7. Save the script (Ctrl+S or Cmd+S)

## Configuration

### Domain Restrictions

By default, the widget injects on all sites. To restrict to specific domains, edit `userscript.js`:

```javascript
const CONFIG = {
    allowedDomains: [
        'lululemon.com',
        'nike.com',
        'homedepot.com',
        'doordash.com',
    ],
    injectOnAllSites: false, // Set to false to use domain restrictions
};
```

### API Endpoints

Update the following files with your actual API endpoints:

1. **Backend API** (`src/services/apiService.ts`):
```typescript
const API_ENDPOINT = 'https://your-api.com/customer-reviews';
```

2. **Chatbot API** (`src/chatbot/chatbotApi.ts`):
```typescript
const CHATBOT_API_ENDPOINT = 'https://your-api.com/chat';
```

### User Metadata

Update user metadata collection in `src/services/dataCompiler.ts`:

```typescript
private async getUserMetadata(): Promise<UserMetadata> {
  return {
    Email: 'user@example.com', // Get from auth system
    SubscriptionLevel: 'Free', // Get from user profile
    Geolocation: await this.getUserGeolocation()
  };
}
```

## Data Schema

The widget collects and sends data in the following JSON format:

```json
{
  "CustomerID": "string",
  "ReviewSubmissionTimestamp": "ISO 8601 datetime",
  "UserMetadata": {
    "Email": "string",
    "SubscriptionLevel": "string",
    "Geolocation": {
      "City": "string",
      "Country": "string"
    }
  },
  "RawChatHistory": [
    {
      "Sender": "User | Chatbot",
      "Timestamp": "ISO 8601 datetime",
      "Text": "string"
    }
  ],
  "RawWebHistory": [
    {
      "URL": "string",
      "VisitTime": "ISO 8601 datetime",
      "FullPageHTML": "string"
    }
  ]
}
```

## Usage

1. Navigate to any website (or configured domain)
2. Click the floating chat button (bottom right)
3. Chat with the AI assistant
4. Click "End Conversation & Submit" when done
5. Data is automatically compiled and sent to backend

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **CSS3** - Styling with gradients and animations

## Browser Compatibility

- Chrome/Edge: ✅
- Firefox: ✅
- Safari: ✅
- Opera: ✅

## Troubleshooting

### Widget not appearing

1. Check browser console for errors
2. Verify Tampermonkey script is enabled
3. Check domain restrictions in `userscript.js`
4. Ensure dev server is running (development mode)

### Chatbot not responding

1. Check `chatbotApi.ts` for correct API endpoint
2. Verify API is accessible (CORS settings)
3. Check browser network tab for failed requests

### Data not submitting

1. Verify `apiService.ts` has correct endpoint
2. Check backend API is running
3. Review browser console for error messages

## Contributing

This project follows the issues outlined in `TampermonkeyWidgetIssues.txt`:

- Issue #10: JS/React UI ✅
- Issue #11: Webpage navigation history ✅
- Issue #12: Chatbot API Integration ✅
- Issue #13: Collect data into JSON schema ✅
- Issue #14: Send JSON to backend ✅

## License

MIT

## Support

For issues and questions, please refer to the GitHub repository: [Lucalini/Unwrapathon-GusBus](https://github.com/Lucalini/Unwrapathon-GusBus)
