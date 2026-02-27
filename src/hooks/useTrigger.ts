import { useMutation, useQueryClient } from '@tanstack/react-query'
import { TriggerRequest } from '@/lib/types'
import toast from 'react-hot-toast'

export function useTriggerSingle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (request: TriggerRequest) => {
      const response = await fetch('/api/trigger/single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      })
      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || 'Failed to trigger investigation')
      }
      return response.json()
    },
    onSuccess: (data) => {
      toast.success(`Investigation started for ${data.repoName}`)
      queryClient.invalidateQueries({ queryKey: ['workflows'] })
    },
    onError: (error: Error) => {
      toast.error(`Failed to trigger: ${error.message}`)
    }
  })
}

export function useTriggerDaily() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (request?: TriggerRequest) => {
      const response = await fetch('/api/trigger/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request || {})
      })
      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || 'Failed to trigger daily investigation')
      }
      return response.json()
    },
    onSuccess: () => {
      toast.success('Daily investigation started')
      queryClient.invalidateQueries({ queryKey: ['workflows'] })
    },
    onError: (error: Error) => {
      toast.error(`Failed to trigger: ${error.message}`)
    }
  })
}