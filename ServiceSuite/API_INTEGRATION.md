# API Integration Guide

This document provides detailed instructions for integrating the Customer Service Suite with your DynamoDB backend.

## Overview

The Customer Service Suite expects to receive ticket data from a REST API endpoint that queries your DynamoDB table. The data should match the schema specified in the main README.

## API Endpoint Setup

### 1. Create API Gateway Endpoint

Your API Gateway should expose an endpoint (e.g., `/api/tickets`) that:
- Accepts GET requests
- Queries your DynamoDB table
- Returns ticket data in JSON format

### 2. Lambda Function Example

Here's a sample Lambda function to query DynamoDB and return tickets:

```javascript
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const tableName = process.env.TICKETS_TABLE_NAME;
  
  try {
    // Query parameters
    const limit = event.queryStringParameters?.limit || 100;
    const lastEvaluatedKey = event.queryStringParameters?.lastKey 
      ? JSON.parse(decodeURIComponent(event.queryStringParameters.lastKey))
      : undefined;
    
    // Scan the table (or use Query if you have specific partition keys)
    const params = {
      TableName: tableName,
      Limit: parseInt(limit),
      ExclusiveStartKey: lastEvaluatedKey
    };
    
    const result = await dynamodb.scan(params).promise();
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: JSON.stringify({
        tickets: result.Items,
        lastEvaluatedKey: result.LastEvaluatedKey,
        count: result.Items.length
      })
    };
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Failed to fetch tickets',
        message: error.message
      })
    };
  }
};
```

### 3. Environment Variables

Set these environment variables in your Lambda function:

```bash
TICKETS_TABLE_NAME=your-dynamodb-table-name
```

### 4. IAM Permissions

Ensure your Lambda execution role has the following permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:Scan",
        "dynamodb:Query",
        "dynamodb:GetItem"
      ],
      "Resource": "arn:aws:dynamodb:region:account-id:table/your-table-name"
    }
  ]
}
```

## Frontend Configuration

### Update API Endpoint

In `src/ServiceSuite/App.js`, update the `fetchTickets` function with your API endpoint:

```javascript
const fetchTickets = async () => {
  try {
    setLoading(true);
    setError(null);

    // Replace with your actual API endpoint
    const response = await fetch('https://your-api-gateway-url.amazonaws.com/prod/tickets', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add authentication headers if needed
        // 'Authorization': 'Bearer YOUR_TOKEN'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    setTickets(data.tickets || data || []);
  } catch (err) {
    console.error('Error fetching tickets:', err);
    setError(err.message);
    loadMockData(); // Fallback to mock data
  } finally {
    setLoading(false);
  }
};
```

### Add Authentication (Optional)

If your API requires authentication:

```javascript
// Using API Key
const response = await fetch(API_ENDPOINT, {
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'your-api-key'
  }
});

// Using Cognito
import { Auth } from 'aws-amplify';

const session = await Auth.currentSession();
const token = session.getIdToken().getJwtToken();

const response = await fetch(API_ENDPOINT, {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
});
```

## Query Options

### Filter by Customer

To fetch tickets for a specific customer:

```javascript
// Lambda function
const params = {
  TableName: tableName,
  KeyConditionExpression: 'PK = :pk',
  ExpressionAttributeValues: {
    ':pk': `CUSTOMER#${customerId}`
  }
};

const result = await dynamodb.query(params).promise();
```

### Filter by Date Range

```javascript
// Lambda function
const params = {
  TableName: tableName,
  KeyConditionExpression: 'PK = :pk AND SK BETWEEN :start AND :end',
  ExpressionAttributeValues: {
    ':pk': `CUSTOMER#${customerId}`,
    ':start': `REVIEW#${startDate}`,
    ':end': `REVIEW#${endDate}`
  }
};
```

### Filter by Sentiment

```javascript
// Lambda function
const params = {
  TableName: tableName,
  FilterExpression: 'SentimentLabel = :sentiment',
  ExpressionAttributeValues: {
    ':sentiment': 'Negative'
  }
};
```

## Pagination

For large datasets, implement pagination:

### Backend (Lambda)

```javascript
exports.handler = async (event) => {
  const limit = parseInt(event.queryStringParameters?.limit || 100);
  const lastKey = event.queryStringParameters?.lastKey 
    ? JSON.parse(Buffer.from(event.queryStringParameters.lastKey, 'base64').toString())
    : undefined;
  
  const params = {
    TableName: tableName,
    Limit: limit,
    ExclusiveStartKey: lastKey
  };
  
  const result = await dynamodb.scan(params).promise();
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      tickets: result.Items,
      lastEvaluatedKey: result.LastEvaluatedKey 
        ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
        : null
    })
  };
};
```

### Frontend

```javascript
const [lastKey, setLastKey] = useState(null);

