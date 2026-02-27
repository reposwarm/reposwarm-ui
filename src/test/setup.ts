import '@testing-library/jest-dom'

// Mock environment variables for tests
process.env.NEXT_PUBLIC_TEMPORAL_ADDRESS = 'http://localhost:7233'
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000'

// Mock fetch for API tests
global.fetch = vi.fn()

// Reset mocks after each test
afterEach(() => {
  vi.clearAllMocks()
})