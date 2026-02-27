import { NextRequest, NextResponse } from 'next/server'
import { temporalClient } from '@/lib/temporal'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { runId, reason } = body

    await temporalClient.terminateWorkflow(params.id, runId, reason)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error terminating workflow:', error)
    return NextResponse.json(
      { error: 'Failed to terminate workflow' },
      { status: 500 }
    )
  }
}