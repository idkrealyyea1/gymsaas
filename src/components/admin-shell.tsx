'use client'

import * as React from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useGymTheme } from '@/components/gym-theme-provider'
import { LayoutDashboard, Building2, Dumbbell, LogOut, ChevronLeft, ChevronRight } from 'lucide-react'

const ADMIN_NAV = [
  { title: 'Overview', href: '/admin', icon: LayoutDashboard },
  { title: 'Gyms', href: '/admin/gyms', icon: Building2 },
  { title: 'Demo Gym Site', href: '/gym/iron-house-fitness', icon: Dumbbell },
]

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { theme } = useGymTheme()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen bg-background">
      <aside
        className="flex h-screen flex-col border-r transition-all duration-200"
        style={{
          backgroundColor: theme.sidebar,
          borderColor: theme.border,
          width: collapsed ? '72px' : '280px',
        }}
      >
        <div
          className="flex h-16 items-center justify-between border-b px-4"
          style={{ borderColor: theme.border }}
        >
          {!collapsed && (
            <Link href="/admin" className="flex items-center gap-2">
              <Dumbbell className="h-8 w-8" style={{ color: theme.accent }} />
              <span className="font-bold text-lg" style={{ color: theme.text }}>
                Admin
              </span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-2">
          {ADMIN_NAV.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                  collapsed && 'justify-center px-2',
                  isActive
                    ? 'bg-accent text-accent-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
                style={{
                  color: isActive ? theme.accentForeground : theme.text,
                  backgroundColor: isActive ? theme.accent : 'transparent',
                }}
              >
                <item.icon
                  className="h-5 w-5"
                  style={{ color: isActive ? theme.accentForeground : theme.textMuted }}
                />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="border-t p-4" style={{ borderColor: theme.border }}>
          <Button
            variant="ghost"
            className={cn('w-full justify-start gap-3', collapsed && 'justify-center px-2')}
            style={{ color: theme.text }}
            onClick={() => signOut({ callbackUrl: '/auth/login' })}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>Sign out</span>}
          </Button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <header
          className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b px-4"
          style={{ borderColor: theme.border, backgroundColor: theme.background }}
        >
          <h1 className="font-semibold" style={{ color: theme.text }}>
            FITCORE Admin
          </h1>
          <div className="flex-1" />
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}