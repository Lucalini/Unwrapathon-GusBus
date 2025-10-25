# 🚀 Quick Start - ShadCN UI Version

Your Customer Service Suite has been converted to use **ShadCN UI** with Tailwind CSS!

## Installation (3 steps)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm start
```

### 3. Open in Browser
The app will automatically open at **http://localhost:3000**

## What's New? ✨

### Modern UI Components
- ✅ **Button**: Multiple variants (default, outline, ghost, destructive)
- ✅ **Card**: Beautiful card containers with header/content/footer
- ✅ **Badge**: Color-coded labels and tags
- ✅ **Tabs**: Smooth tab navigation
- ✅ **Input**: Styled form inputs with focus states
- ✅ **Select**: Accessible dropdown selects
- ✅ **Checkbox**: Custom checkboxes with animations
- ✅ **Switch**: Toggle switches for settings
- ✅ **Progress**: Animated progress bars

### Tailwind CSS Benefits
- 🎨 Consistent design system
- 📱 Mobile-first responsive design
- 🎯 Smaller bundle size
- ⚡ Faster development
- 🌙 Dark mode ready
- ♿ Better accessibility

### Icon Library (Lucide React)
Beautiful, consistent icons:
```javascript
import { Search, RefreshCw, AlertTriangle } from 'lucide-react';
```

## Component Examples

### Dashboard Stats
```jsx
<Card>
  <CardHeader className="pb-3">
    <CardDescription>Total Tickets</CardDescription>
    <CardTitle className="text-3xl">150</CardTitle>
  </CardHeader>
</Card>
```

### Buttons
```jsx
<Button variant="default">Save</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
```

### Navigation Tabs
```jsx
<Tabs defaultValue="dashboard">
  <TabsList>
    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
    <TabsTrigger value="tickets">Tickets</TabsTrigger>
  </TabsList>
  <TabsContent value="dashboard">...</TabsContent>
</Tabs>
```

## Key Features Maintained

All original features work exactly the same:

✅ **UserSentimentPet** - Animated health visualization  
✅ **TicketingWindow** - Ticket management with filtering  
✅ **OnboardingFlowchart** - Customer journey analytics  
✅ **Mock Data** - Automatic test data generation  
✅ **API Integration** - Ready for DynamoDB backend  

## Folder Structure

```
src/
├── components/
│   └── ui/                  # ShadCN UI components
│       ├── button.jsx
│       ├── card.jsx
│       ├── badge.jsx
│       ├── tabs.jsx
│       ├── input.jsx
│       ├── select.jsx
│       ├── checkbox.jsx
│       ├── switch.jsx
│       └── progress.jsx
├── lib/
│   └── utils.js             # Utility functions (cn)
├── ServiceSuite/
│   ├── App.jsx              # Main app
│   ├── UserSentimentPet.jsx
│   ├── TicketingWindow.jsx
│   └── OnboardingFlowchart.jsx
└── index.css                # Tailwind + theme
```

## Customization

### Change Theme Colors
Edit `src/index.css`:
```css
:root {
  --primary: 221.2 83.2% 53.3%;  /* Your brand color */
}
```

### Add Dark Mode Toggle
```javascript
<Button onClick={() => {
  document.documentElement.classList.toggle('dark');
}}>
  Toggle Dark Mode
</Button>
```

### Responsive Breakpoints
```jsx
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  {/* 1 col mobile, 2 tablet, 3 desktop */}
</div>
```

## Common Tailwind Classes

### Spacing
- `p-4` = padding 1rem
- `m-2` = margin 0.5rem
- `gap-4` = gap 1rem
- `space-y-2` = vertical spacing

### Layout
- `flex` = flexbox
- `grid` = grid
- `grid-cols-2` = 2 columns
- `items-center` = align center

### Colors
- `bg-blue-500` = blue background
- `text-red-600` = red text
- `border-gray-200` = gray border

### Typography
- `text-sm` = small text
- `text-2xl` = 2xl heading
- `font-bold` = bold font
- `font-semibold` = semibold

## Troubleshooting

### Port Already in Use
```bash
PORT=3001 npm start
```

### Clear Cache
```bash
rm -rf node_modules/.cache
npm start
```

### Reinstall Dependencies
```bash
rm -rf node_modules package-lock.json
npm install
```

## Resources

- **ShadCN UI Docs**: https://ui.shadcn.com/
- **Tailwind Docs**: https://tailwindcss.com/docs
- **Lucide Icons**: https://lucide.dev/
- **Detailed Setup**: See `SHADCN_SETUP.md`

## Next Steps

1. ✅ Run `npm install`
2. ✅ Run `npm start`
3. 🎨 Customize colors in `src/index.css`
4. 🌙 Add dark mode (optional)
5. 📱 Test responsive design
6. 🚀 Deploy!

---

**Ready to go?** Just run `npm install && npm start` and you're all set! 🎉

