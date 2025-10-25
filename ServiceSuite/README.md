# Customer Service Suite - GusBus Unwrapathon

A comprehensive customer service dashboard that analyzes ticket data from DynamoDB to provide insights into customer sentiment, onboarding issues, and support ticket management.

## 🎯 Features

### 1. **User Sentiment Pet** 🐕
An animated visualization of your app's health based on ticket sentiment analysis.

- **5 Health Stages**: Critical, Poor, Fair, Good, Excellent
- **Dynamic Animation**: 4 frames per stage (20 images total)
- **Real-time Health Score**: 0-100 score based on ticket sentiment
- **Ticket Statistics**: Overview of positive, neutral, and negative feedback
- **Visual Indicators**: Color-coded stages with clear descriptions

**Health Calculation**:
- Average sentiment score from all tickets (-1 to 1 scale converted to 0-100)
- Penalties for recent negative tickets (last 24 hours)
- Visual representation through animated pet states

**Asset Structure** (add your images to):
```
public/assets/pet/
  ├── critical_1.png
  ├── critical_2.png
  ├── critical_3.png
  ├── critical_4.png
  ├── poor_1.png
  ├── poor_2.png
  ├── poor_3.png
  ├── poor_4.png
  ├── fair_1.png
  ├── fair_2.png
  ├── fair_3.png
  ├── fair_4.png
  ├── good_1.png
  ├── good_2.png
  ├── good_3.png
  ├── good_4.png
  ├── excellent_1.png
  ├── excellent_2.png
  ├── excellent_3.png
  └── excellent_4.png
```

### 2. **Ticketing Window** 🎫
Advanced ticket management with ToDo creation and multi-dimensional sorting.

**Features**:
- **Smart Sorting**: Priority score, sentiment, timestamp, severity
- **Advanced Filtering**: Sentiment label, customer type, subscription level
- **Search**: Full-text search across tickets
- **Bulk Actions**: Select multiple tickets for batch operations
- **ToDo Management**: Mark tickets as complete/incomplete
- **Priority Scoring**: Automatic priority calculation (0-100) based on:
  - Sentiment score impact (40 points)
  - Paying customer bonus (20 points)
  - Recency bonus (15 points)
  - Chat complexity (10 points)
  - Page visit complexity (15 points)

**Severity Levels**:
- **Critical**: Sentiment < -0.7
- **High**: Sentiment < -0.4
- **Medium**: Sentiment < 0
- **Low**: Sentiment ≥ 0
- Automatic boost for paying customers

**Issue Frequency Analysis**:
- Identifies common issues by keyword frequency
- Helps prioritize systemic problems

### 3. **Onboarding Flowchart** 🔄
Visualizes customer journey through onboarding with fall-off point analysis.

**Onboarding Stages**:
1. **Sign Up** 👤: Registration, account creation, email verification
2. **Profile Setup** 📝: Personal information, avatar, bio
3. **Tutorial** 🎓: Walkthrough, guides, getting started
4. **First Action** 🚀: Initial engagement, first creation
5. **Integration** 🔗: Third-party connections, API setup
6. **Subscription** 💳: Payment, plan selection, upgrade

**Analytics**:
- **Funnel Visualization**: Visual representation of customer progression
- **Drop-off Rates**: Percentage of customers falling off at each stage
- **Retention Metrics**: Stage-by-stage retention analysis
- **Issue Identification**: Top issues at each stage with frequency counts
- **Sentiment Analysis**: Average sentiment per stage
- **Customer Volume**: Track customer numbers through the funnel

**Recommendations**:
- Automatic suggestions based on drop-off rates
- Critical issue alerts for stages with >50% drop-off
- Common issue highlighting
- UX improvement suggestions

## 🏗️ Architecture

### Data Schema (DynamoDB)

```json
{
  "PK": "CUSTOMER#<customer_id>",
  "SK": "REVIEW#<timestamp>",
  "CustomerID": "string",
  "ReviewID": "string",
  "ReviewTimestamp": "ISO 8601 date-time",
  "SentimentScore": -1 to 1,
  "SentimentLabel": "Positive|Neutral|Negative",
  "Summary": "string",
  "CustomerStatus": {
    "SubscriptionLevel": "Free|Premium|Pro",
    "IsPayingCustomer": boolean
  },
  "CustomerLocation": {
    "City": "string",
    "Country": "string"
  },
  "ChatTranscript": [
    {
      "Sender": "Customer|Support",
      "Timestamp": "ISO 8601 date-time",
      "Text": "string"
    }
  ],
  "RecentPageVisits": [
    {
      "URL": "url",
      "VisitTime": "ISO 8601 date-time",
      "FullPageHTML": "string"
    }
  ]
}
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Access to DynamoDB backend API

### Installation

1. **Clone the repository**:
```bash
git clone <your-repo-url>
cd Unwrapathon-GusBus
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure API endpoint**:
Update the API endpoint in `src/ServiceSuite/App.js`:
```javascript
const response = await fetch('/api/tickets', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  }
});
```

