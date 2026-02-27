import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { WorkflowExecution, WorkflowHistory } from '@/lib/types'

export function useWorkflows(pageSize = 25, pageToken?: string) {
  return useQuery({
    queryKey: ['workflows', pageSize, pageToken],
    queryFn: async () => {
      const params = new URLSearchParams({
        pageSize: pageSize.toString(),
        ...(pageToken && { pageToken })
      })
      const response = await fetch(`/api/workflows?${params}`)
      if (!response.ok) throw new Error('Failed to fetch workflows')
      return response.json()
    }
  })
}

export function useWorkflow(workflowId: string, runId?: string) {
  return useQuery({
    queryKey: ['workflow', workflowId, runId],
    queryFn: async () => {
      const params = runId ? `?runId=${runId}` : ''
      const response = await fetch(`/api/workflows/${workflowId}${params}`)
      if (!response.ok) throw new Error('Failed to fetch workflow')
      return response.json() as Promise<WorkflowExecution>
    },
    enabled: !!workflowId
  })
}

export function useWorkflowHistory(workflowId: string, runId?: string) {
  return useQuery({
    queryKey: ['workflow-history', workflowId, runId],
    queryFn: async () => {
      const params = runId ? `?runId=${runId}` : ''
      const response = await fetch(`/api/workflows/${workflowId}/history${params}`)
      if (!response.ok) throw new Error('Failed to fetch workflow history')
      return response.json() as Promise<WorkflowHistory>
    },
    enabled: !!workflowId
  })
}

export function useTerminateWorkflow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ workflowId, runId, reason }: {
      workflowId: string
      runId?: string
      reason?: string
    }) => {
      const response = await fetch(`/api/workflows/${workflowId}/terminate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ runId, reason })
      })
      if (!response.ok) throw new Error('Failed to terminate workflow')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] })
      queryClient.invalidateQueries({ queryKey: ['workflow'] })
    }
  })
}