'use client'

import { useState } from 'react'
import { useRepos } from '@/hooks/useRepos'
import { useTriggerSingle, useTriggerDaily } from '@/hooks/useTrigger'
import { Play, Clock, Zap, ChevronDown } from 'lucide-react'
import { TriggerModal } from '@/components/TriggerModal'
import toast from 'react-hot-toast'

export default function TriggersPage() {
  const [selectedRepo, setSelectedRepo] = useState('')
  const [selectedRepos, setSelectedRepos] = useState<string[]>([])
  const [customChunkSize, setCustomChunkSize] = useState('10')
  const [customModel, setCustomModel] = useState('claude-3-opus-20240229')
  const [showDailyModal, setShowDailyModal] = useState(false)
  const [showCustom, setShowCustom] = useState(false)

  const { data: repos } = useRepos()
  const triggerSingle = useTriggerSingle()
  const triggerDaily = useTriggerDaily()

  const handleTriggerSingle = async () => {
    if (!selectedRepo) {
      toast.error('Please select a repository')
      return
    }

    await triggerSingle.mutateAsync({
      repoName: selectedRepo,
      model: customModel,
      chunkSize: parseInt(customChunkSize)
    })
    setSelectedRepo('')
  }

  const handleTriggerDaily = async () => {
    await triggerDaily.mutateAsync()
    setShowDailyModal(false)
  }

  const handleTriggerCustom = async () => {
    if (selectedRepos.length === 0) {
      toast.error('Please select at least one repository')
      return
    }

    await triggerDaily.mutateAsync({
      repos: selectedRepos,
      model: customModel,
      chunkSize: parseInt(customChunkSize)
    })
    setSelectedRepos([])
  }

  const toggleRepoSelection = (repoName: string) => {
    setSelectedRepos(prev =>
      prev.includes(repoName)
        ? prev.filter(r => r !== repoName)
        : [...prev, repoName]
    )
  }

  return (
    <div className="space-y-6">
      {/* Schedule Info */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Daily Schedule</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Current Schedule</p>
            <p className="font-medium">Every 6 hours</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Next Run</p>
            <p className="font-medium">
              {new Date(Date.now() + 6 * 60 * 60 * 1000).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Last Run</p>
            <p className="font-medium">2 hours ago</p>
          </div>
        </div>
      </div>

      {/* Manual Triggers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Single Repo Trigger */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <Play className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Single Repository</h2>
          </div>
          <div className="space-y-4">
            <div className="relative">
              <select
                value={selectedRepo}
                onChange={(e) => setSelectedRepo(e.target.value)}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary appearance-none pr-10"
              >
                <option value="">Select a repository...</option>
                {repos?.map(repo => (
                  <option key={repo.name} value={repo.name}>
                    {repo.name} ({repo.source})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
            <button
              onClick={handleTriggerSingle}
              disabled={!selectedRepo || triggerSingle.isPending}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {triggerSingle.isPending ? 'Triggering...' : 'Investigate Repository'}
            </button>
          </div>
        </div>

        {/* Full Daily Trigger */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Full Daily Investigation</h2>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Run investigation on all enabled repositories ({repos?.filter(r => r.enabled).length || 0} repos)
            </p>
            <button
              onClick={() => setShowDailyModal(true)}
              disabled={triggerDaily.isPending}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {triggerDaily.isPending ? 'Triggering...' : 'Run All Repositories'}
            </button>
          </div>
        </div>
      </div>

      {/* Custom Trigger */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Custom Investigation</h2>
          <button
            onClick={() => setShowCustom(!showCustom)}
            className="text-sm text-primary hover:underline"
          >
            {showCustom ? 'Hide Options' : 'Show Options'}
          </button>
        </div>

        {showCustom && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Repositories</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                {repos?.map(repo => (
                  <label
                    key={repo.name}
                    className="flex items-center gap-2 p-2 bg-background rounded border border-border hover:border-primary cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedRepos.includes(repo.name)}
                      onChange={() => toggleRepoSelection(repo.name)}
                      className="rounded border-border"
                    />
                    <span className="text-sm">{repo.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Chunk Size</label>
                <input
                  type="number"
                  value={customChunkSize}
                  onChange={(e) => setCustomChunkSize(e.target.value)}
                  min="1"
                  max="50"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Model</label>
                <select
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                  <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
                  <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleTriggerCustom}
              disabled={selectedRepos.length === 0 || triggerDaily.isPending}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {triggerDaily.isPending
                ? 'Triggering...'
                : `Investigate ${selectedRepos.length} Repository(s)`}
            </button>
          </div>
        )}
      </div>

      {/* Daily Trigger Modal */}
      <TriggerModal
        isOpen={showDailyModal}
        onClose={() => setShowDailyModal(false)}
        onConfirm={handleTriggerDaily}
        title="Run Daily Investigation"
        description={`This will trigger investigation on all ${repos?.filter(r => r.enabled).length || 0} enabled repositories. Continue?`}
        confirmText="Run Investigation"
        isLoading={triggerDaily.isPending}
      />
    </div>
  )
}