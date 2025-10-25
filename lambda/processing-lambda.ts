import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";

const dynamoClient = new DynamoDBClient({});
const bedrockClient = new BedrockRuntimeClient({});

const TABLE_NAME = process.env.TABLE_NAME || "";

interface WidgetSchema {
  CustomerID: string;
  ReviewSubmissionTimestamp: string;
  UserMetadata: {
    Email: string;
    SubscriptionLevel: string;
    Geolocation: {
      City: string;
      Country: string;
    };
  };
  RawChatHistory: Array<{
    Sender: string;
    Timestamp: string;
    Text: string;
  }>;
  RawWebHistory: Array<{
    URL: string;
    VisitTime: string;
    FullPageHTML: string;
  }>;
}

interface DynamoSchema {
  PK: string;
  SK: string;
  CustomerID: string;
  ReviewID: string;
  ReviewTimestamp: string;
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
  ChatTranscript: Array<{
    Sender: string;
    Timestamp: string;
    Text: string;
  }>;
  RecentPageVisits: Array<{
    URL: string;
    VisitTime: string;
    FullPageHTML: string;
  }>;
}

export const handler = async (event: any): Promise<any> => {
  console.log(
    "Processing Lambda invoked with event:",
    JSON.stringify(event, null, 2)
  );

  try {
    // Parse the incoming widget schema
    const widgetData: WidgetSchema =
      typeof event.body === "string" ? JSON.parse(event.body) : event;

    // Extract features using Bedrock
    const analysisResult = await analyzeWithBedrock(widgetData);

    // Create DynamoDB entry
    const dynamoEntry: DynamoSchema = {
      PK: `CUSTOMER#${widgetData.CustomerID}`,
      SK: `REVIEW#${widgetData.ReviewSubmissionTimestamp}`,
      CustomerID: widgetData.CustomerID,
      ReviewID: generateReviewId(),
      ReviewTimestamp: widgetData.ReviewSubmissionTimestamp,
      SentimentScore: analysisResult.sentimentScore,
      SentimentLabel: analysisResult.sentimentLabel,
      Summary: analysisResult.summary,
      CustomerStatus: {
        SubscriptionLevel: widgetData.UserMetadata.SubscriptionLevel,
        IsPayingCustomer: ["Premium", "Pro"].includes(
          widgetData.UserMetadata.SubscriptionLevel
        ),
      },
      CustomerLocation: widgetData.UserMetadata.Geolocation,
      ChatTranscript: widgetData.RawChatHistory,
      RecentPageVisits: widgetData.RawWebHistory,
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
        message: "Review processed successfully",
        reviewId: dynamoEntry.ReviewID,
      }),
    };
  } catch (error) {
    console.error("Error processing review:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "Error processing review",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
};

async function analyzeWithBedrock(widgetData: WidgetSchema): Promise<{
  sentimentScore: number;
  sentimentLabel: string;
  summary: string;
}> {
  try {
    // Prepare chat history for analysis
    const chatText = widgetData.RawChatHistory.map(
      (msg) => `${msg.Sender}: ${msg.Text}`
    ).join("\n");

    // Prepare web history summary
    const webSummary = widgetData.RawWebHistory.map(
      (visit) => `Visited ${visit.URL} at ${visit.VisitTime}`
    ).join("\n");

    const prompt = `You are an AI assistant analyzing customer feedback and behavior. 

Customer Information:
- Subscription Level: ${widgetData.UserMetadata.SubscriptionLevel}
- Location: ${widgetData.UserMetadata.Geolocation.City}, ${widgetData.UserMetadata.Geolocation.Country}

Chat Conversation:
${chatText}

Recent Web Activity:
${webSummary}

Please analyze this information and provide:
1. A sentiment score from -1 (very negative) to 1 (very positive)
2. A sentiment label (Positive, Neutral, or Negative)
3. A brief summary of the customer's main concerns or feedback (2-3 sentences)

Respond ONLY with a valid JSON object in this exact format:
{
  "sentimentScore": <number between -1 and 1>,
  "sentimentLabel": "<Positive|Neutral|Negative>",
  "summary": "<your summary here>"
}`;

    const command = new InvokeModelCommand({
      modelId: "anthropic.claude-3-haiku-20240307-v1:0",
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

    const response = await bedrockClient.send(command);
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
    // Return default values if Bedrock fails
    return {
      sentimentScore: 0,
      sentimentLabel: "Neutral",
      summary: "Unable to analyze customer feedback at this time.",
    };
  }
}

async function storeToDynamoDB(entry: DynamoSchema): Promise<void> {
  const command = new PutItemCommand({
    TableName: TABLE_NAME,
    Item: marshall(entry, { removeUndefinedValues: true }),
  });

  await dynamoClient.send(command);
  console.log("Successfully stored entry to DynamoDB:", entry.ReviewID);
}

function generateReviewId(): string {
  return `review-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}
