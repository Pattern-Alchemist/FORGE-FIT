'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  ClipboardCheck,
  MessageSquare,
  Settings,
  Sun,
  Moon,
  Flame,
  Search,
  Bell,
  Plus,
} from 'lucide-react'
import { useUIStore } from '@/lib/store'
import { useUrlStateSync } from '@/lib/url-state'
import { useCoach, useTasks, useMessages } from '@/lib/hooks'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

type ScreenId = 'dashboard' | 'clients' | 'client-detail' | 'workout-builder' | 'check-ins' | 'messages' | 'settings'

interface NavItem {
  id: ScreenId
  label: string
  icon: React.ElementType
  badge?: number
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  // Sync URL <-> store
  useUrlStateSync()

  // Read UI state from store (UI-only)
  const screen = useUIStore((s) => s.screen)
  const setScreen = useUIStore((s) => s.setScreen)
  const setBuilder = useUIStore((s) => s.setBuilder)

  // Read server data via React Query
  const { data: coach } = useCoach()
  const { data: tasks = [] } = useTasks()
  const { data: messages = [] } = useMessages(null) // we use a separate query per-conversation, so this is unused; kept for global counts via stats

  // For nav badges, use derived counts (pending tasks counts as quick proxy)
  // Note: dashboard stats already fetch precise counts — keep nav lightweight.
  const pendingTaskCount = tasks.filter((t) => !t.completed).length

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'workout-builder', label: 'Builder', icon: Dumbbell },
    { id: 'check-ins', label: 'Check-ins', icon: ClipboardCheck },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  const mobileNav: NavItem[] = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'workout-builder', label: 'Build', icon: Dumbbell },
    { id: 'check-ins', label: 'Check-ins', icon: ClipboardCheck, badge: pendingTaskCount },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
  ]

  const handleNav = (id: ScreenId) => {
    if (id === 'workout-builder') setBuilder(null)
    setScreen(id)
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[260px] shrink-0 flex-col border-r border-border/60 bg-sidebar">
        {/* Brand */}
        <div className="px-6 pt-6 pb-5">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                <Flame className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <div className="absolute -inset-1 rounded-xl bg-primary/20 blur-md -z-10" />
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-semibold tracking-tight text-foreground">Forge</span>
              <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-medium">Coaching OS</span>
            </div>
          </div>
        </div>

        {/* New Workout CTA */}
        <div className="px-4 pb-4">
          <Button
            onClick={() => handleNav('workout-builder')}
            className="w-full justify-start gap-2 h-10 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm font-medium"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            New Workout
          </Button>
        </div>

        {/* Nav */}
        <nav className="px-3 flex-1 flex flex-col gap-0.5">
          <div className="px-3 pb-2 pt-1">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/80">Workspace</span>
          </div>
          {navItems.map((item) => {
            const Icon = item.icon
            const active = screen === item.id || (item.id === 'clients' && screen === 'client-detail')
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={cn(
                  'group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all tap-smooth',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon className={cn('w-[18px] h-[18px] transition-colors', active && 'text-primary')} strokeWidth={2.2} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge ? (
                  <span
                    className={cn(
                      'min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-semibold flex items-center justify-center',
                      active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </button>
            )
          })}
        </nav>

        {/* Coach card at bottom */}
        <div className="p-3 mt-auto">
          <button
            onClick={() => handleNav('settings')}
            className={cn(
              'w-full flex items-center gap-3 p-2.5 rounded-lg transition-all tap-smooth hover:bg-muted',
              screen === 'settings' && 'bg-muted',
            )}
          >
            <Avatar className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary/70">
              <AvatarFallback className="bg-transparent text-primary-foreground text-xs font-semibold rounded-lg">
                {coach?.avatar ?? 'MV'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left min-w-0">
              <div className="text-sm font-medium text-foreground truncate">{coach?.name ?? 'Coach'}</div>
              <div className="text-xs text-muted-foreground truncate">{coach?.business_name ?? ''}</div>
            </div>
            <Settings className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 border-b border-border/60 bg-background/80 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Flame className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="text-[15px] font-semibold tracking-tight">Forge</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted tap-smooth"
              aria-label="Toggle theme"
            >
              {mounted && theme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
            </button>
            <button className="relative w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted tap-smooth">
              <Bell className="w-[18px] h-[18px]" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary" />
            </button>
          </div>
        </header>

        {/* Desktop top bar */}
        <header className="hidden lg:flex sticky top-0 z-30 items-center justify-between px-8 h-16 border-b border-border/60 bg-background/80 backdrop-blur-xl">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search clients, workouts, exercises…"
                className="w-full h-9 pl-9 pr-16 text-sm rounded-lg bg-muted/70 border border-transparent focus:border-border focus:bg-card focus:outline-none transition-colors placeholder:text-muted-foreground/70"
              />
              <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-medium text-muted-foreground bg-card border border-border rounded px-1.5 py-0.5">⌘K</kbd>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {mounted && theme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
            </button>
            <button className="relative w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Bell className="w-[18px] h-[18px]" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-primary pulse-soft" />
            </button>
            <div className="w-px h-6 bg-border mx-1" />
            <Badge variant="outline" className="rounded-md bg-muted/50 font-medium uppercase tracking-wide text-[10px]">
              {coach?.subscription_plan ?? 'Performance'}
            </Badge>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 min-w-0 pb-24 lg:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-xl border-t border-border/60" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="grid grid-cols-5 h-16">
          {mobileNav.map((item) => {
            const Icon = item.icon
            const active = screen === item.id || (item.id === 'clients' && screen === 'client-detail') || (item.id === 'workout-builder' && screen === 'workout-builder')
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={cn(
                  'relative flex flex-col items-center justify-center gap-0.5 tap-smooth',
                  active ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                <div className="relative">
                  <Icon className="w-[22px] h-[22px]" strokeWidth={active ? 2.5 : 2} />
                  {item.badge ? (
                    <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                      {item.badge}
                    </span>
                  ) : null}
                </div>
                <span className="text-[10px] font-medium tracking-tight">{item.label}</span>
                {active && (
                  <span className="absolute top-0 w-8 h-0.5 rounded-full bg-primary" />
                )}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
