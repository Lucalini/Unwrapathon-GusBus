# 🎭 Mock Data Setup

Your app is **already configured** to use mock data automatically! No backend needed for development.

## How It Works

### Automatic Fallback
The app tries to fetch from `/api/tickets`, and when it fails (which it will without a backend), it automatically loads mock data:

```javascript
// In App.jsx
const fetchTickets = async () => {
  try {
    const response = await fetch('/api/tickets');
    // ... handle real API
  } catch (err) {
    // ✅ Automatically loads mock data on error
    loadMockData();
  }
};
```

## Mock Data Features

### 📊 What's Generated
- **50 tickets** with realistic data
- **Mix of sentiments**: Positive, Neutral, Negative
- **Various customer types**: Free, Premium, Pro
- **Different locations**: 6 cities across the world
- **Realistic timestamps**: Spread over last 30 days
- **Chat transcripts**: 5-20 messages per ticket
- **Page visit history**: 3-11 page visits per ticket

### 🎲 Random Attributes
Each mock ticket includes:
- Customer ID and Review ID
- Sentiment score (-1 to 1)
- Sentiment label (Positive/Neutral/Negative)
- Summary text (15 variations)
- Subscription level (Free/Premium/Pro)
- Location (NY, SF, London, Tokyo, Berlin, Sydney)
- Chat history
- Page visit data

## Using the App Without Backend

### ✅ Everything Works
- **Dashboard**: Shows health metrics from mock tickets
- **Tickets**: Full sorting, filtering, and management
- **Onboarding**: Analyzes fall-off points from mock data
- **Pet Animation**: Health score based on mock sentiment
- **Auto-refresh**: Regenerates mock data on refresh

### 🔄 Refresh to Get New Data
Click the refresh button or enable auto-refresh to see different mock data each time!

## Customizing Mock Data

### Change Number of Tickets
Edit `App.jsx` line 58:
```javascript
const mockTickets = generateMockTickets(50); // Change 50 to any number
```

### Add Custom Summaries
Edit `App.jsx` around line 188 (in `generateMockTickets`):
```javascript
const summaries = [
  'Unable to complete sign up process',
  'Profile setup is confusing',
  // Add your own here!
  'Your custom ticket summary',
];
```

### Adjust Sentiment Distribution
Edit `App.jsx` around line 177:
```javascript
const sentiments = ['Positive', 'Neutral', 'Negative'];

// For more negative tickets:
const sentiments = ['Negative', 'Negative', 'Neutral', 'Positive'];

// For more positive tickets:
const sentiments = ['Positive', 'Positive', 'Positive', 'Neutral', 'Negative'];
```

### Change Customer Types
Edit `App.jsx` around line 178:
```javascript
const subscriptions = ['Free', 'Premium', 'Pro'];

// For more paying customers:
const subscriptions = ['Premium', 'Pro', 'Premium', 'Pro', 'Free'];
```

### Add More Locations
Edit `App.jsx` around line 179:
```javascript
const cities = ['New York', 'San Francisco', 'London', 'Tokyo', 'Berlin', 'Sydney'];
const countries = ['USA', 'USA', 'UK', 'Japan', 'Germany', 'Australia'];

// Add more:
const cities = [..., 'Paris', 'Toronto', 'Mumbai'];
const countries = [..., 'France', 'Canada', 'India'];
```

## When You Have a Real Backend

### Step 1: Update API Endpoint
Edit `App.jsx` line 34:
```javascript
const response = await fetch('https://your-api-url.com/tickets', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    // Add auth headers if needed
  }
});
```

### Step 2: Test with Real Data
The mock data will stop loading once the API starts working!

### Step 3: Keep Mock Data as Fallback (Optional)
You can keep the mock data fallback for development:
```javascript
catch (err) {
  console.error('Error fetching tickets:', err);
  setError(err.message);
  
  // Only use mock data in development
  if (process.env.NODE_ENV === 'development') {
    loadMockData();
  }
}
```

## Testing Different Scenarios

### Test High Negative Sentiment
Temporarily modify the mock generator to create mostly negative tickets:
```javascript
const sentimentLabel = 'Negative'; // Force all negative
const sentimentScore = -0.8; // Force high negative score
```

### Test Empty State
```javascript
const mockTickets = []; // Empty array
setTickets(mockTickets);
```

### Test Large Dataset
```javascript
const mockTickets = generateMockTickets(1000); // Stress test
```

### Test Critical Issues
```javascript
const sentimentScore = -0.9; // All critical
const isPayingCustomer = true; // All paying customers
```

## Mock Data Console Logs

The app logs useful information to the browser console:

### On Load
```
Error fetching tickets: HTTP error! status: 404
```
✅ This is **expected** - means mock data is loading

### Success Indicator
Check that you see 50 tickets in the Dashboard stats

### Debug Mode
Add this to see what's generated:
```javascript
const loadMockData = () => {
  const mockTickets = generateMockTickets(50);
  console.log('🎭 Mock tickets loaded:', mockTickets);
  setTickets(mockTickets);
};
```

## Troubleshooting

### Issue: No tickets showing
**Solution**: Check browser console for errors, refresh the page

### Issue: Same data every time
**Solution**: This is normal - mock data is randomly generated but seeded. Change the timestamp in generateMockTickets for variety

### Issue: Want consistent data for testing
**Solution**: Remove the random elements:
```javascript
const sentimentLabel = 'Negative'; // Fixed
const subscriptionLevel = 'Premium'; // Fixed
```

### Issue: Need specific test cases
**Solution**: Create custom ticket objects:
```javascript
const loadMockData = () => {
  const customTickets = [
    {
      CustomerID: 'TEST-001',
      ReviewID: 'REVIEW-001',
      SentimentLabel: 'Negative',
      SentimentScore: -0.9,
      Summary: 'Critical test case',
      // ... other fields
    },
    // Add more test cases
  ];
  setTickets(customTickets);
};
```

## API Integration Reference

When you're ready to connect to your DynamoDB backend, see:
- **API_INTEGRATION.md** - Complete backend setup guide
- **README.md** - Expected data schema

## Current Status

✅ **Mock Data**: Active and working  
✅ **50 Tickets**: Generated automatically  
✅ **All Features**: Fully functional  
✅ **No Backend Required**: For development  

## Quick Tips

💡 **Tip 1**: The error message "HTTP error! status: 404" in the console is **normal** - it means mock data is loading

💡 **Tip 2**: Click the refresh button to regenerate random mock data

💡 **Tip 3**: Enable auto-refresh to see data update automatically

💡 **Tip 4**: All sorting, filtering, and analytics work with mock data

💡 **Tip 5**: Mock data includes realistic timestamps, so time-based features work

## Next Steps

1. ✅ **Use the app** with mock data (already working!)
2. 🎨 **Customize** mock data if needed (optional)
3. 🔌 **Connect** to real backend when ready (see API_INTEGRATION.md)
4. 🚀 **Deploy** with mock data or real API

---

**Your app is ready to use right now with mock data!** 🎉

Just open http://localhost:3000 and start exploring!

