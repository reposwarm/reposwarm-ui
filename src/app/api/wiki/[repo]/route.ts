import { logger } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb'

const AWS_REGION = process.env.AWS_REGION || 'us-east-1'
const TABLE = process.env.DYNAMODB_CACHE_TABLE || 'reposwarm-cache'
const client = DynamoDBDocumentClient.from(new DynamoDBClient({ region: AWS_REGION }))

const SECTION_ORDER = [
  'hl_overview', 'core_entities', 'APIs', 'api_surface', 'internals',
  'module_deep_dive', 'data_mapping', 'DBs', 'authentication', 'authorization',
  'security_check', 'prompt_security_check', 'dependencies', 'service_dependencies',
  'deployment', 'monitoring', 'events', 'feature_flags', 'ml_services'
]

const SECTION_LABELS: Record<string, string> = {
  hl_overview: 'Overview',
  core_entities: 'Core Entities',
  APIs: 'APIs',
  api_surface: 'API Surface',
  internals: 'Internals',
  module_deep_dive: 'Module Deep Dive',
  data_mapping: 'Data Mapping',
  DBs: 'Databases',
  authentication: 'Authentication',
  authorization: 'Authorization',
  security_check: 'Security',
  prompt_security_check: 'Prompt Security',
  dependencies: 'Dependencies',
  service_dependencies: 'Service Dependencies',
  deployment: 'Deployment',
  monitoring: 'Monitoring',
  events: 'Events',
  feature_flags: 'Feature Flags',
  ml_services: 'ML Services'
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ repo: string }> }
) {
  try {
    const { repo } = await params
    const decodedRepo = decodeURIComponent(repo)

    const response = await client.send(new ScanCommand({
      TableName: TABLE,
      FilterExpression: 'begins_with(repository_name, :prefix) AND attribute_exists(step_name)',
      ExpressionAttributeValues: {
        ':prefix': `_result_${decodedRepo}_`
      },
      ProjectionExpression: 'step_name, analysis_timestamp, created_at'
    }))

    const sections = (response.Items || []).map(item => ({
      id: item.step_name,
      label: SECTION_LABELS[item.step_name] || item.step_name.replace(/_/g, ' '),
      timestamp: item.analysis_timestamp,
      createdAt: item.created_at
    }))

    // Sort by defined order, unknowns at the end
    sections.sort((a, b) => {
      const ai = SECTION_ORDER.indexOf(a.id)
      const bi = SECTION_ORDER.indexOf(b.id)
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
    })

    return NextResponse.json({
      repo: decodedRepo,
      sections,
      hasDocs: sections.length > 0
    })
  } catch (error) {
    logger.error('Error listing wiki sections:', { error: String(error) })
    return NextResponse.json({ error: 'Failed to list wiki sections' }, { status: 500 })
  }
}
