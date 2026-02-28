import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { SystemHealth } from '@/lib/types'

const TEMPORAL_HEALTH_API = process.env.TEMPORAL_HEALTH_API || 'https://zshclevi8i.execute-api.us-east-1.amazonaws.com/prod/health'

export async function GET() {
  try {
    const response = await fetch(TEMPORAL_HEALTH_API, {
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      throw new Error(`Health API returned ${response.status}`)
    }

    const data = await response.json()

    const health: SystemHealth = {
      temporal: {
        connected: data.temporal?.connected ?? false,
        namespace: data.temporal?.namespace || 'default',
        taskQueue: process.env.TEMPORAL_TASK_QUEUE || 'investigate-task-queue'
      },
      worker: {
        connected: data.worker?.connected ?? false,
        count: data.worker?.count ?? 0
      },
      api: data.temporal?.connected ? 'healthy' : 'degraded'
    }

    return NextResponse.json(health)
  } catch (error) {
    logger.error('Error checking health via Lambda:', { error: String(error) })
    return NextResponse.json(
      {
        temporal: { connected: false, namespace: 'unknown', taskQueue: 'unknown' },
        worker: { connected: false, count: 0 },
        api: 'error' as const
      },
      { status: 500 }
    )
  }
}
