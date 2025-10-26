# Lambda Functions

This directory contains AWS Lambda functions for the GusBus ticket management system.

## Functions

### getTickets.ts
Fetches all customer review tickets from DynamoDB.

**Environment Variables:**
- `TABLE_NAME`: Name of the DynamoDB table (set by CDK)

**Response:**
```json
{
  "tickets": [...],
  "count": 50
}
```

## Development

### Install dependencies:
```bash
npm install
```

### Build TypeScript:
```bash
npx tsc
```

### Test locally:
```bash
# Set environment variable
export TABLE_NAME=CustomerReviews

# Run the function
node dist/getTickets.js
```

## Deployment

Lambda functions are automatically deployed by the CDK stack:
```bash
cd ..
cdk deploy
```

The CDK stack compiles TypeScript and packages the Lambda function automatically.

