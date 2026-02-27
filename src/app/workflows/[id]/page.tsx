'use client'

import { useParams, useRouter } from 'next/navigation'
import { useWorkflow, useWorkflowHistory, useTerminateWorkflow } from '@/hooks/useWorkflows'
import { StatusBadge } from '@/components/StatusBadge'
import { TimelineEvent } from '@/components/TimelineEvent'
import { JsonViewer } from '@/components/JsonViewer'
import { formatDate, formatDuration } from '@/lib/utils'
import { ArrowLeft, StopCircle, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { TriggerModal } from '@/components/TriggerModal'
import toast from 'react-hot-toast'

export default function WorkflowDetailPage() {
  const params = useParams()
  const router = useRouter()
  const workflowId = params.id as string
  const [showTerminateModal, setShowTerminateModal] = useState(false)

  const { data: workflow, isLoading: workflowLoading } = useWorkflow(workflowId)
  const { data: history, isLoading: historyLoading } = useWorkflowHistory(workflowId)
  const terminateWorkflow = useTerminateWorkflow()

  const handleTerminate = async () => {
    try {
      await terminateWorkflow.mutateAsync({
        workflowId,
        runId: workflow?.runId,
        reason: 'Terminated via UI'
      })
      toast.success('Workflow terminated successfully')
      setShowTerminateModal(false)
    } catch (error) {
      toast.error('Failed to terminate workflow')
    }
  }

  if (workflowLoading || historyLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading workflow details...</div>
      </div>
    )
  }

  if (!workflow) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Workflow not found</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => router.push('/workflows')}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold font-mono">{workflow.workflowId}</h1>
            <div className="flex items-center gap-4 mt-2">
              <StatusBadge status={workflow.status} />
              <span className="text-sm text-muted-foreground capitalize">
                {workflow.type} workflow
              </span>
            </div>
          </div>
          {workflow.status === 'Running' && (
            <button
              onClick={() => setShowTerminateModal(true)}
              className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-2"
            >
              <StopCircle className="h-4 w-4" />
              Terminate
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div>
            <p className="text-sm text-muted-foreground">Start Time</p>
            <p className="font-medium">{formatDate(workflow.startTime)}</p>
          </div>
          {workflow.closeTime && (
            <div>
              <p className="text-sm text-muted-foreground">End Time</p>
              <p className="font-medium">{formatDate(workflow.closeTime)}</p>
            </div>
          )}
          {workflow.duration && (
            <div>
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="font-medium">{formatDuration(workflow.duration)}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground">Task Queue</p>
            <p className="font-medium">{workflow.taskQueueName}</p>
          </div>
        </div>
      </div>

      {/* Input/Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Input</h2>
          <div className="bg-background p-4 rounded-lg border border-border overflow-auto max-h-96">
            <JsonViewer data={workflow.input} defaultExpanded />
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Output</h2>
          <div className="bg-background p-4 rounded-lg border border-border overflow-auto max-h-96">
            <JsonViewer data={workflow.result || workflow.memo} defaultExpanded />
          </div>
        </div>
      </div>

      {/* Event History */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-lg font-semibold mb-4">Event History</h2>
        <div className="space-y-2">
          {history?.events.map((event, index) => (
            <TimelineEvent
              key={event.eventId}
              event={event}
              isLast={index === history.events.length - 1}
            />
          ))}
        </div>
      </div>

      {/* Terminate Modal */}
      <TriggerModal
        isOpen={showTerminateModal}
        onClose={() => setShowTerminateModal(false)}
        onConfirm={handleTerminate}
        title="Terminate Workflow"
        description="Are you sure you want to terminate this workflow? This action cannot be undone."
        confirmText="Terminate"
        isLoading={terminateWorkflow.isPending}
      />
    </div>
  )
}