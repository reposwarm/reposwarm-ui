import { NextRequest, NextResponse } from 'next/server'
import { temporalClient } from '@/lib/temporal'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams
    const runId = searchParams.get('runId') || undefined

    const history = await temporalClient.getWorkflowHistory(params.id, runId)

    return NextResponse.json(history)
  } catch (error) {
    console.error('Error getting workflow history:', error)
    return NextResponse.json(
      { error: 'Failed to get workflow history' },
      { status: 500 }
    )
  }
}