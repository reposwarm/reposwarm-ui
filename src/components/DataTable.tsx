'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Column<T> {
  key: keyof T | string
  header: string
  accessor?: (row: T) => any
  sortable?: boolean
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (row: T) => void
  className?: string
  emptyMessage?: string
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  onRowClick,
  className,
  emptyMessage = 'No data available'
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const handleSort = (column: Column<T>) => {
    if (!column.sortable) return

    const key = column.key as string
    if (sortColumn === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(key)
      setSortDirection('asc')
    }
  }

  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn) return 0

    const column = columns.find(c => c.key === sortColumn)
    if (!column) return 0

    const aValue = column.accessor ? column.accessor(a) : a[sortColumn]
    const bValue = column.accessor ? column.accessor(b) : b[sortColumn]

    if (aValue === bValue) return 0

    const comparison = aValue < bValue ? -1 : 1
    return sortDirection === 'asc' ? comparison : -comparison
  })

  return (
    <div className={cn('overflow-hidden rounded-lg border border-border', className)}>
      <table className="w-full">
        <thead className="bg-card">
          <tr className="border-b border-border">
            {columns.map(column => (
              <th
                key={column.key as string}
                className={cn(
                  'px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider',
                  column.sortable && 'cursor-pointer select-none hover:text-foreground',
                  column.className
                )}
                onClick={() => handleSort(column)}
              >
                <div className="flex items-center gap-2">
                  {column.header}
                  {column.sortable && sortColumn === column.key && (
                    <span className="text-primary">
                      {sortDirection === 'asc' ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-background divide-y divide-border">
          {sortedData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-12 text-center text-muted-foreground"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((row, index) => (
              <tr
                key={index}
                className={cn(
                  'hover:bg-card/50 transition-colors',
                  onRowClick && 'cursor-pointer'
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map(column => (
                  <td
                    key={column.key as string}
                    className={cn('px-6 py-4 text-sm', column.className)}
                  >
                    {column.accessor ? column.accessor(row) : row[column.key as keyof T]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}