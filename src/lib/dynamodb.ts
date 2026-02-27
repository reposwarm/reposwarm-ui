import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, ScanCommand, PutCommand, DeleteCommand, GetCommand } from '@aws-sdk/lib-dynamodb'
import { Repository } from './types'

const AWS_REGION = process.env.AWS_REGION || 'us-east-1'
const DYNAMODB_CACHE_TABLE = process.env.DYNAMODB_CACHE_TABLE || 'reposwarm-cache'

const client = new DynamoDBClient({ region: AWS_REGION })
const docClient = DynamoDBDocumentClient.from(client)

export class DynamoDBService {
  private tableName: string

  constructor() {
    this.tableName = DYNAMODB_CACHE_TABLE
  }

  async listRepos(): Promise<Repository[]> {
    try {
      const command = new ScanCommand({
        TableName: this.tableName,
        FilterExpression: 'begins_with(#pk, :prefix)',
        ExpressionAttributeNames: {
          '#pk': 'PK'
        },
        ExpressionAttributeValues: {
          ':prefix': 'REPO#'
        }
      })

      const response = await docClient.send(command)

      return (response.Items || []).map(item => ({
        name: item.repoName || item.SK?.replace('REPO#', '') || '',
        url: item.url || '',
        source: item.source || 'GitHub',
        lastAnalyzed: item.lastAnalyzed,
        lastCommit: item.lastCommit,
        enabled: item.enabled !== false,
        status: item.status || 'active',
        architectureDoc: item.architectureDoc
      }))
    } catch (error) {
      console.error('Error listing repos:', error)
      return []
    }
  }

  async getRepo(name: string): Promise<Repository | null> {
    try {
      const command = new GetCommand({
        TableName: this.tableName,
        Key: {
          PK: `REPO#${name}`,
          SK: `REPO#${name}`
        }
      })

      const response = await docClient.send(command)

      if (!response.Item) {
        return null
      }

      return {
        name: response.Item.repoName || name,
        url: response.Item.url || '',
        source: response.Item.source || 'GitHub',
        lastAnalyzed: response.Item.lastAnalyzed,
        lastCommit: response.Item.lastCommit,
        enabled: response.Item.enabled !== false,
        status: response.Item.status || 'active',
        architectureDoc: response.Item.architectureDoc
      }
    } catch (error) {
      console.error('Error getting repo:', error)
      return null
    }
  }

  async addRepo(repo: Repository): Promise<void> {
    const command = new PutCommand({
      TableName: this.tableName,
      Item: {
        PK: `REPO#${repo.name}`,
        SK: `REPO#${repo.name}`,
        repoName: repo.name,
        url: repo.url,
        source: repo.source,
        enabled: repo.enabled,
        status: repo.status || 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    })

    await docClient.send(command)
  }

  async updateRepo(name: string, updates: Partial<Repository>): Promise<void> {
    const existingRepo = await this.getRepo(name)
    if (!existingRepo) {
      throw new Error('Repository not found')
    }

    const command = new PutCommand({
      TableName: this.tableName,
      Item: {
        PK: `REPO#${name}`,
        SK: `REPO#${name}`,
        repoName: name,
        ...existingRepo,
        ...updates,
        updatedAt: new Date().toISOString()
      }
    })

    await docClient.send(command)
  }

  async deleteRepo(name: string): Promise<void> {
    const command = new DeleteCommand({
      TableName: this.tableName,
      Key: {
        PK: `REPO#${name}`,
        SK: `REPO#${name}`
      }
    })

    await docClient.send(command)
  }

  async getCacheEntry(key: string): Promise<any> {
    try {
      const command = new GetCommand({
        TableName: this.tableName,
        Key: {
          PK: `CACHE#${key}`,
          SK: `CACHE#${key}`
        }
      })

      const response = await docClient.send(command)
      return response.Item?.data || null
    } catch (error) {
      console.error('Error getting cache entry:', error)
      return null
    }
  }

  async setCacheEntry(key: string, data: any, ttl?: number): Promise<void> {
    const command = new PutCommand({
      TableName: this.tableName,
      Item: {
        PK: `CACHE#${key}`,
        SK: `CACHE#${key}`,
        data,
        updatedAt: new Date().toISOString(),
        ...(ttl && { TTL: Math.floor(Date.now() / 1000) + ttl })
      }
    })

    await docClient.send(command)
  }
}

export const dynamoService = new DynamoDBService()