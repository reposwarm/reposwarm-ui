import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { GET } from './route'

// Mock NextResponse
vi.mock('next/server', () => ({
  NextResponse: {
    json: (data: any, init?: ResponseInit) => {
      return new Response(JSON.stringify(data), {
        status: init?.status || 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }
}))

// Mock global fetch
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('Health API Route', () => {
  const origEnv = { ...process.env }

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.TEMPORAL_NAMESPACE = 'default'
    process.env.TEMPORAL_TASK_QUEUE = 'investigate-task-queue'
  })

  afterEach(() => {
    vi.restoreAllMocks()
    // Restore env
    delete process.env.TEMPORAL_HEALTH_API
    delete process.env.API_SERVER_URL
    delete process.env.NEXT_PUBLIC_API_URL
  })

  describe('with health API configured', () => {
    it('should return healthy status when temporal is connected', async () => {
      process.env.TEMPORAL_HEALTH_API = 'https://example.com/health'
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          temporal: { connected: true, namespace: 'default' },
          worker: { connected: true, count: 1 },
        })
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.temporal.connected).toBe(true)
      expect(data.worker.connected).toBe(true)
      expect(data.worker.count).toBe(1)
      expect(data.api).toBe('healthy')
    })

    it('should return degraded status when temporal is not connected', async () => {
      process.env.TEMPORAL_HEALTH_API = 'https://example.com/health'
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          temporal: { connected: false, namespace: 'default' },
          worker: { connected: false, count: 0 },
        })
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.temporal.connected).toBe(false)
      expect(data.api).toBe('degraded')
    })

    it('should return error status when health check throws', async () => {
      process.env.TEMPORAL_HEALTH_API = 'https://example.com/health'
      mockFetch.mockRejectedValue(new Error('Network error'))
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.temporal.connected).toBe(false)
      expect(data.api).toBe('error')
      consoleErrorSpy.mockRestore()
    })

    it('should use custom task queue from environment', async () => {
      process.env.TEMPORAL_HEALTH_API = 'https://example.com/health'
      process.env.TEMPORAL_TASK_QUEUE = 'custom-queue'
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          temporal: { connected: true, namespace: 'custom-ns' },
          worker: { connected: true, count: 1 },
        })
      })

      const response = await GET()
      const data = await response.json()

      expect(data.temporal.taskQueue).toBe('custom-queue')
    })

    it('should handle non-ok response from health API', async () => {
      process.env.TEMPORAL_HEALTH_API = 'https://example.com/health'
      mockFetch.mockResolvedValue({ ok: false, status: 503 })
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.temporal.connected).toBe(false)
      consoleErrorSpy.mockRestore()
    })

    it('should use default values when env vars are not set', async () => {
      process.env.TEMPORAL_HEALTH_API = 'https://example.com/health'
      delete process.env.TEMPORAL_TASK_QUEUE
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          temporal: { connected: true, namespace: 'default' },
          worker: { connected: true, count: 1 },
        })
      })

      const response = await GET()
      const data = await response.json()

      expect(data.temporal.namespace).toBe('default')
      expect(data.temporal.taskQueue).toBe('investigate-task-queue')
    })
  })

  describe('local Docker mode (no health API)', () => {
    it('should return basic healthy response when no health endpoint configured', async () => {
      delete process.env.TEMPORAL_HEALTH_API
      delete process.env.API_SERVER_URL
      delete process.env.NEXT_PUBLIC_API_URL

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.temporal.connected).toBe(true)
      expect(data.api).toBe('healthy')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should use API_SERVER_URL when TEMPORAL_HEALTH_API is not set', async () => {
      delete process.env.TEMPORAL_HEALTH_API
      process.env.API_SERVER_URL = 'http://localhost:3000/v1'
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          temporal: { connected: true, namespace: 'default' },
          worker: { connected: true, count: 1 },
        })
      })

      const response = await GET()
      expect(response.status).toBe(200)
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/health',
        expect.any(Object)
      )
    })
  })
})
