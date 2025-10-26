import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";

const dynamoClient = new DynamoDBClient({});
const bedrockClient = new BedrockRuntimeClient({});

const TABLE_NAME = process.env.TABLE_NAME || "";

// Exponential backoff configuration
const BEDROCK_CONFIG = {
  maxRetries: 5,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
};

/**
 * Implements exponential backoff with jitter for Bedrock API calls
 */
async function callBedrockWithBackoff<T>(
  operation: () => Promise<T>,
  retries = BEDROCK_CONFIG.maxRetries
): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      // Check if this is a throttling error
      const isThrottling =
        error.name === "ThrottlingException" ||
        error.$metadata?.httpStatusCode === 429;

      // If it's the last attempt or not a throttling error, throw
      if (attempt === retries || !isThrottling) {
        throw error;
      }

      // Calculate exponential backoff with jitter
      const exponentialDelay = Math.min(
        BEDROCK_CONFIG.baseDelay * Math.pow(2, attempt),
        BEDROCK_CONFIG.maxDelay
      );
      const jitter = Math.random() * exponentialDelay * 0.3; // Add up to 30% jitter
      const delay = exponentialDelay + jitter;

      console.log(
        `Throttled by Bedrock. Attempt ${attempt + 1}/${
          retries + 1
        }. Retrying in ${Math.round(delay)}ms...`
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error("Max retries exceeded");
}

interface FrustrationEventSchema {
  CustomerID: string;
  FrustrationTimestamp: string;
  UserMetadata: {
    Email: string;
    SubscriptionLevel: string;
    Geolocation: {
      City: string;
      Country: string;
    };
  };
  RawWebHistory: Array<{
    URL: string;
    VisitTime: string;
    FullPageHTML: string;
  }>;
  FrustrationIndicators?: {
    MouseThrashingScore?: number;
    RapidClicks?: number;
    TimeOnPage?: number;
    ErrorsEncountered?: number;
  };
}

interface DynamoFrustrationSchema {
  PK: string;
  SK: string;
  CustomerID: string;
  EventID: string;
  EventType: string;
  EventTimestamp: string;
  SentimentScore: number;
  SentimentLabel: string;
  Summary: string;
  CustomerStatus: {
    SubscriptionLevel: string;
    IsPayingCustomer: boolean;
  };
  CustomerLocation: {
    City: string;
    Country: string;
  };
  RecentPageVisits: Array<{
    URL: string;
    VisitTime: string;
    FullPageHTML: string;
  }>;
  FrustrationMetrics?: {
    MouseThrashingScore?: number;
    RapidClicks?: number;
    TimeOnPage?: number;
    ErrorsEncountered?: number;
  };
}

