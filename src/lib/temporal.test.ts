import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock @temporalio/client to prevent real gRPC connections in tests
vi.mock('@temporalio/client', () => ({
  Connection: { connect: vi.fn().mockRejectedValue(new Error('test: no gRPC in unit tests')) },
  Client: vi.fn(),
  WorkflowExecutionAlreadyStartedError: class extends Error {}
}))

import { TemporalClient } from './temporal'

describe('TemporalClient', () => {
  let client: TemporalClient
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    client = new TemporalClient()
    fetchMock = vi.fn()
    global.fetch = fetchMock
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('listWorkflows (HTTP)', () => {
    it('should construct correct URL with pagination', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ executions: [] })
      })

      await client.listWorkflows(25, 'nextToken123')

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/namespaces/default/workflows?pageSize=25&nextPageToken=nextToken123'),
        expect.any(Object)
      )
    })

    it('should throw on failure', async () => {
      fetchMock.mockResolvedValueOnce({ ok: false, statusText: 'Internal Server Error' })
      await expect(client.listWorkflows()).rejects.toThrow('Failed to list workflows')
    })

    it('should map workflow executions', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          executions: [{
            type: { name: 'InvestigateSingleRepoWorkflow' },
            execution: { workflowId: 'wf-1', runId: 'run-1' },
            status: 'RUNNING',
            startTime: '2026-01-01T00:00:00Z'
          }]
        })
      })

      const result = await client.listWorkflows()
      expect(result.executions).toHaveLength(1)
      expect(result.executions[0].workflowId).toBe('wf-1')
      expect(result.executions[0].type).toBe('single')
    })
  })

  describe('getWorkflow (HTTP)', () => {
    it('should use runId in URL when provided', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ workflowExecutionInfo: { execution: { workflowId: 'wf', runId: 'r' } } })
      })

      await client.getWorkflow('workflow-123', 'run-456')

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/workflows/workflow-123/runs/run-456'),
        expect.any(Object)
      )
    })

    it('should omit runId from URL when not provided', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ workflowExecutionInfo: { execution: { workflowId: 'wf', runId: 'r' } } })
      })

      await client.getWorkflow('workflow-123')

      const url = fetchMock.mock.calls[0][0]
      expect(url).toContain('/workflows/workflow-123')
      expect(url).not.toContain('/runs/')
    })

    it('should throw on failure', async () => {
      fetchMock.mockResolvedValueOnce({ ok: false, statusText: 'Not Found' })
      await expect(client.getWorkflow('wf-1')).rejects.toThrow('Failed to get workflow')
    })
  })

  describe('getWorkflowHistory (HTTP)', () => {
    it('should return mapped events', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          events: [{ eventId: '1', eventTime: '2026-01-01', eventType: 'WorkflowStarted' }]
        })
      })

      const result = await client.getWorkflowHistory('wf-1')
      expect(result.events).toHaveLength(1)
      expect(result.events[0].eventType).toBe('WorkflowStarted')
    })

    it('should throw on failure', async () => {
      fetchMock.mockResolvedValueOnce({ ok: false, statusText: 'Forbidden' })
      await expect(client.getWorkflowHistory('wf-1')).rejects.toThrow('Failed to get workflow history')
    })
  })

  describe('startWorkflow (gRPC)', () => {
    it('should throw when gRPC connection is unavailable', async () => {
      // In test env, gRPC is mocked to reject — verifies error handling
      await expect(client.startWorkflow('wf-1', 'TestWorkflow', {})).rejects.toThrow()
    })
  })

  describe('terminateWorkflow (gRPC)', () => {
    it('should throw when gRPC connection is unavailable', async () => {
      await expect(client.terminateWorkflow('wf-1')).rejects.toThrow()
    })
  })

  describe('checkHealth', () => {
    it('should fall back to HTTP when gRPC fails', async () => {
      fetchMock.mockResolvedValueOnce({ ok: true })
      const result = await client.checkHealth()
      expect(result).toBe(true)
    })

    it('should return false when both fail', async () => {
      fetchMock.mockRejectedValueOnce(new Error('HTTP failed'))
      const result = await client.checkHealth()
      expect(result).toBe(false)
    })
  })

  describe('Workflow type inference', () => {
    it('should infer single type', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          workflowExecutionInfo: {
            type: { name: 'SingleRepoInvestigateWorkflow' },
            execution: { workflowId: 't', runId: 't' }
          }
        })
      })
      const r = await client.getWorkflow('t')
      expect(r.type).toBe('single')
    })

    it('should infer daily type', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          workflowExecutionInfo: {
            type: { name: 'DailyScheduledWorkflow' },
            execution: { workflowId: 't', runId: 't' }
          }
        })
      })
      const r = await client.getWorkflow('t')
      expect(r.type).toBe('daily')
    })

    it('should default to multi type', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          workflowExecutionInfo: {
            type: { name: 'SomeOtherWorkflow' },
            execution: { workflowId: 't', runId: 't' }
          }
        })
      })
      const r = await client.getWorkflow('t')
      expect(r.type).toBe('multi')
    })
  })
})
