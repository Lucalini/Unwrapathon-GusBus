import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const dynamoClient = new DynamoDBClient({});
const TABLE_NAME = process.env.TABLE_NAME || "";

export const handler = async (event: any): Promise<any> => {
  console.log("Get Reviews Lambda invoked");

  try {
    const command = new ScanCommand({
      TableName: TABLE_NAME,
    });

    const response = await dynamoClient.send(command);

    const items = response.Items?.map((item) => unmarshall(item)) || [];

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        count: items.length,
        items: items,
      }),
    };
  } catch (error) {
    console.error("Error retrieving reviews:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "Error retrieving reviews",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
};
