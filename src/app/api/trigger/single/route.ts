import { logger } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { temporalClient } from '@/lib/temporal'
import { dynamoService } from '@/lib/dynamodb'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { repoName, model, chunkSize } = body

    if (!repoName) {
      return NextResponse.json(
        { error: 'Repository name is required' },
        { status: 400 }
      )
    }

    // Get repo URL from DynamoDB
    const repo = await dynamoService.getRepo(repoName)
    const repoUrl = repo?.url || `https://git-codecommit.us-east-1.amazonaws.com/v1/repos/${repoName}`

    const workflowId = `investigate-single-${repoName}-${Date.now()}`

    const result = await temporalClient.startWorkflow(
      workflowId,
      'InvestigateSingleRepoWorkflow',
      {
        repo_name: repoName,
        repo_url: repoUrl,
        model: model || 'us.anthropic.claude-sonnet-4-6',
        chunk_size: chunkSize || 10
      }
    )

    return NextResponse.json({
      success: true,
      workflowId: result.workflowId,
      runId: result.runId,
      repoName
    })
  } catch (error) {
    logger.error('Error triggering single investigation:', { error: String(error) })
    return NextResponse.json(
      { error: 'Failed to trigger investigation' },
      { status: 500 }
    )
  }
}
