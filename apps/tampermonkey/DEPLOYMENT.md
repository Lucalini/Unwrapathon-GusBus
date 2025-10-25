# Deployment Guide

This guide explains how to deploy the AI Agent Chat Widget to production.

## Build Process

### 1. Build the React Application

```bash
cd apps/tampermokney
npm run build
```

This creates optimized production files in the `dist/` directory.

### 2. Deploy to CDN/Hosting

You have several options for hosting:

#### Option A: Static File Hosting (Recommended)

**Services:**
- AWS S3 + CloudFront
- Netlify
- Vercel
- GitHub Pages
- Cloudflare Pages

**Steps (Example with Netlify):**

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Deploy:
```bash
cd apps/tampermokney
netlify deploy --prod
```

3. Note the deployment URL (e.g., `https://your-widget.netlify.app`)

#### Option B: Custom Server

Host the `dist/` directory on your own web server with CORS enabled.

**Nginx Configuration Example:**
```nginx
server {
    listen 443 ssl;
    server_name widget.yourdomain.com;
    
    root /path/to/dist;
    
    # Enable CORS
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods "GET, OPTIONS";
    add_header Access-Control-Allow-Headers "Content-Type";
    
    location / {
        try_files $uri $uri/ =404;
    }
}
```

### 3. Update Tampermonkey Script

Once deployed, update `userscript.js` with your production URLs:

```javascript
// Replace these with your actual hosted URLs
const WIDGET_JS_URL = 'https://your-cdn.com/assets/main.js';
const WIDGET_CSS_URL = 'https://your-cdn.com/assets/main.css';
```

**Finding the correct filenames:**

After building, check `dist/assets/` for the generated files. They will have hashes like:
- `main-abc123.js`
- `main-xyz789.css`

You can either:
1. Use the exact filenames with hashes
2. Configure Vite to use consistent names (see below)

### 4. Configure Vite for Consistent Filenames

Update `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/widget.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/widget.[ext]'
      }
    }
  }
})
```

This will create predictable filenames:
- `dist/assets/widget.js`
- `dist/assets/widget.css`

## Backend Setup

### 1. API Endpoint Configuration

The widget needs two backend endpoints:

#### A. Customer Review Submission Endpoint

**Endpoint:** `POST /api/customer-reviews`

**Request Body:**
```json
{
  "CustomerID": "string",
  "ReviewSubmissionTimestamp": "2025-10-25T19:09:41Z",
  "UserMetadata": {
    "Email": "user@example.com",
    "SubscriptionLevel": "Premium",
    "Geolocation": {
      "City": "San Francisco",
      "Country": "USA"
    }
  },
  "RawChatHistory": [...],
  "RawWebHistory": [...]
}
```

**Required Headers:**
- `Content-Type: application/json`
- `Access-Control-Allow-Origin: *` (CORS)

#### B. Chatbot API Endpoint

**Endpoint:** `POST /api/chat`

**Request Body:**
```json
{
  "message": "string",
  "history": [...]
}
```

**Response:**
```json
{
  "message": "string",
  "timestamp": "2025-10-25T19:09:41Z"
}
```

### 2. Update Configuration Files

**In `src/services/apiService.ts`:**
```typescript
const API_ENDPOINT = 'https://api.yourdomain.com/customer-reviews';
```

**In `src/chatbot/chatbotApi.ts`:**
```typescript
const CHATBOT_API_ENDPOINT = 'https://api.yourdomain.com/chat';
```

Rebuild after making these changes:
```bash
npm run build
```

## Tampermonkey Script Distribution

### Method 1: GitHub Gist

1. Create a GitHub Gist with your `userscript.js`
2. Get the "Raw" URL
3. Share with users: They can install directly from the raw URL

### Method 2: Greasy Fork

1. Create account on [Greasy Fork](https://greasyfork.org/)
2. Upload your userscript
3. Users can install from Greasy Fork

### Method 3: Direct Installation

1. Host `userscript.js` on your website
2. Provide installation instructions to users

## Environment Variables

For sensitive configuration, use environment variables:

Create `.env` file:
```bash
VITE_API_ENDPOINT=https://api.yourdomain.com
VITE_CHATBOT_ENDPOINT=https://chatbot.yourdomain.com
```

Update code to use environment variables:
```typescript
const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || 'fallback-url';
```

**Note:** Never commit `.env` to version control. Use `.env.example` for documentation.

## Testing Production Build

### Local Testing

```bash
npm run build
npm run preview
```

This serves the production build locally at `http://localhost:4173`

### Test Checklist

- [ ] Widget loads and displays correctly
- [ ] Chat functionality works
- [ ] Messages send and receive
- [ ] End conversation button compiles data
- [ ] Data sends to backend successfully
- [ ] Web history tracking works
- [ ] Geolocation detected correctly
- [ ] Works on target domains
- [ ] Mobile responsive
- [ ] No console errors

## Monitoring and Analytics

Consider adding:

1. **Error Tracking:**
   - Sentry
   - Rollbar
   - LogRocket

2. **Usage Analytics:**
   - Google Analytics
   - Mixpanel
   - Custom analytics endpoint

Example Sentry integration:
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production",
});
```

## Performance Optimization

### Code Splitting

The current build already uses code splitting via Vite. Monitor bundle sizes:

```bash
npm run build -- --mode production
```

### Lazy Loading

For larger widgets, consider lazy loading components:

```typescript
import { lazy, Suspense } from 'react';

const ChatWidget = lazy(() => import('./components/ChatWidget'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatWidget />
    </Suspense>
  );
}
```

## Security Considerations

1. **Content Security Policy (CSP):**
   - Widget must work with strict CSP
   - Test on sites with CSP headers

2. **Data Privacy:**
   - Ensure GDPR/CCPA compliance
   - Add privacy policy link
   - Implement data deletion API

3. **Authentication:**
   - Secure API endpoints
   - Use API keys/JWT tokens
   - Implement rate limiting

4. **XSS Prevention:**
   - Sanitize all user inputs
   - Use React's built-in XSS protection
   - Validate data before rendering

## Rollback Strategy

Keep multiple versions deployed:

```
https://cdn.yourdomain.com/v1.0.0/widget.js
https://cdn.yourdomain.com/v1.1.0/widget.js
https://cdn.yourdomain.com/latest/widget.js (symlink)
```

In case of issues, users can switch to previous version in their Tampermonkey script.

## Maintenance

### Regular Updates

1. Update dependencies monthly:
```bash
npm outdated
npm update
```

2. Security audits:
```bash
npm audit
npm audit fix
```

### Monitoring

Set up alerts for:
- High error rates
- API failures
- Performance degradation
- Usage spikes

## Support

For deployment issues, check:
1. Browser console logs
2. Network tab for failed requests
3. Backend API logs
4. CDN/hosting provider status

---

**Quick Start Production Checklist:**

1. ✅ Build the app: `npm run build`
2. ✅ Deploy `dist/` to CDN/hosting
3. ✅ Update API endpoints in code
4. ✅ Rebuild with production endpoints
5. ✅ Update `userscript.js` with CDN URLs
6. ✅ Test on multiple browsers/sites
7. ✅ Distribute Tampermonkey script
8. ✅ Monitor for errors and usage

Good luck with your deployment! 🚀

