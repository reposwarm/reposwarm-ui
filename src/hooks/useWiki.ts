import { useQuery } from '@tanstack/react-query'

export interface WikiSection {
  id: string
  label: string
  timestamp: number
  createdAt: string
}

export interface WikiIndex {
  repo: string
  sections: WikiSection[]
  hasDocs: boolean
}

export interface WikiContent {
  repo: string
  section: string
  content: string
  createdAt: string
  timestamp: number
  referenceKey: string
}

export function useWikiIndex(repo: string) {
  return useQuery({
    queryKey: ['wiki', repo],
    queryFn: async () => {
      const response = await fetch(`/api/wiki/${encodeURIComponent(repo)}`)
      if (!response.ok) throw new Error('Failed to fetch wiki index')
      return response.json() as Promise<WikiIndex>
    },
    enabled: !!repo
  })
}

export function useWikiSection(repo: string, section: string) {
  return useQuery({
    queryKey: ['wiki', repo, section],
    queryFn: async () => {
      const response = await fetch(`/api/wiki/${encodeURIComponent(repo)}/${encodeURIComponent(section)}`)
      if (!response.ok) throw new Error('Failed to fetch wiki section')
      return response.json() as Promise<WikiContent>
    },
    enabled: !!repo && !!section
  })
}
