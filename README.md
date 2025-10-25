# Unwrapathon GusBus - Customer Review Processing System

A serverless AWS infrastructure for processing and analyzing customer reviews using AI-powered sentiment analysis.

## 🏗️ Architecture

This project implements a complete serverless infrastructure using AWS CDK that includes:

### Infrastructure Components

1. **API Gateway REST API**

   - `POST /reviews` - Submit customer reviews for processing
   - `GET /reviews` - Retrieve all processed reviews
   - `POST /chat` - Get AI-powered chatbot responses

2. **AWS Lambda Functions**

   - **Processing Lambda**: Processes reviews using AWS Bedrock (Claude 3 Haiku) for sentiment analysis
   - **Get Reviews Lambda**: Retrieves all reviews from DynamoDB
   - **Chatbot Lambda**: Generates conversational AI responses using Bedrock

3. **DynamoDB Table**

   - Stores processed reviews with partition key (PK) and sort key (SK)
   - Supports efficient querying by customer and timestamp

4. **S3 + CloudFront**

   - Hosts the Service Suite UI dashboard
   - CDN distribution for global access

5. **AWS Bedrock Integration**
   - AI-powered sentiment analysis using Claude 3 Haiku
   - Conversational chatbot responses
   - Extracts insights from chat history and web behavior

### Data Flow

```
Widget (Frontend) → API Gateway → Processing Lambda → Bedrock AI → DynamoDB
                         ↓                                            ↓
                    Chat Lambda → Bedrock AI
                                                                       ↓
                    CloudFront ← S3 ← Service Suite UI ← Get Lambda ←┘
```

## 📋 Schemas

### Input: WIDGET_SCHEMA

The API accepts customer review data including:

- Customer ID and metadata (email, subscription, location)
- Raw chat conversation history
- Web browsing history with full page HTML

See `schema/WIDGET_SCHEMA.json` for details.

### Output: DYNAMO_SCHEMA

Processed and stored data includes:

- Sentiment score (-1 to 1) and label (Positive/Neutral/Negative)
- AI-generated summary
- Customer status and location
- Full chat transcript and page visits

See `schema/DYNAMO_SCHEMA.json` for details.

## 🚀 Quick Start

### Prerequisites

- AWS CLI configured with credentials
- Node.js 18+ and npm
- AWS CDK CLI: `npm install -g aws-cdk`
- AWS Bedrock access (Claude 3 Haiku model enabled)

### Deployment

```bash
# Install dependencies
npm install
cd lambda && npm install && cd ..

# Build the project
npm run build

# Bootstrap CDK (first time only)
cdk bootstrap

# Deploy the stack
cdk deploy

# Or with a specific AWS profile
cdk deploy --profile your-profile-name
```

After deployment, CDK will output all endpoints and resource names.

### Upload UI to S3

```bash
# Get outputs from the deployed stack
BUCKET_NAME=$(aws cloudformation describe-stacks \
  --stack-name UnwrapathonGusBusStack \
  --query 'Stacks[0].Outputs[?OutputKey==`S3BucketName`].OutputValue' \
  --output text)

DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
  --stack-name UnwrapathonGusBusStack \
  --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionId`].OutputValue' \
  --output text)

# Upload UI files
aws s3 sync ./service-suite-ui s3://$BUCKET_NAME/

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"
```

## 🧪 Testing

Test the API with sample data:

```bash
# Using default AWS profile
./test-api.sh

# Using a specific AWS profile
./test-api.sh your-profile-name
```

This will submit positive, negative, and neutral reviews, then retrieve all reviews.

### Manual Testing

Submit a review:

```bash
curl -X POST https://YOUR_API_ENDPOINT/reviews \
  -H "Content-Type: application/json" \
  -d @test-review.json