Replace `/api/tickets` with your actual DynamoDB API endpoint.

4. **Add pet animation images** (optional):
Place your 20 pet animation images in `public/assets/pet/` following the naming convention specified above.

### Development

Run the development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

### Build for Production

Create an optimized production build:
```bash
npm run build
```

The build output will be in the `build/` directory.

## 📁 Project Structure

```
Unwrapathon-GusBus/
├── public/
│   ├── index.html
│   └── assets/
│       └── pet/              # Pet animation images (20 images)
├── src/
│   ├── index.js              # React entry point
│   └── ServiceSuite/
│       ├── App.js            # Main application component
│       ├── UserSentimentPet.js
│       ├── TicketingWindow.js
│       ├── OnboardingFlowcart.js
│       └── utils.js          # Utility functions
├── ServiceSuite/             # Original source files
├── package.json
└── README.md
```

## 🎨 Customization

### Styling

All components use inline styles for simplicity. To customize:

1. **Colors**: Edit color values in the `styles` object at the bottom of each component
2. **Layout**: Modify grid and flex properties in the styles
3. **Animations**: Adjust animation timing in `UserSentimentPet.js` (frame change interval)

### Health Score Algorithm

Modify the health calculation in `UserSentimentPet.js`:

```javascript
// Adjust weights for different factors
const score = Math.round(((avgSentiment + 1) / 2) * 100);
const recentNegativePenalty = Math.min(recentNegativeTickets * 3, 20); // Change multiplier
```

### Priority Scoring

Customize priority weights in `TicketingWindow.js`:

```javascript
// Sentiment impact (default: 40 points)
priorityScore += Math.abs(sentimentScore) * 40;

// Paying customer bonus (default: 20 points)
if (isPayingCustomer) priorityScore += 20;

// Adjust other weights as needed
```

### Onboarding Stages

Add or modify stages in `OnboardingFlowcart.js`:

```javascript
const ONBOARDING_STAGES = [
  {
    id: 'your_stage',
    name: 'Your Stage Name',
    keywords: ['keyword1', 'keyword2'],
    icon: '🎯'
  },
  // ... more stages
];
```

## 🔧 API Integration

### Expected API Response Format

Your DynamoDB API should return:

```json
{
  "tickets": [
    {
      "PK": "CUSTOMER#1001",
      "SK": "REVIEW#2024-01-01T12:00:00Z",
      "CustomerID": "CUST-1001",
      "ReviewID": "REV-10001",
      "ReviewTimestamp": "2024-01-01T12:00:00Z",
      "SentimentScore": -0.75,
      "SentimentLabel": "Negative",
      "Summary": "Cannot complete sign up",
      "CustomerStatus": {
        "SubscriptionLevel": "Premium",
        "IsPayingCustomer": true
      },
      "CustomerLocation": {
        "City": "New York",
        "Country": "USA"
      },
      "ChatTranscript": [...],
      "RecentPageVisits": [...]
    }
  ]
}
```

### Mock Data

For development, the app automatically loads mock data if the API call fails. See `generateMockTickets()` in `App.js`.

## 📊 Usage Examples

### Dashboard View
- Quick overview of app health
- Animated pet showing current status
- Key metrics at a glance

### Tickets View
- Sort by priority to tackle urgent issues first
- Filter by sentiment to focus on negative feedback
- Filter by paying customers to prioritize revenue-impacting issues
- Search for specific customers or issues
- Bulk complete tickets after resolution

### Onboarding View
- Identify problematic stages in the customer journey
- Click on stages to see detailed analysis
- Review recommendations for improvements
- Track customer drop-off points

## 🤝 Contributing

This project was created for the GusBus Unwrapathon. Feel free to:
- Add new visualizations
- Enhance existing features
- Improve the UI/UX
- Add more analytics capabilities

## 📝 License

MIT License - feel free to use this project for your customer service needs!

## 👥 Team

GusBus Team - Unwrapathon 2024

## 🐛 Known Issues & Future Enhancements

- [ ] Add real-time WebSocket updates for live ticket streaming
- [ ] Export functionality for reports (CSV, PDF)
- [ ] Email notifications for critical issues
- [ ] Machine learning-based issue categorization
- [ ] Historical trend analysis
- [ ] Customer journey replay
- [ ] Integration with support ticket systems (Zendesk, Intercom, etc.)

## 📞 Support

For questions or issues, please open a GitHub issue or contact the team.

---

Made with ❤️ by the GusBus Team for Unwrapathon 2024
