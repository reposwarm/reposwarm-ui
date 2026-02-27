import { NextRequest, NextResponse } from 'next/server'
import { temporalClient } from '@/lib/temporal'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams
    const runId = searchParams.get('runId') || undefined

    const workflow = await temporalClient.getWorkflow(params.id, runId)

    return NextResponse.json(workflow)
  } catch (error) {
    console.error('Error getting workflow:', error)
    return NextResponse.json(
      { error: 'Failed to get workflow' },
      { status: 500 }
    )
  }
}