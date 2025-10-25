# CORS Setup Guide - AWS API Gateway

## 🚨 Problem

You're seeing this error when submitting conversations:

```
Error: CORS Error: Cannot connect to backend
Status: 403 Forbidden
Error Type: MissingAuthenticationTokenException
```

This happens because your AWS API Gateway doesn't have CORS (Cross-Origin Resource Sharing) enabled for the `/prod/review` endpoint.

---

## ✅ Solution: Enable CORS on AWS API Gateway

### Method 1: AWS Console (Easiest)

#### Step 1: Open AWS API Gateway Console

1. Go to https://console.aws.amazon.com/apigateway
2. Sign in to your AWS account
3. Select **US West (Oregon) us-west-2** region (top-right dropdown)

#### Step 2: Find Your API

1. Click on your API (the one with endpoint: `cfex7cfhal.execute-api.us-west-2.amazonaws.com`)
2. You should see a tree of resources on the left

#### Step 3: Enable CORS for `/review` Endpoint

1. In the Resources panel, click on **`/review`**
2. Click **Actions** dropdown (top of the page)
3. Select **Enable CORS**

#### Step 4: Configure CORS Settings

A popup will appear. Set these values:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token
Access-Control-Allow-Methods: POST,OPTIONS
```

**Important Options:**
- ✅ Check: **Default 4XX** 
- ✅ Check: **Default 5XX**
- ✅ Leave **OPTIONS Method** as "Add CORS Method" (default)

Click **Enable CORS and replace existing CORS headers**

#### Step 5: Deploy the API (CRITICAL!)

**This step is required for changes to take effect!**

1. Click **Actions** dropdown again
2. Select **Deploy API**
3. Choose **Deployment stage**: `prod`
4. Click **Deploy**

#### Step 6: Wait and Test

1. Wait 30 seconds for CloudFront cache to clear
2. Refresh your app at `http://localhost:5174`
3. Try submitting a conversation again

---

### Method 2: AWS CLI (For Developers)

If you prefer command-line:

```bash
# Get your API ID
aws apigateway get-rest-apis --region us-west-2

# Enable CORS (replace YOUR_API_ID and YOUR_RESOURCE_ID)
aws apigateway put-integration-response \
  --rest-api-id YOUR_API_ID \
  --resource-id YOUR_RESOURCE_ID \
  --http-method OPTIONS \
  --status-code 200 \
  --region us-west-2 \
  --response-parameters method.response.header.Access-Control-Allow-Headers="'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",method.response.header.Access-Control-Allow-Methods="'POST,OPTIONS'",method.response.header.Access-Control-Allow-Origin="'*'"

# Deploy to prod stage
aws apigateway create-deployment \
  --rest-api-id YOUR_API_ID \
  --stage-name prod \
  --region us-west-2
```

---

### Method 3: CloudFormation/CDK (Infrastructure as Code)

If you're using AWS CDK or CloudFormation, add CORS configuration to your API:

**AWS CDK (TypeScript):**
```typescript
const api = new apigateway.RestApi(this, 'MyApi', {
  defaultCorsPreflightOptions: {
    allowOrigins: apigateway.Cors.ALL_ORIGINS,
    allowMethods: ['POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key'],
  },
});
```

**CloudFormation:**
```yaml
ApiGatewayMethod:
  Type: AWS::ApiGateway::Method
  Properties:
    RestApiId: !Ref MyApi
    ResourceId: !Ref ReviewResource
    HttpMethod: POST
    Integration:
      IntegrationResponses:
        - StatusCode: 200
          ResponseParameters:
            method.response.header.Access-Control-Allow-Origin: "'*'"
```

---

## 🧪 Verify CORS is Working

### Test with curl:

```bash
# Test OPTIONS (preflight) request
curl -X OPTIONS \
  https://cfex7cfhal.execute-api.us-west-2.amazonaws.com/prod/review \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -H "Origin: http://localhost:5174" \
  -v
```

**Expected response headers:**
```
< HTTP/2 200
< access-control-allow-origin: *
< access-control-allow-methods: POST,OPTIONS
< access-control-allow-headers: Content-Type,...
```

---

## 📋 Checklist

After making changes, verify:

- [ ] CORS enabled on `/review` resource
- [ ] OPTIONS method exists for `/review`
- [ ] API deployed to `prod` stage
- [ ] Wait 30-60 seconds for CloudFront cache
- [ ] Test from browser (F12 Network tab shows 200 for OPTIONS)
- [ ] POST request succeeds after OPTIONS preflight

---

## 🔍 Troubleshooting

### Still getting 403?

**1. Check the OPTIONS method exists:**
   - In API Gateway console, click on `/review`
   - You should see both `OPTIONS` and `POST` methods
   - If OPTIONS is missing, re-enable CORS

**2. Verify deployment:**
   - Check that API is deployed to `prod` stage
   - Look at deployment history to confirm recent deployment

**3. Clear CloudFront cache:**
   - Wait 2-3 minutes after deployment
   - Try in incognito/private browser window

**4. Check browser console:**
   ```javascript
   // Should see this in Network tab:
   OPTIONS /prod/review -> 200 OK
   POST /prod/review -> 200 OK
   ```

### Different error?

**403 with different message:**
- Check if endpoint requires authentication/API key
- Verify correct API URL

**Network error:**
- Check if backend is running
- Verify internet connection

**CORS error in different browsers:**
- Some browsers cache CORS failures
- Try in incognito or different browser

---

## 🎯 Expected Behavior After Fix

### Before CORS Fix ❌
```
1. Browser sends: OPTIONS /prod/review
2. Server responds: 403 Forbidden (MissingAuthenticationToken)
3. Browser blocks: POST request never sent
4. User sees: "Error submitting conversation"
```

### After CORS Fix ✅
```
1. Browser sends: OPTIONS /prod/review (preflight)
2. Server responds: 200 OK with CORS headers
3. Browser sends: POST /prod/review with data
4. Server responds: 200 OK with review response
5. User sees: "Conversation submitted successfully!"
```

---

## 📞 Need Help?

If you're still having issues:

1. **Check AWS CloudWatch Logs:**
   - API Gateway → Stages → prod → Logs
   - Look for error messages

2. **Share these details:**
   - Full error message from browser console
   - Network tab screenshot (OPTIONS and POST requests)
   - API Gateway stage configuration

3. **AWS Support:**
   - If you have AWS support plan, open a ticket
   - Category: API Gateway → CORS Configuration

---

## 🚀 Quick Reference

**API Endpoint:** `https://cfex7cfhal.execute-api.us-west-2.amazonaws.com/prod/review`

**Required CORS Headers:**
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST,OPTIONS
Access-Control-Allow-Headers: Content-Type
```

**After Enabling CORS:**
1. Deploy API to prod ✓
2. Wait 30 seconds ✓
3. Test in browser ✓

---

## ✅ Success!

Once CORS is configured, your widget will:
- ✅ Successfully submit conversation data
- ✅ Show "Conversation submitted successfully!" message
- ✅ Send data to backend for processing
- ✅ Work on any website (when deployed with Tampermonkey)

**Your endpoint will be production-ready!** 🎉

