'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWorkflows } from '@/hooks/useWorkflows'
import { StatusBadge } from '@/components/StatusBadge'
import { formatDate, formatDuration } from '@/lib/utils'
import { WorkflowExecution } from '@/lib/types'
import { Filter, BookOpen, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

function extractRepoName(workflowId: string): string | null {
  // investigate-single-{repoName}-{timestamp}
  const singleMatch = workflowId.match(/^investigate-single-(.+)-\d+$/)
  if (singleMatch) return singleMatch[1]
  return null
}

export default function WorkflowsPage() {
  const router = useRouter()
  const [pageToken, setPageToken] = useState<string>()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const { data, isLoading } = useWorkflows(25, pageToken)

  const filteredWorkflows = (data?.executions || []).filter((w: WorkflowExecution) => {
    if (statusFilter !== 'all' && w.status.toLowerCase() !== statusFilter) return false
    if (typeFilter !== 'all' && w.type !== typeFilter) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-card rounded-lg border border-border p-4 lg:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Filters</h2>
        </div>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All</option>
              <option value="running">Running</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="terminated">Terminated</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All</option>
              <option value="single">Single Repo</option>
              <option value="multi">Multi Repo</option>
              <option value="daily">Daily</option>
            </select>
          </div>
        </div>
      </div>

      {/* Workflows */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="bg-card rounded-lg border border-border p-12 text-center text-muted-foreground">
            Loading workflows...
          </div>
        ) : filteredWorkflows.length === 0 ? (
          <div className="bg-card rounded-lg border border-border p-12 text-center text-muted-foreground">
            No workflows found
          </div>
        ) : (
          filteredWorkflows.map((wf: WorkflowExecution) => {
            const repoName = extractRepoName(wf.workflowId)
            const isCompleted = wf.status.toLowerCase() === 'completed'
            const isRunning = wf.status.toLowerCase() === 'running'
            const isFailed = wf.status.toLowerCase() === 'failed'
            const isTerminated = wf.status.toLowerCase() === 'terminated'

            return (
              <div
                key={`${wf.workflowId}-${wf.runId}`}
                className={cn(
                  'bg-card rounded-lg border p-4 lg:p-5 transition-all',
                  isRunning ? 'border-yellow-500/30 shadow-sm shadow-yellow-500/5' :
                  isCompleted ? 'border-green-500/30' :
                  isFailed ? 'border-red-500/30' :
                  isTerminated ? 'border-purple-500/20' :
                  'border-border'
                )}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={cn(
                      'w-1 h-12 rounded-full shrink-0',
                      isRunning ? 'bg-yellow-500 animate-pulse' :
                      isCompleted ? 'bg-green-500' :
                      isFailed ? 'bg-red-500' :
                      'bg-purple-500'
                    )} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm truncate">{wf.workflowId}</span>
                        <StatusBadge status={wf.status} />
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span className="capitalize">{wf.type} repo</span>
                        <span>{formatDate(wf.startTime)}</span>
                        {wf.duration && <span>{formatDuration(wf.duration)}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pl-4 lg:pl-0">
                    {isCompleted && repoName && (
                      <Link
                        href={`/repos/${encodeURIComponent(repoName)}/wiki`}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        View Wiki
                      </Link>
                    )}
                    <button
                      onClick={() => router.push(`/workflows/${wf.workflowId}`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Details
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}

        {data?.nextPageToken && (
          <div className="flex justify-center pt-2">
            <button
              onClick={() => setPageToken(data.nextPageToken)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
