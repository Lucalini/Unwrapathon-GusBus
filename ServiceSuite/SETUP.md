# Quick Setup Guide

Follow these steps to get the Customer Service Suite up and running.

## Step 1: Install Dependencies

```bash
npm install
```

This will install:
- React 18.2.0
- React DOM 18.2.0
- React Scripts 5.0.1

## Step 2: Project Structure Check

Verify your project has this structure:

```
Unwrapathon-GusBus/
├── public/
│   └── index.html
├── src/
│   ├── index.js
│   └── ServiceSuite/
│       ├── App.js
│       ├── UserSentimentPet.js
│       ├── TicketingWindow.js
│       ├── OnboardingFlowcart.js
│       └── utils.js
└── package.json
```

## Step 3: Add Pet Animation Images (Optional)

Create the assets directory and add your 20 pet animation images:

```bash
mkdir -p public/assets/pet
```

Image naming convention:
- `critical_1.png` to `critical_4.png`
- `poor_1.png` to `poor_4.png`
- `fair_1.png` to `fair_4.png`
- `good_1.png` to `good_4.png`
- `excellent_1.png` to `excellent_4.png`

**Note**: The app will work without these images (it shows emoji placeholders).

## Step 4: Configure API Endpoint (Optional)

If you have a DynamoDB backend API ready:

1. Open `src/ServiceSuite/App.js`
2. Find the `fetchTickets` function (around line 28)
3. Replace `/api/tickets` with your API endpoint:

```javascript
const response = await fetch('https://your-api-url.com/tickets', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  }
});
```

**Note**: If you don't have an API yet, the app will automatically use mock data for development.

## Step 5: Run the App

Start the development server:

```bash
npm start
```

The app will automatically open at `http://localhost:3000`

## Step 6: Explore Features

### Dashboard View
- See the animated pet health indicator
- View quick stats

### Tickets View
- Sort tickets by priority, sentiment, date, or severity
- Filter by sentiment type or customer type
- Search for specific tickets
- Mark tickets as complete

### Onboarding View
- See customer journey visualization
- Identify problem areas in onboarding
- Click stages for detailed analysis

## Step 7: Build for Production

When ready to deploy:

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

## Troubleshooting

### Issue: Port 3000 already in use
```bash
# Use a different port
PORT=3001 npm start
```

### Issue: Module not found errors
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Issue: React version conflicts
```bash
# Check versions
npm list react react-dom

# Force install if needed
npm install --force
```

### Issue: Build fails
```bash
# Clear cache
npm cache clean --force
rm -rf node_modules build
npm install
npm run build
```

## Next Steps

1. **Customize styling**: Edit inline styles in each component
2. **Connect to real API**: See `API_INTEGRATION.md` for details
3. **Add authentication**: Integrate with your auth system
4. **Deploy**: Deploy to AWS S3, Vercel, Netlify, or your preferred hosting

## Development Tips

### Hot Reload
The app supports hot module replacement. Changes to files will automatically reload in the browser.

### Mock Data
The app generates 50 mock tickets automatically if the API fails. Customize mock data in `src/ServiceSuite/App.js` in the `generateMockTickets` function.

### Component Isolation
Test individual components by importing them:

```javascript
// Test UserSentimentPet alone
import UserSentimentPet from './ServiceSuite/UserSentimentPet';

function App() {
  return <UserSentimentPet tickets={mockTickets} />;
}
```

### Browser Console
Check the browser console for:
- API call logs
- Error messages
- Performance metrics

## Performance Optimization

For large datasets (1000+ tickets):

1. **Implement pagination** in the API
2. **Use virtual scrolling** for ticket lists
3. **Add debouncing** to search inputs
4. **Memoize expensive calculations**

Example: Add debouncing to search

```bash
npm install lodash
```

```javascript
import { debounce } from 'lodash';

const debouncedSearch = debounce((query) => {
  setSearchQuery(query);
}, 300);
```

## Deployment Options

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
```bash
npm run build
# Upload build/ directory to Netlify
```

### Deploy to AWS S3 + CloudFront
```bash
npm run build
aws s3 sync build/ s3://your-bucket-name
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

## Support

- 📖 Full documentation: See `README.md`
- 🔌 API integration: See `API_INTEGRATION.md`
- 🐛 Found a bug? Open a GitHub issue

---

Happy coding! 🚀

