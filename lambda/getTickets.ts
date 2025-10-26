import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const dynamoDb = new DynamoDBClient({});
const TABLE_NAME = process.env.TABLE_NAME || '';

export const handler = async (event: any) => {
  console.log('Fetching tickets from DynamoDB');

  try {
    // Scan the table to get all tickets
    const params = {
      TableName: TABLE_NAME,
      Limit: 100 // Limit to prevent large scans
    };

    const command = new ScanCommand(params);
    const result = await dynamoDb.send(command);

    // Unmarshal DynamoDB items to regular JS objects
    const tickets = result.Items?.map(item => unmarshall(item)) || [];

    console.log(`Retrieved ${tickets.length} tickets`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET,OPTIONS'
      },
      body: JSON.stringify({
        tickets,
        count: tickets.length
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
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

