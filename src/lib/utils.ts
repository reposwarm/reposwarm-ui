import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`
  return `${Math.floor(ms / 3600000)}h ${Math.floor((ms % 3600000) / 60000)}m`
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

export function getStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case 'running':
      return 'text-blue-500 bg-blue-500/10 border-blue-500/20'
    case 'completed':
      return 'text-green-500 bg-green-500/10 border-green-500/20'
    case 'failed':
      return 'text-red-500 bg-red-500/10 border-red-500/20'
    case 'terminated':
    case 'canceled':
      return 'text-gray-500 bg-gray-500/10 border-gray-500/20'
    case 'timedout':
      return 'text-orange-500 bg-orange-500/10 border-orange-500/20'
    default:
      return 'text-gray-400 bg-gray-400/10 border-gray-400/20'
  }
}