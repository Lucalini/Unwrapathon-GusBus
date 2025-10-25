import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

const bedrockClient = new BedrockRuntimeClient({});

interface ChatMessage {
  Sender: string;
  Timestamp: string;
  Text: string;
}

interface ChatbotRequest {
  RawChatHistory: ChatMessage[];
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
      requestBody.RawChatHistory
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
  chatHistory: ChatMessage[]
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

    const prompt = `You are a helpful, friendly customer service chatbot. You are having a conversation with a customer.

Previous conversation:
${conversationContext}

Please provide a helpful, empathetic response to the customer's most recent message. Keep your response concise (2-3 sentences), professional, and focused on addressing their needs or concerns.

Respond with ONLY the chatbot's response text, no additional formatting or labels.`;

    const command = new InvokeModelCommand({
      modelId: "anthropic.claude-3-haiku-20240307-v1:0",
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

    const response = await bedrockClient.send(command);
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
