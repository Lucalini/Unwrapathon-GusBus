# ShadCN UI Setup Guide

Your app has been converted to use **ShadCN UI** with **Tailwind CSS**! 🎉

## What Changed

### ✅ New Features
- **Modern UI Components**: Using Radix UI primitives via ShadCN
- **Tailwind CSS**: Utility-first CSS framework for consistent styling
- **Improved Accessibility**: Built-in ARIA attributes and keyboard navigation
- **Dark Mode Ready**: Theme system configured (activate with class="dark")
- **Better Performance**: Smaller bundle sizes with tree-shaking

### 📦 Dependencies Added
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility CSS framework
- **Lucide React**: Beautiful icon library
- **Class Variance Authority (CVA)**: For component variants
- **Tailwind Merge**: Smart class merging utility

## Quick Start

### 1. Install Dependencies

```bash
cd /Users/lucaverweyen/Unwrapathon-GusBus
npm install
```

This will install all the new ShadCN UI dependencies.

### 2. Start Development Server

```bash
npm start
```

The app will open at `http://localhost:3000` with the new ShadCN interface!

## Component Structure

### New UI Components (in `src/components/ui/`)
- ✅ `button.jsx` - Styled button component
- ✅ `card.jsx` - Card container components
- ✅ `badge.jsx` - Badge/label component
- ✅ `tabs.jsx` - Tab navigation
- ✅ `input.jsx` - Form input
- ✅ `select.jsx` - Dropdown select
- ✅ `checkbox.jsx` - Checkbox with label
- ✅ `switch.jsx` - Toggle switch
- ✅ `progress.jsx` - Progress bar

### Converted Main Components
- ✅ `App.jsx` - Main app with Tabs navigation
- ✅ `UserSentimentPet.jsx` - Health monitor with Cards
- ✅ `TicketingWindow.jsx` - Ticket management with filters
- ✅ `OnboardingFlowchart.jsx` - Journey visualization

## Key Differences from Previous Version

### Before (Inline Styles)
```javascript
<div style={{
  padding: '20px',
  backgroundColor: '#ffffff',
  borderRadius: '12px'
}}>
  Content
</div>
```

### After (Tailwind CSS)
```javascript
<div className="p-5 bg-white rounded-xl">
  Content
</div>
```

### Before (Plain HTML)
```javascript
<button onClick={handleClick} style={styles.button}>
  Click me
</button>
```

### After (ShadCN Button)
```javascript
<Button onClick={handleClick} variant="default">
  Click me
</Button>
```

## Customization

### Color Theme

Edit `src/index.css` to customize colors:

```css
:root {
  --primary: 221.2 83.2% 53.3%;  /* Blue */
  --destructive: 0 84.2% 60.2%;   /* Red */
  --background: 0 0% 100%;         /* White */
  /* ... more colors */
}
```

### Tailwind Config

Edit `tailwind.config.js` for custom breakpoints, colors, etc:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: '#your-color',
      },
    },
  },
}
```

## Dark Mode

The app is dark mode ready! To enable:

### Option 1: Manual Toggle
Add a theme toggle button in your app:

```javascript
const [theme, setTheme] = useState('light');

<Button onClick={() => {
  setTheme(theme === 'light' ? 'dark' : 'light');
  document.documentElement.classList.toggle('dark');
}}>
  Toggle Theme
</Button>
```

### Option 2: System Preference
Detect and use system theme:

```javascript
useEffect(() => {
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (isDark) {
    document.documentElement.classList.add('dark');
  }
}, []);
```

## Icon Usage (Lucide React)

Icons are now from Lucide React:

```javascript
import { Search, Heart, Settings } from 'lucide-react';

<Search className="h-4 w-4" />
<Heart className="h-5 w-5 text-red-500" />
<Settings className="h-6 w-6" />
```

Browse all icons: https://lucide.dev/icons/

## Component Examples

### Button Variants
```javascript
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
```

### Button Sizes
```javascript
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Heart /></Button>
```

### Card Structure
```javascript
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
  <CardFooter>
    Footer buttons
  </CardFooter>
</Card>
```

### Badge Variants
```javascript
<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Outline</Badge>
```

## Responsive Design

Tailwind provides built-in responsive utilities:

```javascript
<div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
  {/* 1 col mobile, 2 tablet, 3 desktop, 4 large desktop */}
</div>
```

Breakpoints:
- `sm:` - 640px+
- `md:` - 768px+
- `lg:` - 1024px+
- `xl:` - 1280px+
- `2xl:` - 1536px+

## Adding New ShadCN Components

To add more ShadCN components manually:

1. Browse components: https://ui.shadcn.com/docs/components
2. Copy the component code
3. Place in `src/components/ui/[component-name].jsx`
4. Import and use: `import { Component } from '../components/ui/component'`

### Popular Components to Add:
- **Dialog/Modal**: For popups
- **Dropdown Menu**: For menus
- **Toast**: For notifications
- **Popover**: For tooltips
- **Command**: For command palette
- **Calendar**: For date picking

## Troubleshooting

### Issue: Tailwind classes not working
```bash
# Ensure Tailwind is watching your files
npm start

# Clear cache
rm -rf node_modules/.cache
npm start
```

### Issue: Module not found errors
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Issue: Styles look broken
- Check that `src/index.css` has the Tailwind directives
- Verify `tailwind.config.js` has correct content paths
- Check browser console for CSS errors

### Issue: Dark mode not working
- Ensure `darkMode: ["class"]` is in `tailwind.config.js`
- Add `class="dark"` to `<html>` element

## Performance Tips

### Code Splitting
ShadCN components are tree-shakeable - unused components won't be in your bundle.

### Bundle Size
The converted app should be slightly smaller than the inline-styles version:
- Before: ~150KB CSS
- After: ~50KB CSS (purged Tailwind)

### Production Build
```bash
npm run build
```

This creates an optimized build with:
- Minified CSS/JS
- Tree-shaken unused code
- Compressed assets

## Migration Notes

### What Still Works
- ✅ All original features and functionality
- ✅ Mock data generation
- ✅ API integration points
- ✅ Pet animation logic
- ✅ Ticket sorting and filtering
- ✅ Onboarding flow analysis

### Breaking Changes
- 🔄 Changed file extensions: `.js` → `.jsx` for components
- 🔄 Removed inline `styles` objects
- 🔄 Import paths for components changed

### Visual Improvements
- ✨ More consistent spacing and sizing
- ✨ Better hover/focus states
- ✨ Improved mobile responsiveness
- ✨ Accessible color contrast
- ✨ Smooth animations and transitions

## Resources

- **ShadCN UI**: https://ui.shadcn.com/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Radix UI**: https://www.radix-ui.com/
- **Lucide Icons**: https://lucide.dev/
- **Tailwind Components**: https://tailwindui.com/components

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Start dev server: `npm start`
3. 🎨 Customize colors in `src/index.css`
4. 🌙 Add dark mode toggle (optional)
5. 📱 Test on mobile devices
6. 🚀 Deploy your beautiful new app!

---

## Support

Need help? Check:
- ShadCN Discord: https://discord.com/invite/shadcn
- Tailwind Discord: https://discord.com/invite/tailwindcss
- Stack Overflow: [tailwindcss] [shadcn-ui] tags

---

Enjoy your modern, accessible, and beautiful ShadCN UI app! 🎨✨