```

Get all reviews:

```bash
curl https://YOUR_API_ENDPOINT/reviews
```

## 📊 Service Suite UI

After deployment, access your dashboard at the CloudFront URL provided in the outputs.

Features:

- Real-time review visualization
- Sentiment analysis statistics
- Customer details and chat previews
- Filterable review cards

## 🛠️ Development

### Project Structure

```
.
├── bin/                          # CDK app entry point
├── lib/                          # CDK stack definition
│   └── unwrapathon-gus_bus-stack.ts
├── lambda/                       # Lambda function code
│   ├── processing-lambda.ts      # Bedrock AI processing
│   └── get-reviews-lambda.ts     # DynamoDB retrieval
├── schema/                       # JSON schemas
│   ├── WIDGET_SCHEMA.json        # Input format
│   └── DYNAMO_SCHEMA.json        # Storage format
├── service-suite-ui/             # Frontend dashboard
│   ├── index.html
│   └── error.html
├── deploy.sh                     # Deployment script
├── test-api.sh                   # API testing script
└── DEPLOYMENT.md                 # Detailed docs
```

### Available Scripts

- `npm run build` - Compile TypeScript
- `npm run watch` - Watch for changes
- `npm test` - Run tests
- `cdk deploy` - Deploy stack
- `cdk diff` - View changes
- `cdk synth` - Synthesize CloudFormation template

## 📈 Monitoring

View Lambda logs:

```bash
aws logs tail /aws/lambda/ReviewProcessingLambda --follow
```

Query DynamoDB:

```bash
aws dynamodb scan --table-name CustomerReviews
```

## 🔒 Security

- API Gateway has CORS enabled for cross-origin requests
- S3 bucket blocks direct public access (CloudFront only)
- Lambda functions use least-privilege IAM roles
- DynamoDB uses on-demand billing with encryption at rest

For production:

- Add API Gateway authentication (API Keys or Cognito)
- Implement rate limiting
- Enable AWS WAF
- Add request validation

## 💰 Cost Optimization

- **DynamoDB**: On-demand pricing (pay per request)
- **Lambda**: 30-second timeout, optimized memory
- **CloudFront**: Caching enabled
- **Bedrock**: Per-token pricing for AI inference

Estimated monthly cost for low-moderate usage: $10-50

## 🧹 Cleanup

Remove all resources:

```bash
cdk destroy
```

Note: S3 bucket and DynamoDB table will be automatically deleted (configured for dev/test).

## 📝 API Documentation

### POST /reviews

Submit a new customer review for AI processing.

**Headers:**

- `Content-Type: application/json`

**Body:** See `schema/WIDGET_SCHEMA.json`

**Response:**

```json
{
  "message": "Review processed successfully",
  "reviewId": "review-1234567890-abc123"
}
```

### GET /reviews

Retrieve all processed reviews.

**Response:**

```json
{
  "count": 10,
  "items": [
    /* array of review objects */
  ]
}
```

See `schema/DYNAMO_SCHEMA.json` for item structure.

### POST /chat

Get an AI-powered chatbot response based on conversation history.

**Headers:**

- `Content-Type: application/json`

**Body:**

```json
{
  "RawChatHistory": [
    {
      "Sender": "User",
      "Timestamp": "2025-10-25T12:00:00Z",
      "Text": "Hello, I need help with my account"
    },
    {
      "Sender": "Chatbot",
      "Timestamp": "2025-10-25T12:00:15Z",
      "Text": "I'd be happy to help! What seems to be the issue?"
    },
    {
      "Sender": "User",
      "Timestamp": "2025-10-25T12:01:00Z",
      "Text": "I can't access my dashboard"
    }
  ]
}
```

**Response:**

```json
{
  "RawChatHistory": [
    /* ...previous messages... */
    {
      "Sender": "Chatbot",
      "Timestamp": "2025-10-25T12:01:15Z",
      "Text": "I apologize for the trouble accessing your dashboard. Let me help you troubleshoot this issue..."
    }
  ]
}
```

The endpoint returns the complete chat history with a new AI-generated message appended.

## 🐛 Troubleshooting

### Bedrock Access Denied

1. Go to AWS Console → Bedrock → Model Access
2. Request access to Claude 3 Haiku
3. Wait for approval (usually instant)

### Lambda Timeout

- Increase timeout in `lib/unwrapathon-gus_bus-stack.ts`
- Check Bedrock API latency in CloudWatch

### CORS Errors

- Verify API Gateway CORS settings
- Check browser console for specific errors

See [DEPLOYMENT.md](DEPLOYMENT.md) for more troubleshooting tips.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is part of the Unwrapathon event.

## 🎯 Future Enhancements

- [ ] Add authentication/authorization
- [ ] Implement pagination for GET endpoint
- [ ] Add filtering and search capabilities
- [ ] Set up CloudWatch alarms
- [ ] Create CI/CD pipeline
- [ ] Add WebSocket support for real-time updates
- [ ] Implement data export functionality
- [ ] Add multi-language support for sentiment analysis

## 📞 Support

For issues or questions:

- Check [DEPLOYMENT.md](DEPLOYMENT.md) for detailed documentation
- Review CloudWatch logs for errors
- Verify AWS Bedrock model access in your region

---

Built with ❤️ using AWS CDK, Lambda, Bedrock, and DynamoDB
