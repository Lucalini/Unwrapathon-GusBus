import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import * as path from "path";

export class UnwrapathonGusBusStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ========================================
    // DynamoDB Table
    // ========================================
    const reviewsTable = new dynamodb.Table(this, "ReviewsTable", {
      tableName: "CustomerReviews",
      partitionKey: {
        name: "PK",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "SK",
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For dev/test only
    });

    // ========================================
    // Processing Lambda Function
    // ========================================
    const processingLambda = new NodejsFunction(this, "ProcessingLambda", {
      functionName: "ReviewProcessingLambda",
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "handler",
      entry: path.join(__dirname, "../lambda/processing-lambda.ts"),
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
        TABLE_NAME: reviewsTable.tableName,
      },
      bundling: {
        externalModules: ["@aws-sdk/*"],
        minify: true,
      },
    });

    // Grant Lambda permissions to write to DynamoDB
    reviewsTable.grantWriteData(processingLambda);

    // Grant Lambda permissions to invoke Bedrock
    processingLambda.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "bedrock:InvokeModel",
          "bedrock:InvokeModelWithResponseStream",
        ],
        resources: [
          "arn:aws:bedrock:*::foundation-model/anthropic.claude-3-haiku-20240307-v1:0",
        ],
      })
    );

    // Grant permissions for AWS Marketplace models (Anthropic)
    processingLambda.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "aws-marketplace:ViewSubscriptions",
          "aws-marketplace:Subscribe",
        ],
        resources: ["*"],
        conditions: {
          StringEquals: {
            "aws:CalledViaLast": "bedrock.amazonaws.com",
          },
        },
      })
    );

    // ========================================
    // Get Reviews Lambda Function
    // ========================================
    const getReviewsLambda = new NodejsFunction(this, "GetReviewsLambda", {
      functionName: "GetReviewsLambda",
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "handler",
      entry: path.join(__dirname, "../lambda/get-reviews-lambda.ts"),
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      environment: {
        TABLE_NAME: reviewsTable.tableName,
      },
      bundling: {
        externalModules: ["@aws-sdk/*"],
        minify: true,
      },
    });

    // Grant Lambda permissions to read from DynamoDB
    reviewsTable.grantReadData(getReviewsLambda);

    // ========================================
    // Chatbot Lambda Function
    // ========================================
    const chatbotLambda = new NodejsFunction(this, "ChatbotLambda", {
      functionName: "ChatbotLambda",
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "handler",
      entry: path.join(__dirname, "../lambda/chatbot-lambda.ts"),
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      bundling: {
        externalModules: ["@aws-sdk/*"],
        minify: true,
      },
    });

    // Grant Lambda permissions to invoke Bedrock
    chatbotLambda.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "bedrock:InvokeModel",
          "bedrock:InvokeModelWithResponseStream",
        ],
        resources: [
          "arn:aws:bedrock:*::foundation-model/anthropic.claude-3-haiku-20240307-v1:0",
        ],
      })
    );

    // Grant permissions for AWS Marketplace models (Anthropic)
    chatbotLambda.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "aws-marketplace:ViewSubscriptions",
          "aws-marketplace:Subscribe",
        ],
        resources: ["*"],
        conditions: {
          StringEquals: {
            "aws:CalledViaLast": "bedrock.amazonaws.com",
          },
        },
      })
    );

    // ========================================
    // API Gateway
    // ========================================
    const api = new apigateway.RestApi(this, "ReviewsApi", {
      restApiName: "Customer Reviews API",
      description: "API for processing and retrieving customer reviews",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          "Content-Type",
          "X-Amz-Date",
          "Authorization",
          "X-Api-Key",
          "X-Amz-Security-Token",
        ],
      },
      deployOptions: {
        stageName: "prod",
        throttlingRateLimit: 100,
        throttlingBurstLimit: 200,
      },
    });

    // POST /reviews endpoint - Submit new review
    const reviewsResource = api.root.addResource("reviews");
    const postIntegration = new apigateway.LambdaIntegration(processingLambda);
    reviewsResource.addMethod("POST", postIntegration);

    // GET /reviews endpoint - Retrieve all reviews
    const getIntegration = new apigateway.LambdaIntegration(getReviewsLambda);
    reviewsResource.addMethod("GET", getIntegration);

    // POST /chat endpoint - Chat with bot
    const chatResource = api.root.addResource("chat");
    const chatIntegration = new apigateway.LambdaIntegration(chatbotLambda);
    chatResource.addMethod("POST", chatIntegration);

    // ========================================
    // S3 Bucket for Service Suite UI
    // ========================================
    const serviceSuiteBucket = new s3.Bucket(this, "ServiceSuiteBucket", {
      bucketName: `service-suite-ui-${this.account}`,
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "error.html",
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For dev/test only
      autoDeleteObjects: true, // For dev/test only
      encryption: s3.BucketEncryption.S3_MANAGED,
    });

    // ========================================
    // CloudFront Distribution
    // ========================================
    const distribution = new cloudfront.Distribution(
      this,
      "ServiceSuiteDistribution",
      {
        defaultBehavior: {
          origin: new origins.S3Origin(serviceSuiteBucket),
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        },
        defaultRootObject: "index.html",
        errorResponses: [
          {
            httpStatus: 404,
            responseHttpStatus: 200,
            responsePagePath: "/index.html",
            ttl: cdk.Duration.minutes(5),
          },
        ],
      }
    );

    // ========================================
    // Outputs
    // ========================================
    new cdk.CfnOutput(this, "ApiEndpoint", {
      value: api.url,
      description: "API Gateway endpoint URL",
      exportName: "ReviewsApiEndpoint",
    });

    new cdk.CfnOutput(this, "ApiPostEndpoint", {
      value: `${api.url}reviews`,
      description: "POST endpoint for submitting reviews",
      exportName: "ReviewsApiPostEndpoint",
    });

    new cdk.CfnOutput(this, "ApiGetEndpoint", {
      value: `${api.url}reviews`,
      description: "GET endpoint for retrieving reviews",
      exportName: "ReviewsApiGetEndpoint",
    });

    new cdk.CfnOutput(this, "ApiChatEndpoint", {
      value: `${api.url}chat`,
      description: "POST endpoint for chatbot conversation",
      exportName: "ReviewsApiChatEndpoint",
    });

    new cdk.CfnOutput(this, "DynamoDBTableName", {
      value: reviewsTable.tableName,
      description: "DynamoDB table name",
      exportName: "ReviewsTableName",
    });

    new cdk.CfnOutput(this, "S3BucketName", {
      value: serviceSuiteBucket.bucketName,
      description: "S3 bucket for service suite UI",
      exportName: "ServiceSuiteBucketName",
    });

    new cdk.CfnOutput(this, "CloudFrontUrl", {
      value: `https://${distribution.distributionDomainName}`,
      description: "CloudFront distribution URL",
      exportName: "ServiceSuiteUrl",
    });

    new cdk.CfnOutput(this, "CloudFrontDistributionId", {
      value: distribution.distributionId,
      description: "CloudFront distribution ID",
      exportName: "CloudFrontDistributionId",
    });
  }
}
