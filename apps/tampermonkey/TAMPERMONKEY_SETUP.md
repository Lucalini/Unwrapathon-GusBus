# Complete Tampermonkey Setup Guide

**Your widget is built!** Now let's make it work as a Tampermonkey script.

## ✅ What You Have

```
apps/tampermonkey/dist/
├── assets/
│   ├── index.js     (149 KB) ← Your widget code
│   └── index.css    (3.8 KB)  ← Your styles
└── userscript.js    ← Tampermonkey script (needs updating)
```

---

## 🚀 Setup Process (3 Options)

### Option 1: Quick Test with Local Files (Easiest)

For immediate testing on your computer:

#### Step 1: Serve the Built Files Locally

```bash
cd apps/tampermonkey/dist
python3 -m http.server 8080
```

Or with Node:
```bash
npx http-server dist -p 8080 --cors
```

Your files are now at:
- `http://localhost:8080/assets/index.js`
- `http://localhost:8080/assets/index.css`

#### Step 2: Create Updated Userscript

Create `userscript-local.js`:

```javascript
// ==UserScript==
// @name         AI Agent Chat Widget (Local)
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  AI agent chat widget for customer support
// @author       Your Name
// @match        https://*/*
// @match        http://*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';
    
    console.log('🚀 AI Agent Chat Widget Loading...');

    // Configuration
    const CONFIG = {
        injectOnAllSites: true, // Set to false to use allowedDomains
        allowedDomains: [
            'lululemon.com',
            'nike.com',
            'homedepot.com',
        ],
    };

    // Check if we should inject
    function shouldInject() {
        if (CONFIG.injectOnAllSites) return true;
        const domain = window.location.hostname;
        return CONFIG.allowedDomains.some(d => domain.includes(d));
    }

    if (!shouldInject()) {
        console.log('AI Widget: Domain not allowed');
        return;
    }

    // Inject CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'http://localhost:8080/assets/index.css';
    document.head.appendChild(link);

    // Inject JS
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'http://localhost:8080/assets/index.js';
    document.head.appendChild(script);

    console.log('✅ AI Agent Chat Widget Loaded');
})();
```

#### Step 3: Install in Tampermonkey

1. **Install Tampermonkey:**
   - Chrome: https://chrome.google.com/webstore (search "Tampermonkey")
   - Firefox: https://addons.mozilla.org (search "Tampermonkey")

2. **Open Tampermonkey Dashboard:**
   - Click Tampermonkey icon → Dashboard

3. **Create New Script:**
   - Click "+" tab (or "Create a new script")

4. **Paste the userscript above**

5. **Save:** Ctrl+S or Cmd+S

6. **Enable the script** (toggle switch)

#### Step 4: Test It!

