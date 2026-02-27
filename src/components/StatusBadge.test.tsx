import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBadge } from './StatusBadge'

describe('StatusBadge', () => {
  describe('rendering different statuses', () => {
    it('should render Running status with pulse animation', () => {
      const { container } = render(<StatusBadge status="Running" />)

      expect(screen.getByText('Running')).toBeInTheDocument()
      expect(container.querySelector('.animate-ping')).toBeInTheDocument()
      expect(container.querySelector('.text-blue-500')).toBeInTheDocument()
    })

    it('should render Completed status without pulse', () => {
      const { container } = render(<StatusBadge status="Completed" />)

      expect(screen.getByText('Completed')).toBeInTheDocument()
      expect(container.querySelector('.animate-ping')).not.toBeInTheDocument()
      expect(container.querySelector('.text-green-500')).toBeInTheDocument()
    })

    it('should render Failed status without pulse', () => {
      const { container } = render(<StatusBadge status="Failed" />)

      expect(screen.getByText('Failed')).toBeInTheDocument()
      expect(container.querySelector('.animate-ping')).not.toBeInTheDocument()
      expect(container.querySelector('.text-red-500')).toBeInTheDocument()
    })

    it('should render Terminated status without pulse', () => {
      const { container } = render(<StatusBadge status="Terminated" />)

      expect(screen.getByText('Terminated')).toBeInTheDocument()
      expect(container.querySelector('.animate-ping')).not.toBeInTheDocument()
      expect(container.querySelector('.text-gray-500')).toBeInTheDocument()
    })

    it('should render Canceled status without pulse', () => {
      const { container } = render(<StatusBadge status="Canceled" />)

      expect(screen.getByText('Canceled')).toBeInTheDocument()
      expect(container.querySelector('.animate-ping')).not.toBeInTheDocument()
      expect(container.querySelector('.text-gray-500')).toBeInTheDocument()
    })

    it('should render TimedOut status without pulse', () => {
      const { container } = render(<StatusBadge status="TimedOut" />)

      expect(screen.getByText('TimedOut')).toBeInTheDocument()
      expect(container.querySelector('.animate-ping')).not.toBeInTheDocument()
      expect(container.querySelector('.text-orange-500')).toBeInTheDocument()
    })

    it('should render unknown status with default styling', () => {
      const { container } = render(<StatusBadge status="Unknown" />)

      expect(screen.getByText('Unknown')).toBeInTheDocument()
      expect(container.querySelector('.animate-ping')).not.toBeInTheDocument()
      expect(container.querySelector('.text-gray-400')).toBeInTheDocument()
    })
  })

  describe('showPulse prop', () => {
    it('should hide pulse animation when showPulse is false', () => {
      const { container } = render(<StatusBadge status="Running" showPulse={false} />)

      expect(screen.getByText('Running')).toBeInTheDocument()
      expect(container.querySelector('.animate-ping')).not.toBeInTheDocument()
    })

    it('should show pulse animation by default for Running status', () => {
      const { container } = render(<StatusBadge status="Running" />)

      expect(container.querySelector('.animate-ping')).toBeInTheDocument()
    })
  })

  describe('className prop', () => {
    it('should apply custom className', () => {
      const { container } = render(<StatusBadge status="Running" className="custom-class" />)

      const badge = container.querySelector('.custom-class')
      expect(badge).toBeInTheDocument()
    })
  })

  describe('case insensitive status handling', () => {
    it('should handle lowercase status', () => {
      const { container } = render(<StatusBadge status="running" />)

      expect(screen.getByText('running')).toBeInTheDocument()
      expect(container.querySelector('.text-blue-500')).toBeInTheDocument()
    })

    it('should handle uppercase status', () => {
      const { container } = render(<StatusBadge status="COMPLETED" />)

      expect(screen.getByText('COMPLETED')).toBeInTheDocument()
      expect(container.querySelector('.text-green-500')).toBeInTheDocument()
    })

    it('should handle mixed case status', () => {
      const { container } = render(<StatusBadge status="FaIlEd" />)

      expect(screen.getByText('FaIlEd')).toBeInTheDocument()
      expect(container.querySelector('.text-red-500')).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('should handle empty string status', () => {
      const { container } = render(<StatusBadge status="" />)

      expect(container.querySelector('.text-gray-400')).toBeInTheDocument()
    })

    it('should handle null-like status gracefully', () => {
      // @ts-ignore - Testing runtime behavior with invalid input
      const { container } = render(<StatusBadge status={null} />)

      expect(container.querySelector('.text-gray-400')).toBeInTheDocument()
    })

    it('should handle undefined status gracefully', () => {
      // @ts-ignore - Testing runtime behavior with invalid input
      const { container } = render(<StatusBadge status={undefined} />)

      expect(container.querySelector('.text-gray-400')).toBeInTheDocument()
    })
  })
})