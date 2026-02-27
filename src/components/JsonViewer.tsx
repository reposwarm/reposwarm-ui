'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface JsonViewerProps {
  data: any
  className?: string
  defaultExpanded?: boolean
}

export function JsonViewer({ data, className, defaultExpanded = false }: JsonViewerProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  if (data === null || data === undefined) {
    return <span className="text-muted-foreground">null</span>
  }

  if (typeof data !== 'object') {
    return (
      <span className={cn('text-primary', className)}>
        {JSON.stringify(data)}
      </span>
    )
  }

  const isArray = Array.isArray(data)
  const entries = isArray ? data.map((v, i) => [i, v]) : Object.entries(data)

  if (entries.length === 0) {
    return <span className="text-muted-foreground">{isArray ? '[]' : '{}'}</span>
  }

  return (
    <div className={cn('font-mono text-sm', className)}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="inline-flex items-center gap-1 hover:text-primary transition-colors"
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
        <span className="text-muted-foreground">
          {isArray ? '[' : '{'}{entries.length} {isArray ? 'items' : 'keys'}{isArray ? ']' : '}'}
        </span>
      </button>
      {expanded && (
        <div className="ml-4 mt-1 space-y-1">
          {entries.map(([key, value]) => (
            <div key={key} className="flex items-start gap-2">
              <span className="text-blue-400">{key}:</span>
              <JsonViewer data={value} defaultExpanded={false} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}