import { logger } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb'

const AWS_REGION = process.env.AWS_REGION || 'us-east-1'
const TABLE = process.env.DYNAMODB_CACHE_TABLE || 'reposwarm-cache'
const client = DynamoDBDocumentClient.from(new DynamoDBClient({ region: AWS_REGION }))

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ repo: string; section: string }> }
) {
  try {
    const { repo, section } = await params
    const decodedRepo = decodeURIComponent(repo)

    // Find the result entry for this repo+section (get latest version)
    const response = await client.send(new ScanCommand({
      TableName: TABLE,
      FilterExpression: 'begins_with(repository_name, :prefix) AND step_name = :step',
      ExpressionAttributeValues: {
        ':prefix': `_result_${decodedRepo}_`,
        ':step': section
      }
    }))

    if (!response.Items || response.Items.length === 0) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 })
    }

    // Get the most recent version
    const latest = response.Items.sort((a, b) =>
      (b.analysis_timestamp || 0) - (a.analysis_timestamp || 0)
    )[0]

    return NextResponse.json({
      repo: decodedRepo,
      section,
      content: latest.result_content || '',
      createdAt: latest.created_at,
      timestamp: latest.analysis_timestamp,
      referenceKey: latest.reference_key
    })
  } catch (error) {
    logger.error('Error getting wiki section:', { error: String(error) })
    return NextResponse.json({ error: 'Failed to get wiki section' }, { status: 500 })
  }
}
