import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  iconColor?: string
  iconBg?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor,
  iconBg,
  trend,
  className
}: StatsCardProps) {
  return (
    <div className={cn('bg-card p-6 rounded-lg border border-border', className)}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="mt-2 flex items-baseline">
            <p className="text-3xl font-semibold">{value}</p>
            {trend && (
              <span
                className={cn(
                  'ml-2 text-sm font-medium',
                  trend.isPositive ? 'text-green-500' : 'text-red-500'
                )}
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            )}
          </div>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <div className={cn('p-3 rounded-lg', iconBg || 'bg-primary/10')}>
          <Icon className={cn('h-6 w-6', iconColor || 'text-primary')} />
        </div>
      </div>
    </div>
  )
}
