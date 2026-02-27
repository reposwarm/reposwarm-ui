import { NextResponse } from 'next/server'
import { RepoSwarmConfig } from '@/lib/types'

export async function GET() {
  const config: RepoSwarmConfig = {
    defaultModel: process.env.DEFAULT_MODEL || 'claude-3-opus-20240229',
    chunkSize: parseInt(process.env.CHUNK_SIZE || '10'),
    sleepDuration: parseInt(process.env.SLEEP_DURATION || '2000'),
    parallelLimit: parseInt(process.env.PARALLEL_LIMIT || '3'),
    tokenLimit: parseInt(process.env.TOKEN_LIMIT || '200000'),
    scheduleExpression: process.env.SCHEDULE_EXPRESSION || 'rate(6 hours)'
  }

  return NextResponse.json(config)
}