const fetchTickets = async (appendMode = false) => {
  const url = lastKey 
    ? `${API_ENDPOINT}?limit=50&lastKey=${encodeURIComponent(lastKey)}`
    : `${API_ENDPOINT}?limit=50`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  if (appendMode) {
    setTickets(prev => [...prev, ...data.tickets]);
  } else {
    setTickets(data.tickets);
  }
  
  setLastKey(data.lastEvaluatedKey);
};

// Load more button
<button onClick={() => fetchTickets(true)} disabled={!lastKey}>
  Load More
</button>
```

## Real-time Updates

For real-time ticket updates, use WebSocket or DynamoDB Streams:

### Option 1: WebSocket (API Gateway WebSocket)

```javascript
const ws = new WebSocket('wss://your-websocket-api-url');

ws.onmessage = (event) => {
  const newTicket = JSON.parse(event.data);
  setTickets(prev => [newTicket, ...prev]);
};
```

### Option 2: Polling

```javascript
// In App.js, already implemented
useEffect(() => {
  if (!autoRefresh) return;
  
  const interval = setInterval(() => {
    fetchTickets();
  }, refreshInterval);
  
  return () => clearInterval(interval);
}, [autoRefresh, refreshInterval]);
```

## CORS Configuration

Ensure your API Gateway has CORS enabled:

```json
{
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
  "Access-Control-Allow-Methods": "GET,OPTIONS"
}
```

## Error Handling

The frontend includes automatic error handling and fallback to mock data. Customize error handling in `App.js`:

```javascript
catch (err) {
  console.error('Error fetching tickets:', err);
  
  // Show user-friendly error messages
  if (err.message.includes('Failed to fetch')) {
    setError('Network error. Please check your connection.');
  } else if (err.message.includes('401') || err.message.includes('403')) {
    setError('Authentication failed. Please log in.');
  } else {
    setError('Failed to load tickets. Please try again.');
  }
  
  // Optional: Load mock data for development
  if (process.env.NODE_ENV === 'development') {
    loadMockData();
  }
}
```

## Testing

### Test with curl

```bash
curl https://your-api-gateway-url.amazonaws.com/prod/tickets

# With API key
curl -H "x-api-key: your-api-key" \
  https://your-api-gateway-url.amazonaws.com/prod/tickets

# With pagination
curl https://your-api-gateway-url.amazonaws.com/prod/tickets?limit=10&lastKey=base64encodedkey
```

### Test in Frontend

1. Check browser console for API errors
2. Verify network requests in DevTools
3. Test error states by providing invalid endpoints
4. Verify mock data loads when API fails

## Deployment

### Environment-specific Endpoints

Use environment variables:

```javascript
// .env.development
REACT_APP_API_ENDPOINT=http://localhost:3001/api/tickets

// .env.production
REACT_APP_API_ENDPOINT=https://your-api-gateway-url.amazonaws.com/prod/tickets

// In App.js
const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT || '/api/tickets';
```

## Monitoring

Add monitoring to track API performance:

```javascript
const fetchTickets = async () => {
  const startTime = Date.now();
  
  try {
    // ... fetch logic
    
    const duration = Date.now() - startTime;
    console.log(`API call completed in ${duration}ms`);
    
    // Send to analytics service
    analytics.track('tickets_fetched', {
      duration,
      count: tickets.length
    });
  } catch (err) {
    const duration = Date.now() - startTime;
    console.error(`API call failed after ${duration}ms`);
    
    analytics.track('tickets_fetch_error', {
      duration,
      error: err.message
    });
  }
};
```

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for sensitive data
3. **Implement rate limiting** on the backend
4. **Validate and sanitize** all data from API
5. **Use HTTPS** for all API calls
6. **Implement authentication** for production
7. **Log security events** for audit trails

## Troubleshooting

### Issue: CORS errors
**Solution**: Enable CORS in API Gateway and Lambda response headers

### Issue: 401/403 errors
**Solution**: Check IAM permissions and authentication headers

### Issue: Timeout errors
**Solution**: Increase Lambda timeout or implement pagination

### Issue: Empty response
**Solution**: Verify DynamoDB table name and data exists

### Issue: Invalid JSON
**Solution**: Check Lambda function response format matches expected schema

---

For additional help, refer to [AWS API Gateway Documentation](https://docs.aws.amazon.com/apigateway/) and [DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb/).

