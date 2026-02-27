import { NextRequest, NextResponse } from 'next/server'
import { temporalClient } from '@/lib/temporal'

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

    const workflowId = `investigate-single-${repoName}-${Date.now()}`

    const result = await temporalClient.startWorkflow(
      workflowId,
      'InvestigateSingleRepoWorkflow',
      {
        repoName,
        model: model || 'claude-3-opus-20240229',
        chunkSize: chunkSize || 10
      }
    )

    return NextResponse.json({
      success: true,
      workflowId: result.workflowId,
      runId: result.runId,
      repoName
    })
  } catch (error) {
    console.error('Error triggering single investigation:', error)
    return NextResponse.json(
      { error: 'Failed to trigger investigation' },
      { status: 500 }
    )
  }
}