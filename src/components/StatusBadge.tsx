import { cn } from '@/lib/utils'
import { WorkflowStatus } from '@/lib/types'

interface StatusBadgeProps {
  status: WorkflowStatus | string
  className?: string
  showPulse?: boolean
}

export function StatusBadge({ status, className, showPulse = true }: StatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status?.toLowerCase()) {
      case 'running':
        return {
          bg: 'bg-yellow-500/10',
          text: 'text-yellow-500',
          border: 'border-yellow-500/20',
          pulse: showPulse
        }
      case 'completed':
        return {
          bg: 'bg-green-500/10',
          text: 'text-green-500',
          border: 'border-green-500/20',
          pulse: false
        }
      case 'failed':
        return {
          bg: 'bg-red-500/10',
          text: 'text-red-500',
          border: 'border-red-500/20',
          pulse: false
        }
      case 'terminated':
      case 'canceled':
        return {
          bg: 'bg-purple-500/10',
          text: 'text-purple-500',
          border: 'border-purple-500/20',
          pulse: false
        }
      case 'timedout':
        return {
          bg: 'bg-orange-500/10',
          text: 'text-orange-500',
          border: 'border-orange-500/20',
          pulse: false
        }
      default:
        return {
          bg: 'bg-gray-400/10',
          text: 'text-gray-400',
          border: 'border-gray-400/20',
          pulse: false
        }
    }
  }

  const styles = getStatusStyles()

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        styles.bg,
        styles.text,
        styles.border,
        className
      )}
    >
      {styles.pulse && (
        <span className="relative flex h-2 w-2 mr-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
        </span>
      )}
      {status}
    </span>
  )
}
