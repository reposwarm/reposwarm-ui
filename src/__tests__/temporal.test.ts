import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock @temporalio/client to prevent real gRPC connections
vi.mock('@temporalio/client', () => ({
  Connection: { connect: vi.fn().mockRejectedValue(new Error('test: no gRPC')) },
  Client: vi.fn(),
  WorkflowExecutionAlreadyStartedError: class extends Error {}
}))

describe('TemporalClient', () => {
  let TemporalClient: any
  let mockFetch: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    vi.stubEnv('TEMPORAL_HTTP_URL', 'http://localhost:8233')
    vi.stubEnv('TEMPORAL_NAMESPACE', 'default')
    vi.stubEnv('TEMPORAL_TASK_QUEUE', 'investigate-task-queue')
    mockFetch = vi.fn()
    global.fetch = mockFetch
    // Re-import to pick up env vars
    const mod = await import('@/lib/temporal')
    TemporalClient = mod.TemporalClient
  })

  describe('checkHealth', () => {
    it('returns true when HTTP health check succeeds (gRPC fallback)', async () => {
      // gRPC is mocked to fail, so it falls back to HTTP
      mockFetch.mockResolvedValueOnce({ ok: true })
      const client = new TemporalClient()
      const result = await client.checkHealth()
      expect(result).toBe(true)
    })

    it('returns false when both gRPC and HTTP fail', async () => {
      mockFetch.mockRejectedValueOnce(new Error('ECONNREFUSED'))
      const client = new TemporalClient()
      const result = await client.checkHealth()
      expect(result).toBe(false)
    })

    it('returns false on non-200 HTTP response', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 503 })
      const client = new TemporalClient()
      const result = await client.checkHealth()
      expect(result).toBe(false)
    })
  })

  describe('listWorkflows', () => {
    it('returns mapped workflow executions', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          executions: [{
            execution: { workflowId: 'test-wf-1', runId: 'run-1' },
            type: { name: 'SingleRepoInvestigation' },
            status: 'WORKFLOW_EXECUTION_STATUS_COMPLETED',
            startTime: '2026-02-28T00:00:00Z',
            closeTime: '2026-02-28T00:05:00Z',
            taskQueue: { name: 'investigate-task-queue' },
          }],
          nextPageToken: null,
        }),
      })

      const client = new TemporalClient()
      const result = await client.listWorkflows(10)
      expect(result.executions).toHaveLength(1)
      expect(result.executions[0].workflowId).toBe('test-wf-1')
      expect(result.executions[0].type).toBe('single')
    })

    it('handles empty workflow list', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ executions: [], nextPageToken: null }),
      })

      const client = new TemporalClient()
      const result = await client.listWorkflows()
      expect(result.executions).toHaveLength(0)
    })

    it('throws on API error', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, statusText: 'Internal Server Error' })
      const client = new TemporalClient()
      await expect(client.listWorkflows()).rejects.toThrow('Failed to list workflows')
    })
  })

  describe('startWorkflow (gRPC)', () => {
    it('throws when gRPC is unavailable (expected in test env)', async () => {
      const client = new TemporalClient()
      await expect(client.startWorkflow('new-wf', 'TestWorkflow', {})).rejects.toThrow()
    })
  })
})
