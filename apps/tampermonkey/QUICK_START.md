# 🚀 Quick Start - Tampermonkey Widget

**Your widget is ready to deploy!** Here's the 5-minute setup.

---

## ✅ What You've Built

- ✅ Beautiful React chat widget
- ✅ AI chatbot integration (AWS)
- ✅ Backend data submission (AWS)
- ✅ Web history tracking
- ✅ Production build ready

---

## 🎯 Quick Test (Right Now!)

### Step 1: Serve Built Files (Terminal 1)

```bash
cd /Users/sabo/Unwrapathon-GusBus/apps/tampermonkey/dist
python3 -m http.server 8080
```

**Keep this running!**

### Step 2: Install Tampermonkey

1. **Install extension:**
   - Chrome: https://chrome.google.com/webstore (search "Tampermonkey")
   - Firefox: https://addons.mozilla.org (search "Tampermonkey")

2. **Open Dashboard:** Click Tampermonkey icon → Dashboard

### Step 3: Add Script

1. Click **"+"** (Create new script)
2. **Delete everything** in the editor
3. **Copy/paste** from: `apps/tampermonkey/userscript.js`
4. **Save:** Ctrl+S or Cmd+S

### Step 4: Test!

1. Visit **https://www.example.com**
2. Look for **purple chat button** (bottom-right) 🟣
3. Click and test chat!

**Console should show:**
```
🚀 Loading AI Agent Chat Widget...
✅ AI Agent Chat Widget Loaded Successfully
```

---

## 📊 Your Files

```
dist/
├── assets/
│   ├── index.js     (149 KB) ← Widget
│   └── index.css    (3.8 KB)  ← Styles
userscript.js        ← Tampermonkey script (uses localhost URLs)
```

---

## 🌐 For Production

See **`TAMPERMONKEY_SETUP.md`** for:
- GitHub Pages hosting
- CDN deployment
- jsDelivr setup
- Production configuration

---

## 🎨 Current Configuration

**Userscript is set to:**
- ✅ Files from: `http://localhost:8080`
- ✅ Inject on: All websites
- ✅ Exclude: localhost only

**To change:**
Edit `userscript.js` (lines 21-45)

---

## 🧪 Test Sites

Try your widget on:
- https://www.example.com ✅ (Simple site)
- https://www.nike.com 👟 (E-commerce)
- https://www.lululemon.com 🏃 (E-commerce)
- Any website you choose!

---

## ✅ Verify It Works

### Visual Check:
- [ ] Purple button appears (bottom-right)
- [ ] Button has hover effect
- [ ] Click opens chat window
- [ ] Can type and send messages
- [ ] AI responds in 1-2 seconds
- [ ] "End & Submit" button visible

### Console Check (F12):
- [ ] No red errors
- [ ] See "✅ AI Agent Chat Widget Loaded"
- [ ] API calls succeed (200 OK)
- [ ] Data submits successfully

---

## 🐛 Troubleshooting

### Widget doesn't appear?

**Check terminal where you ran `python3 -m http.server 8080`:**
- Should show: "Serving HTTP on :: port 8080..."
- Should show GET requests when you load a page

**Check browser console (F12):**
- Look for errors
- Should see: "🚀 Loading..."

**Check Tampermonkey:**
- Is script enabled? (green toggle)
- Click icon → should show "AI Agent Chat Widget"

### Button appears but chat doesn't work?

**Check your dev server from earlier:**
```bash
# Terminal 2 - Should still be running!
cd /Users/sabo/Unwrapathon-GusBus/apps/tampermonkey
npm run dev
```

**APIs are at:**
- Chat: `https://cfex7cfhal.execute-api.us-west-2.amazonaws.com/prod/chat`
- Review: `https://cfex7cfhal.execute-api.us-west-2.amazonaws.com/prod/reviews`

---

## 📦 File Locations

| File | Purpose | Location |
|------|---------|----------|
| Widget JS | React app | `dist/assets/index.js` |
| Widget CSS | Styles | `dist/assets/index.css` |
| Userscript | Tampermonkey | `userscript.js` |
| Setup Guide | Full docs | `TAMPERMONKEY_SETUP.md` |

---

## 🎉 You're Live!

Once you see the purple button, your widget is working!

**Next steps:**
1. ✅ Test all features (chat, submit, etc.)
2. ✅ Deploy to production hosting
3. ✅ Share userscript with team
4. ✅ Monitor backend for data

---

## 💡 Pro Tips

**For Development:**
- Keep both servers running (8080 for widget, dev server for hot reload)
- Use `injectOnAllSites: true` for easy testing
- Check console for debugging

**For Production:**
- Host on CDN (fast, cached)
- Use specific `allowedDomains`
- Monitor error rates
- Version your userscript

**For Sharing:**
- Push userscript to GitHub Gist
- Share direct install link
- Or publish to Greasy Fork

---

## 🚀 Ready to Ship!

Your widget is **production-ready** with:
- ✅ Real AI chatbot
- ✅ Backend integration
- ✅ Data collection
- ✅ Beautiful UI
- ✅ Error handling

**Just host the files and share the userscript!** 🎉

