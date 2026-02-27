'use client'

import { useState } from 'react'
import { useRepos, useAddRepo, useUpdateRepo, useDeleteRepo } from '@/hooks/useRepos'
import { RepoCard } from '@/components/RepoCard'
import { Plus, Search } from 'lucide-react'
import { Repository } from '@/lib/types'
import toast from 'react-hot-toast'

export default function RepositoriesPage() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [newRepo, setNewRepo] = useState({
    name: '',
    url: '',
    source: 'GitHub' as 'GitHub' | 'CodeCommit'
  })

  const { data: repos, isLoading } = useRepos()
  const addRepo = useAddRepo()
  const updateRepo = useUpdateRepo()
  const deleteRepo = useDeleteRepo()

  const filteredRepos = (repos || []).filter(repo =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.url.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddRepo = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await addRepo.mutateAsync({
        ...newRepo,
        enabled: true
      })
      toast.success(`Repository ${newRepo.name} added successfully`)
      setNewRepo({ name: '', url: '', source: 'GitHub' })
      setShowAddForm(false)
    } catch (error) {
      toast.error('Failed to add repository')
    }
  }

  const handleToggleRepo = async (repo: Repository) => {
    try {
      await updateRepo.mutateAsync({
        name: repo.name,
        updates: { enabled: !repo.enabled }
      })
      toast.success(`Repository ${repo.name} ${!repo.enabled ? 'enabled' : 'disabled'}`)
    } catch (error) {
      toast.error('Failed to update repository')
    }
  }

  const handleDeleteRepo = async (repo: Repository) => {
    if (!confirm(`Are you sure you want to delete ${repo.name}?`)) return

    try {
      await deleteRepo.mutateAsync(repo.name)
      toast.success(`Repository ${repo.name} deleted successfully`)
    } catch (error) {
      toast.error('Failed to delete repository')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Add */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Repositories</h2>
          <div className="flex gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search repositories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-64"
              />
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Repo
            </button>
          </div>
        </div>

        {/* Add Repository Form */}
        {showAddForm && (
          <form onSubmit={handleAddRepo} className="bg-background p-4 rounded-lg border border-border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Repository Name"
                value={newRepo.name}
                onChange={(e) => setNewRepo({ ...newRepo, name: e.target.value })}
                className="px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <input
                type="url"
                placeholder="Repository URL"
                value={newRepo.url}
                onChange={(e) => setNewRepo({ ...newRepo, url: e.target.value })}
                className="px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <div className="flex gap-2">
                <select
                  value={newRepo.source}
                  onChange={(e) => setNewRepo({ ...newRepo, source: e.target.value as 'GitHub' | 'CodeCommit' })}
                  className="px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="GitHub">GitHub</option>
                  <option value="CodeCommit">CodeCommit</option>
                </select>
                <button
                  type="submit"
                  disabled={addRepo.isPending}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  {addRepo.isPending ? 'Adding...' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Repository Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            Loading repositories...
          </div>
        ) : filteredRepos.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            {searchQuery ? 'No repositories match your search' : 'No repositories configured'}
          </div>
        ) : (
          filteredRepos.map(repo => (
            <RepoCard
              key={repo.name}
              repo={repo}
              onToggle={handleToggleRepo}
              onDelete={handleDeleteRepo}
            />
          ))
        )}
      </div>
    </div>
  )
}