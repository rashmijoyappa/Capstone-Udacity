import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { createLogger } from '../utils/logger'
import { eventItem } from '../models/eventItem'

let XAWS
if (process.env.AWS_XRAY_CONTEXT_MISSING) {
  console.log('Serverless Offline detected; skipping AWS X-Ray setup')
  XAWS = AWS
} else {
  XAWS = AWSXRay.captureAWS(AWS)
}
const logger = createLogger('event-access')

export class eventAcces {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly s3 = createS3Client(),
    private readonly eventsTable = process.env.event_TABLE,
    private readonly bucketName = process.env.ATTACHMENTS_S3_BUCKET,
    private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION,
    private readonly indexName = process.env.event_TABLE_IDX
  ) {
    //
  }

  async getAllevents(userId: string): Promise<eventItem[]> {
    logger.info('Getting all event items')

    const result = await this.docClient
      .query({
        TableName: this.eventsTable,
        IndexName: this.indexName,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        },
        ScanIndexForward: false
      })
      .promise()

    const items = result.Items

    return items as eventItem[]
  }

  async createevent(event: eventItem): Promise<eventItem> {
    logger.info(`Creating a event with ID ${event.eventId}`)

    const newItem = {
      ...event,
      attachmentUrl: `https://${this.bucketName}.s3.amazonaws.com/${event.eventId}`
    }

    await this.docClient
      .put({
        TableName: this.eventsTable,
        Item: newItem
      })
      .promise()

    return event
  }

  async updateevent(event: eventItem): Promise<eventItem> {
    logger.info(`Updating a event with ID ${event.eventId}`)

    const updateExpression = 'set #n = :name, dueDate = :dueDate, done = :done'

    await this.docClient
      .update({
        TableName: this.eventsTable,
        Key: {
          userId: event.userId,
          eventId: event.eventId
        },
        UpdateExpression: updateExpression,
        ConditionExpression: 'eventId = :eventId',
        ExpressionAttributeValues: {
          ':name': event.name,
          ':dueDate': event.dueDate,
          ':done': event.done,
          ':eventId': event.eventId
        },
        ExpressionAttributeNames: {
          '#n': 'name'
        },
        ReturnValues: 'UPDATED_NEW'
      })
      .promise()

    return event
  }

  async deleteevent(eventId: string, userId: string): Promise<string> {
    logger.info(`Deleting a event with ID ${eventId}`)

    await this.docClient
      .delete({
        TableName: this.eventsTable,
        Key: {
          userId,
          eventId
        },
        ConditionExpression: 'eventId = :eventId',
        ExpressionAttributeValues: {
          ':eventId': eventId
        }
      })
      .promise()

    return userId
  }

  async generateUploadUrl(eventId: string): Promise<string> {
    logger.info('Generating upload Url')

    return this.s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: eventId,
      Expires: this.urlExpiration
    })
  }
}

const createDynamoDBClient = () => {
  if (process.env.IS_OFFLINE) {
    logger.info('Creating a local DynamoDB instance')

    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  } else {
    return new XAWS.DynamoDB.DocumentClient()
  }
}

const createS3Client = () => {
  if (process.env.IS_OFFLINE) {
    logger.info('Creating a local S3 instance')

    return new AWS.S3({
      s3ForcePathStyle: true,
      // endpoint: new AWS.Endpoint('http://localhost:8200'),
      endpoint: 'http://localhost:8200',
      accessKeyId: 'S3RVER',
      secretAccessKey: 'S3RVER'
    })
  } else {
    return new XAWS.S3({ signatureVersion: 'v4' })
  }
}
