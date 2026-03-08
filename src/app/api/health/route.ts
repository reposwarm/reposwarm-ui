import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { SystemHealth } from '@/lib/types'

export async function GET() {
  const temporalHealthAPI = process.env.TEMPORAL_HEALTH_API
  const apiServerURL = process.env.API_SERVER_URL || process.env.NEXT_PUBLIC_API_URL

  // Determine the health endpoint to check
  const healthURL = temporalHealthAPI || (apiServerURL ? `${apiServerURL}/health` : null)

  if (!healthURL) {
    // No health endpoint configured — return basic healthy response
    // Docker HEALTHCHECK only needs to know the Next.js process is alive
    return NextResponse.json({
      temporal: { connected: true, namespace: 'default', taskQueue: 'investigate-task-queue' },
      worker: { connected: true, count: 1 },
      api: 'healthy' as const
    })
  }

  try {
    const response = await fetch(healthURL, {
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
    logger.error('Error checking health:', { error: String(error) })
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
