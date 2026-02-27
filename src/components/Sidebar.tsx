'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Activity,
  GitBranch,
  Zap,
  Settings,
  Layers
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Workflows', href: '/workflows', icon: Activity },
  { name: 'Repositories', href: '/repos', icon: GitBranch },
  { name: 'Triggers', href: '/triggers', icon: Zap },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-card border-r border-border">
      <div className="flex h-16 items-center px-6 border-b border-border">
        <Layers className="h-8 w-8 text-primary" />
        <span className="ml-3 text-xl font-semibold">RepoSwarm</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-border p-4">
        <div className="text-xs text-muted-foreground">
          <div>v1.0.0</div>
          <div className="mt-1">© 2024 RepoSwarm</div>
        </div>
      </div>
    </div>
  )
}