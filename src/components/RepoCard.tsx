import { GitBranch, Clock, Check, X } from 'lucide-react'
import { Repository } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface RepoCardProps {
  repo: Repository
  onToggle?: (repo: Repository) => void
  onDelete?: (repo: Repository) => void
}

export function RepoCard({ repo, onToggle, onDelete }: RepoCardProps) {
  return (
    <div className="bg-card p-6 rounded-lg border border-border hover:border-primary/50 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <GitBranch className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">{repo.name}</h3>
            <p className="text-sm text-muted-foreground">{repo.source}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onToggle && (
            <button
              onClick={() => onToggle(repo)}
              className={cn(
                'p-2 rounded-lg transition-colors',
                repo.enabled
                  ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                  : 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20'
              )}
              title={repo.enabled ? 'Disable' : 'Enable'}
            >
              {repo.enabled ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(repo)}
              className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
              title="Delete"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Last analyzed: {repo.lastAnalyzed ? formatDate(repo.lastAnalyzed) : 'Never'}</span>
        </div>
        {repo.lastCommit && (
          <div className="text-xs text-muted-foreground">
            Last commit: {repo.lastCommit.substring(0, 8)}
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <span
            className={cn(
              'text-xs font-medium px-2 py-1 rounded-full',
              repo.status === 'active'
                ? 'bg-green-500/10 text-green-500'
                : repo.status === 'error'
                ? 'bg-red-500/10 text-red-500'
                : 'bg-gray-500/10 text-gray-500'
            )}
          >
            {repo.status || 'inactive'}
          </span>
          <a
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline"
          >
            View Repository →
          </a>
        </div>
      </div>
    </div>
  )
}