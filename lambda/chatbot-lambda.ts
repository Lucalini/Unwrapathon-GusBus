import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

const bedrockClient = new BedrockRuntimeClient({});

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

interface ChatMessage {
  Sender: string;
  Timestamp: string;
  Text: string;
}

interface WebVisit {
  URL: string;
  VisitTime: string;
  FullPageHTML: string;
}

interface ChatbotRequest {
  RawChatHistory: ChatMessage[];
  RawWebHistory?: WebVisit[];
}

export const handler = async (event: any): Promise<any> => {
  console.log(
    "Chatbot Lambda invoked with event:",
    JSON.stringify(event, null, 2)
  );

  try {
    // Parse the incoming request
    const requestBody: ChatbotRequest =
      typeof event.body === "string" ? JSON.parse(event.body) : event;

    console.log(
      "Parsed request body - RawChatHistory length:",
      requestBody.RawChatHistory?.length
    );
    console.log(
      "Parsed request body - RawWebHistory length:",
      requestBody.RawWebHistory?.length
    );
    if (requestBody.RawWebHistory && requestBody.RawWebHistory.length > 0) {
      console.log("First page URL:", requestBody.RawWebHistory[0]?.URL);
      console.log(
        "First page HTML length:",
        requestBody.RawWebHistory[0]?.FullPageHTML?.length
      );
    }

    if (
      !requestBody.RawChatHistory ||
      !Array.isArray(requestBody.RawChatHistory)
    ) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          message:
            "Invalid request: RawChatHistory is required and must be an array",
        }),
      };
    }

    // Generate chatbot response using Bedrock
    const chatbotResponse = await generateChatbotResponse(
      requestBody.RawChatHistory,
      requestBody.RawWebHistory
    );

    // Create new message
    const newMessage: ChatMessage = {
      Sender: "Chatbot",
      Timestamp: new Date().toISOString(),
      Text: chatbotResponse,
    };

    // Append to chat history
    const updatedChatHistory = [...requestBody.RawChatHistory, newMessage];

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        RawChatHistory: updatedChatHistory,
      }),
    };
  } catch (error) {
    console.error("Error generating chatbot response:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "Error generating chatbot response",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
};

async function generateChatbotResponse(
  chatHistory: ChatMessage[],
  webHistory?: WebVisit[]
): Promise<string> {
  try {
    // Build the conversation context for Claude
    const conversationContext = chatHistory
      .map((msg) => `${msg.Sender}: ${msg.Text}`)
      .join("\n");

    // Extract just the user messages for context
    const userMessages = chatHistory
      .filter((msg) => msg.Sender === "User")
      .map((msg) => msg.Text);

    const lastUserMessage = userMessages[userMessages.length - 1] || "";

    // Build web history context if provided
    let webContext = "";
    if (webHistory && webHistory.length > 0) {
      webContext = "\n\nCustomer's Recent Web Activity:\n";

      webHistory.forEach((visit, index) => {
        // Extract relevant information from HTML (simplified approach)
        // We'll include URL and a truncated version of the HTML content
        const truncatedHTML =
          visit.FullPageHTML.length > 2000
            ? visit.FullPageHTML.substring(0, 2000) + "..."
            : visit.FullPageHTML;

        // Try to extract text content from HTML (basic approach)
        const textContent = extractTextFromHTML(truncatedHTML);

        webContext += `\nPage ${index + 1}:
- URL: ${visit.URL}
- Visited at: ${visit.VisitTime}
- Page content summary: ${textContent.substring(0, 500)}${
          textContent.length > 500 ? "..." : ""
        }
`;
      });
    }

    const prompt = `You are a helpful, friendly customer service chatbot. You are having a conversation with a customer.

Previous conversation:
${conversationContext}${webContext}

Please provide a helpful, empathetic response to the customer's most recent message. ${
      webHistory && webHistory.length > 0
        ? "Consider the pages they've visited to provide more contextual and relevant assistance. If their question relates to something they saw on a specific page, reference that information."
        : ""
    } Keep your response concise (2-3 sentences), professional, and focused on addressing their needs or concerns.

Respond with ONLY the chatbot's response text, no additional formatting or labels.`;

    console.log(
      "Web history received:",
      webHistory ? webHistory.length : 0,
      "pages"
    );
    console.log(
      "Prompt being sent to Bedrock (first 1000 chars):",
      prompt.substring(0, 1000)
    );

    // Use exponential backoff when calling Bedrock
    const response = await callBedrockWithBackoff(async () => {
      const command = new InvokeModelCommand({
        modelId: "us.anthropic.claude-sonnet-4-5-20250929-v1:0",
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify({
          anthropic_version: "bedrock-2023-05-31",
          max_tokens: 500,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
        }),
      });

      return await bedrockClient.send(command);
    });

    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    // Extract the text content from Claude's response
    const textContent = responseBody.content[0].text;

    return textContent.trim();
  } catch (error) {
    console.error("Error calling Bedrock:", error);
    // Return a default response if Bedrock fails
    return "I apologize, but I'm having trouble processing your request at the moment. Please try again or contact our support team for assistance.";
  }
}

// Helper function to extract text content from HTML
function extractTextFromHTML(html: string): string {
  // Remove script and style tags and their content
  let text = html.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    ""
  );
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");

  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, " ");

  // Decode HTML entities
  text = text.replace(/&nbsp;/g, " ");
  text = text.replace(/&amp;/g, "&");
  text = text.replace(/&lt;/g, "<");
  text = text.replace(/&gt;/g, ">");
  text = text.replace(/&quot;/g, '"');

  // Clean up whitespace
  text = text.replace(/\s+/g, " ").trim();

  return text;
}