export const handler = async (event: any): Promise<any> => {
  console.log(
    "Frustration Lambda invoked with event:",
    JSON.stringify(event, null, 2)
  );

  try {
    // Parse the incoming frustration event
    const frustrationData: FrustrationEventSchema =
      typeof event.body === "string" ? JSON.parse(event.body) : event;

    // Extract features using Bedrock
    const analysisResult = await analyzeWithBedrock(frustrationData);

    // Create DynamoDB entry
    const dynamoEntry: DynamoFrustrationSchema = {
      PK: `CUSTOMER#${frustrationData.CustomerID}`,
      SK: `FRUSTRATION#${frustrationData.FrustrationTimestamp}`,
      CustomerID: frustrationData.CustomerID,
      EventID: generateEventId(),
      EventType: "FRUSTRATION",
      EventTimestamp: frustrationData.FrustrationTimestamp,
      SentimentScore: analysisResult.sentimentScore,
      SentimentLabel: analysisResult.sentimentLabel,
      Summary: analysisResult.summary,
      CustomerStatus: {
        SubscriptionLevel: frustrationData.UserMetadata.SubscriptionLevel,
        IsPayingCustomer: ["Premium", "Pro"].includes(
          frustrationData.UserMetadata.SubscriptionLevel
        ),
      },
      CustomerLocation: frustrationData.UserMetadata.Geolocation,
      RecentPageVisits: frustrationData.RawWebHistory,
      FrustrationMetrics: frustrationData.FrustrationIndicators,
    };

    // Store in DynamoDB
    await storeToDynamoDB(dynamoEntry);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "Frustration event recorded successfully",
        eventId: dynamoEntry.EventID,
      }),
    };
  } catch (error) {
    console.error("Error processing frustration event:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "Error processing frustration event",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
};

async function analyzeWithBedrock(
  frustrationData: FrustrationEventSchema
): Promise<{
  sentimentScore: number;
  sentimentLabel: string;
  summary: string;
}> {
  try {
    // Prepare web history summary
    const webSummary = frustrationData.RawWebHistory.map(
      (visit) => `Visited ${visit.URL} at ${visit.VisitTime}`
    ).join("\n");

    // Prepare frustration indicators summary
    const frustrationMetrics = frustrationData.FrustrationIndicators
      ? `
Frustration Indicators:
- Mouse Thrashing Score: ${
          frustrationData.FrustrationIndicators.MouseThrashingScore || "N/A"
        }
- Rapid Clicks: ${frustrationData.FrustrationIndicators.RapidClicks || "N/A"}
- Time on Page: ${frustrationData.FrustrationIndicators.TimeOnPage || "N/A"}s
- Errors Encountered: ${
          frustrationData.FrustrationIndicators.ErrorsEncountered || "N/A"
        }
`
      : "";

    const prompt = `You are an AI assistant analyzing user frustration events detected by our system. 

Customer Information:
- Subscription Level: ${frustrationData.UserMetadata.SubscriptionLevel}
- Location: ${frustrationData.UserMetadata.Geolocation.City}, ${frustrationData.UserMetadata.Geolocation.Country}

${frustrationMetrics}

Recent Web Activity:
${webSummary}

Our system has detected signs of user frustration (e.g., rapid clicking, mouse thrashing, or other behavioral indicators).

Please analyze this information and provide:
1. A sentiment score from -1 (very negative/frustrated) to 1 (positive) - note that frustration events typically indicate negative sentiment
2. A sentiment label (Positive, Neutral, or Negative)
3. A brief summary of the likely pain points or issues the customer is experiencing (2-3 sentences)

Respond ONLY with a valid JSON object in this exact format:
{
  "sentimentScore": <number between -1 and 1>,
  "sentimentLabel": "<Positive|Neutral|Negative>",
  "summary": "<your summary here>"
}`;

    // Use exponential backoff when calling Bedrock
    const response = await callBedrockWithBackoff(async () => {
      const command = new InvokeModelCommand({
        modelId: "us.anthropic.claude-sonnet-4-5-20250929-v1:0",
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify({
          anthropic_version: "bedrock-2023-05-31",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      });

      return await bedrockClient.send(command);
    });

    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    // Extract the text content from Claude's response
    const textContent = responseBody.content[0].text;

    // Parse the JSON from the response
    const analysisResult = JSON.parse(textContent);

    return {
      sentimentScore: analysisResult.sentimentScore,
      sentimentLabel: analysisResult.sentimentLabel,
      summary: analysisResult.summary,
    };
  } catch (error) {
    console.error("Error calling Bedrock:", error);
    // Return default negative values for frustration events
    return {
      sentimentScore: -0.7,
      sentimentLabel: "Negative",
      summary:
        "User experiencing frustration detected by behavioral indicators.",
    };
  }
}

async function storeToDynamoDB(entry: DynamoFrustrationSchema): Promise<void> {
  const command = new PutItemCommand({
    TableName: TABLE_NAME,
    Item: marshall(entry, { removeUndefinedValues: true }),
  });

  await dynamoClient.send(command);
  console.log(
    "Successfully stored frustration entry to DynamoDB:",
    entry.EventID
  );
}

function generateEventId(): string {
  return `frustration-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 15)}`;
}
