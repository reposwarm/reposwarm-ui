import { describe, it, expect } from 'vitest'
import type { WorkflowStatus, WorkflowType, WorkflowExecution, Repository, SystemHealth } from './types'

describe('Type definitions', () => {
  describe('WorkflowStatus', () => {
    it('should accept valid workflow statuses', () => {
      const validStatuses: WorkflowStatus[] = [
        'Running',
        'Completed',
        'Failed',
        'Terminated',
        'TimedOut',
        'Canceled'
      ]

      validStatuses.forEach(status => {
        expect(status).toBeTruthy()
      })
    })
  })

  describe('WorkflowType', () => {
    it('should accept valid workflow types', () => {
      const validTypes: WorkflowType[] = ['single', 'multi', 'daily']

      validTypes.forEach(type => {
        expect(type).toBeTruthy()
      })
    })
  })

  describe('WorkflowExecution', () => {
    it('should create valid WorkflowExecution object', () => {
      const execution: WorkflowExecution = {
        workflowId: 'test-workflow',
        runId: 'run-123',
        type: 'single',
        status: 'Running',
        startTime: '2024-01-01T00:00:00Z',
        taskQueueName: 'test-queue'
      }

      expect(execution.workflowId).toBe('test-workflow')
      expect(execution.runId).toBe('run-123')
      expect(execution.type).toBe('single')
      expect(execution.status).toBe('Running')
    })

    it('should allow optional fields in WorkflowExecution', () => {
      const execution: WorkflowExecution = {
        workflowId: 'test-workflow',
        runId: 'run-123',
        type: 'multi',
        status: 'Completed',
        startTime: '2024-01-01T00:00:00Z',
        closeTime: '2024-01-01T01:00:00Z',
        duration: 3600000,
        repoCount: 5,
        taskQueueName: 'test-queue',
        input: { test: 'data' },
        result: { success: true },
        memo: { key: 'value' }
      }

      expect(execution.closeTime).toBe('2024-01-01T01:00:00Z')
      expect(execution.duration).toBe(3600000)
      expect(execution.repoCount).toBe(5)
      expect(execution.input).toEqual({ test: 'data' })
      expect(execution.result).toEqual({ success: true })
      expect(execution.memo).toEqual({ key: 'value' })
    })
  })

  describe('Repository', () => {
    it('should create valid Repository object', () => {
      const repo: Repository = {
        name: 'test-repo',
        url: 'https://github.com/test/repo',
        source: 'GitHub',
        enabled: true
      }

      expect(repo.name).toBe('test-repo')
      expect(repo.url).toBe('https://github.com/test/repo')
      expect(repo.source).toBe('GitHub')
      expect(repo.enabled).toBe(true)
    })

    it('should accept CodeCommit as source', () => {
      const repo: Repository = {
        name: 'test-repo',
        url: 'codecommit://test-repo',
        source: 'CodeCommit',
        enabled: false,
        status: 'inactive',
        lastAnalyzed: '2024-01-01T00:00:00Z',
        lastCommit: 'abc123',
        architectureDoc: 'Architecture overview...'
      }

      expect(repo.source).toBe('CodeCommit')
      expect(repo.status).toBe('inactive')
      expect(repo.lastAnalyzed).toBe('2024-01-01T00:00:00Z')
    })
  })

  describe('SystemHealth', () => {
    it('should create valid SystemHealth object', () => {
      const health: SystemHealth = {
        temporal: {
          connected: true,
          namespace: 'default',
          taskQueue: 'test-queue'
        },
        worker: {
          connected: true,
          count: 2
        },
        api: 'healthy'
      }

      expect(health.temporal.connected).toBe(true)
      expect(health.worker.count).toBe(2)
      expect(health.api).toBe('healthy')
    })

    it('should accept different api states', () => {
      const states: SystemHealth['api'][] = ['healthy', 'degraded', 'error']

      states.forEach(state => {
        const health: SystemHealth = {
          temporal: {
            connected: false,
            namespace: 'default',
            taskQueue: 'test-queue'
          },
          worker: {
            connected: false,
            count: 0
          },
          api: state
        }

        expect(health.api).toBe(state)
      })
    })
  })
})