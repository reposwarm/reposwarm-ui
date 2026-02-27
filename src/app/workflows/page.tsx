'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWorkflows } from '@/hooks/useWorkflows'
import { DataTable } from '@/components/DataTable'
import { StatusBadge } from '@/components/StatusBadge'
import { formatDate, formatDuration } from '@/lib/utils'
import { WorkflowExecution } from '@/lib/types'
import { Filter } from 'lucide-react'

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

  const columns = [
    {
      key: 'workflowId',
      header: 'Workflow ID',
      sortable: true,
      className: 'font-mono text-xs'
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      accessor: (row: WorkflowExecution) => (
        <span className="capitalize">{row.type}</span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (row: WorkflowExecution) => (
        <StatusBadge status={row.status} />
      )
    },
    {
      key: 'startTime',
      header: 'Start Time',
      accessor: (row: WorkflowExecution) => formatDate(row.startTime),
      sortable: true
    },
    {
      key: 'duration',
      header: 'Duration',
      accessor: (row: WorkflowExecution) =>
        row.duration ? formatDuration(row.duration) : '-',
      sortable: true
    },
    {
      key: 'repoCount',
      header: 'Repos',
      accessor: (row: WorkflowExecution) => row.repoCount || '-',
      sortable: true
    }
  ]

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-card rounded-lg border border-border p-6">
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

      {/* Workflows Table */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-lg font-semibold mb-4">Workflow Executions</h2>
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading workflows...
          </div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={filteredWorkflows}
              onRowClick={(row) => router.push(`/workflows/${row.workflowId}`)}
              emptyMessage="No workflows found"
            />
            {data?.nextPageToken && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => setPageToken(data.nextPageToken)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}