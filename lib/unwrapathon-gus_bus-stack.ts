import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class UnwrapathonGusBusStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create DynamoDB Table for Customer Reviews
    const ticketsTable = new dynamodb.Table(this, 'CustomerReviewsTable', {
      tableName: 'CustomerReviews',
      partitionKey: {
        name: 'PK',
        type: dynamodb.AttributeType.STRING
      },
      sortKey: {
        name: 'SK',
        type: dynamodb.AttributeType.STRING
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For dev - change to RETAIN for production
      pointInTimeRecovery: true
    });

    // Add GSI for querying by ReviewTimestamp
    ticketsTable.addGlobalSecondaryIndex({
      indexName: 'ReviewTimestampIndex',
      partitionKey: {
        name: 'SK',
        type: dynamodb.AttributeType.STRING
      },
      sortKey: {
        name: 'ReviewTimestamp',
        type: dynamodb.AttributeType.STRING
      },
      projectionType: dynamodb.ProjectionType.ALL
    });

    // Lambda function to get tickets
    const getTicketsLambda = new lambda.Function(this, 'GetTicketsFunction', {
      functionName: 'GusBus-GetTickets',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'getTickets.handler',
      code: lambda.Code.fromAsset('lambda'),
      timeout: cdk.Duration.seconds(30),
      environment: {
        TABLE_NAME: ticketsTable.tableName
      }
    });

    // Grant Lambda read access to DynamoDB
    ticketsTable.grantReadData(getTicketsLambda);

    // Create API Gateway
    const api = new apigateway.RestApi(this, 'TicketsApi', {
      restApiName: 'GusBus Tickets API',
      description: 'API for fetching customer review tickets',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization']
      }
    });

    // Add /tickets endpoint
    const tickets = api.root.addResource('tickets');
    const getTicketsIntegration = new apigateway.LambdaIntegration(getTicketsLambda);
    tickets.addMethod('GET', getTicketsIntegration);

    // Output API URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway URL for tickets endpoint'
    });

    // Output Table Name
    new cdk.CfnOutput(this, 'TableName', {
      value: ticketsTable.tableName,
      description: 'DynamoDB Table Name'
    });
  }
}