1. Visit any website (e.g., https://www.example.com)
2. Look for purple chat button in bottom-right
3. Open browser console (F12) to see: "✅ AI Agent Chat Widget Loaded"
4. Click button and test!

---

### Option 2: Host on GitHub Pages (Free & Easy)

Perfect for sharing with others!

#### Step 1: Push to GitHub

```bash
cd /Users/sabo/Unwrapathon-GusBus
git add apps/tampermonkey/dist
git commit -m "Add built widget files"
git push
```

#### Step 2: Enable GitHub Pages

1. Go to your repo: https://github.com/Lucalini/Unwrapathon-GusBus
2. Settings → Pages
3. Source: Deploy from branch
4. Branch: main, Folder: `/(root)`
5. Save

Wait 2-3 minutes for deployment.

#### Step 3: Get Your URLs

Your files will be at:
```
https://lucalini.github.io/Unwrapathon-GusBus/apps/tampermonkey/dist/assets/index.js
https://lucalini.github.io/Unwrapathon-GusBus/apps/tampermonkey/dist/assets/index.css
```

#### Step 4: Update Userscript

Replace localhost URLs with GitHub Pages URLs:

```javascript
link.href = 'https://lucalini.github.io/Unwrapathon-GusBus/apps/tampermonkey/dist/assets/index.css';
script.src = 'https://lucalini.github.io/Unwrapathon-GusBus/apps/tampermonkey/dist/assets/index.js';
```

---

### Option 3: Host on CDN (Production)

For best performance:

#### Services to Use:
- **jsDelivr:** Free CDN for GitHub repos
- **Cloudflare Pages:** Free, fast
- **Netlify:** Free tier available
- **AWS S3 + CloudFront:** Your existing infrastructure

#### Example with jsDelivr (Easiest):

1. Push to GitHub (as in Option 2)

2. Your files auto-available at:
```
https://cdn.jsdelivr.net/gh/Lucalini/Unwrapathon-GusBus@main/apps/tampermonkey/dist/assets/index.js
https://cdn.jsdelivr.net/gh/Lucalini/Unwrapathon-GusBus@main/apps/tampermonkey/dist/assets/index.css
```

3. Use these URLs in your userscript

---

## 📝 Final Production Userscript

Here's the polished version for production:

```javascript
// ==UserScript==
// @name         AI Agent Chat Widget
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  AI-powered customer support chat widget
// @author       Your Name
// @match        https://*/*
// @match        http://*/*
// @icon         data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23667eea' d='M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z'/%3E%3C/svg%3E
// @grant        none
// @run-at       document-end
// @homepage     https://github.com/Lucalini/Unwrapathon-GusBus
// ==/UserScript==

(function() {
    'use strict';
    
    // ========================================
    // CONFIGURATION
    // ========================================
    const CONFIG = {
        // Widget files (UPDATE THESE!)
        cssUrl: 'YOUR_CSS_URL_HERE',
        jsUrl: 'YOUR_JS_URL_HERE',
        
        // Domain filtering
        injectOnAllSites: true,
        allowedDomains: [
            'lululemon.com',
            'nike.com',
            'homedepot.com',
            'doordash.com',
        ],
        
        // Excluded domains (never inject)
        excludedDomains: [
            'localhost',
            'bank.com',
            'paypal.com',
        ],
    };

    // ========================================
    // DOMAIN CHECK
    // ========================================
    function shouldInject() {
        const hostname = window.location.hostname;
        
        // Check excluded domains
        if (CONFIG.excludedDomains.some(d => hostname.includes(d))) {
            console.log('AI Widget: Domain excluded');
            return false;
        }
        
        // Check if injecting on all sites
        if (CONFIG.injectOnAllSites) {
            return true;
        }
        
        // Check allowed domains
        return CONFIG.allowedDomains.some(d => hostname.includes(d));
    }

    if (!shouldInject()) {
        return;
    }

    // ========================================
    // LOAD WIDGET
    // ========================================
    console.log('🚀 Loading AI Agent Chat Widget...');

    // Inject CSS
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = CONFIG.cssUrl;
    linkElement.onerror = () => console.error('Failed to load widget CSS');
    document.head.appendChild(linkElement);

    // Inject JS
    const scriptElement = document.createElement('script');
    scriptElement.type = 'module';
    scriptElement.src = CONFIG.jsUrl;
    scriptElement.onerror = () => console.error('Failed to load widget JS');
    document.head.appendChild(scriptElement);

    scriptElement.onload = () => {
        console.log('✅ AI Agent Chat Widget Loaded Successfully');
    };

    // ========================================
    // SPA NAVIGATION TRACKING
    // ========================================
    let currentUrl = window.location.href;
    const observer = new MutationObserver(() => {
        if (window.location.href !== currentUrl) {
            currentUrl = window.location.href;
            console.log('🔄 Page navigation detected');
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
```

---

## 🧪 Testing Checklist

After installing the userscript:

### Test on Different Sites:

- [ ] https://www.example.com
- [ ] https://www.nike.com
- [ ] https://www.lululemon.com
- [ ] Any site you choose

### Verify Features:

- [ ] Purple chat button appears (bottom-right)
- [ ] Click opens chat window
- [ ] Can send messages
- [ ] AI responds (check console for API calls)
- [ ] "End Conversation & Submit" works
- [ ] Data sends to backend successfully
- [ ] Chat resets after submit

### Check Console:

Open browser DevTools (F12) and verify:
```
✅ AI Agent Chat Widget Loaded Successfully
Sending message to chatbot: "..."
Review submitted successfully: {...}
```

---

## 🐛 Troubleshooting

### Widget doesn't appear?

1. **Check console for errors:**
   - F12 → Console tab
   - Look for red error messages

2. **Verify URLs are correct:**
   - Check cssUrl and jsUrl in userscript
   - Test URLs in browser directly

3. **Check Tampermonkey:**
   - Is script enabled? (green toggle)
   - Does @match pattern include current site?

4. **Try different site:**
   - Some sites have strict CSP (Content Security Policy)
   - Test on https://www.example.com first

### CORS errors?

If you see "blocked by CORS":
- Serve files with `--cors` flag
- Or host on proper CDN (GitHub Pages, jsDelivr)

### Script not running?

1. **Check Tampermonkey is installed and enabled**
2. **Refresh page after installing script**
3. **Check @match patterns** in userscript header
4. **Try incognito window** (rules out conflicts)

---

## 🎯 Quick Start Commands

```bash
# 1. Build the widget
cd apps/tampermonkey
npm run build

# 2. Serve locally
cd dist
python3 -m http.server 8080

# 3. Install userscript in Tampermonkey

# 4. Visit any website and test!
```

---

## 📦 Distribution Options

### For Personal Use:
- Option 1 (localhost) ✅

### For Team/Testing:
- Option 2 (GitHub Pages) ✅

### For Production:
- Option 3 (CDN) ✅
- Consider AWS S3 (you already have infrastructure!)

---

## 🚀 You're Ready!

Once you:
1. ✅ Build the widget (`npm run build`)
2. ✅ Host the files (localhost/GitHub/CDN)
3. ✅ Update userscript URLs
4. ✅ Install in Tampermonkey

Your widget will inject into any website and work perfectly! 🎉

---

## 📞 Need Help?

- **Test locally first** (Option 1)
- **Check browser console** for errors
- **Verify API endpoints** are correct
- **Test on simple sites** (example.com) before complex ones

**Ready to deploy!** 🚀

