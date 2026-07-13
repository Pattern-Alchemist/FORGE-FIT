'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Users,
  ChevronRight,
  MessageSquare,
  ClipboardCheck,
  Dumbbell,
  CalendarClock,
  Plus,
  ArrowUpDown,
} from 'lucide-react'
import { useUIStore } from '@/lib/store'
import { useClients } from '@/lib/hooks'
import { StatusTag, GoalTag, PhaseTag, AdherenceRing, EmptyState } from '@/components/shared'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { Client, ClientStatus, Goal } from '@/lib/types'

type StatusFilter = ClientStatus | 'all'

const GOALS: Goal[] = [
  'Hypertrophy',
  'Fat Loss',
  'Strength',
  'General Fitness',
  'Athletic Performance',
  'Recomposition',
]

export function Clients() {
  const clientsQuery = useClients()
  const clients = clientsQuery.data ?? []
  const openClient = useUIStore((s) => s.openClient)
  const openConversation = useUIStore((s) => s.openConversation)
  const setScreen = useUIStore((s) => s.setScreen)

  // UI-only filter state lives in the store so it survives navigation
  const search = useUIStore((s) => s.clientsSearch)
  const statusFilter = useUIStore((s) => s.clientsStatusFilter)
  const goalFilter = useUIStore((s) => s.clientsGoalFilter)
  const sortBy = useUIStore((s) => s.clientsSortBy)
  const setSearch = useUIStore((s) => s.setClientsSearch)
  const setStatusFilter = useUIStore((s) => s.setClientsStatusFilter)
  const setGoalFilter = useUIStore((s) => s.setClientsGoalFilter)
  const setSortBy = useUIStore((s) => s.setClientsSortBy)

  const filtered = React.useMemo(() => {
    let list = clients.filter((c) => {
      if (search && !c.full_name.toLowerCase().includes(search.toLowerCase())) return false
      if (statusFilter !== 'all' && c.status !== statusFilter) return false
      if (goalFilter !== 'all' && c.goal !== goalFilter) return false
      return true
    })
    list = list.sort((a, b) => {
      if (sortBy === 'name') return a.full_name.localeCompare(b.full_name)
      if (sortBy === 'adherence') return b.adherence_score - a.adherence_score
      return new Date(b.last_activity || 0).getTime() - new Date(a.last_activity || 0).getTime()
    })
    return list
  }, [clients, search, statusFilter, goalFilter, sortBy])

  const counts = {
    all: clients.length,
    active: clients.filter((c) => c.status === 'active').length,
    paused: clients.filter((c) => c.status === 'paused').length,
    completed: clients.filter((c) => c.status === 'completed').length,
  }

  return (
    <div className="px-4 lg:px-8 py-6 lg:py-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-display text-2xl lg:text-[28px] text-foreground">Clients</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {clients.length} total · {counts.active} active · {counts.paused} paused
          </p>
        </div>
        <Button className="gap-2 shadow-sm">
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          <span className="hidden sm:inline">Add Client</span>
        </Button>
      </div>

      {/* Search + Filters */}
      <div className="card-premium rounded-xl p-3 lg:p-4 mb-4 lg:mb-6">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name…"
              className="pl-9 h-10 bg-muted/50 border-transparent focus:border-border focus:bg-card"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/60">
              {(['all', 'active', 'paused', 'completed'] as StatusFilter[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all tap-smooth',
                    statusFilter === s
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {s}
                  <span className={cn('ml-1.5 text-[10px]', statusFilter === s ? 'text-muted-foreground' : 'text-muted-foreground/70')}>
                    {counts[s as keyof typeof counts]}
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                const order: ('recent' | 'name' | 'adherence')[] = ['recent', 'name', 'adherence']
                const next = order[(order.indexOf(sortBy) + 1) % order.length]
                setSortBy(next)
              }}
              className="inline-flex items-center gap-1.5 px-3 h-10 rounded-lg bg-muted/60 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span className="capitalize">{sortBy === 'recent' ? 'Recent' : sortBy}</span>
            </button>
          </div>
        </div>

        <div className="flex gap-1.5 mt-3 overflow-x-auto scrollbar-none pb-1">
          <FilterChip active={goalFilter === 'all'} onClick={() => setGoalFilter('all')}>All Goals</FilterChip>
          {GOALS.map((g) => (
            <FilterChip key={g} active={goalFilter === g} onClick={() => setGoalFilter(g)}>{g}</FilterChip>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {clientsQuery.isLoading ? (
        <div className="card-premium rounded-xl overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-3.5 border-b border-border/60">
              <Skeleton className="w-9 h-9 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-2 w-48" />
              </div>
              <Skeleton className="w-9 h-9 rounded-full" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-premium rounded-xl">
          <EmptyState
            icon={Users}
            title="No clients match your filters"
            description="Try clearing the search or changing the status filter."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch('')
                  setStatusFilter('all')
                  setGoalFilter('all')
                }}
              >
                Clear filters
              </Button>
            }
          />
        </div>
      ) : (
        <>
          {/* Desktop table-style list */}
          <div className="hidden lg:block card-premium rounded-xl overflow-hidden">
            <div className="grid grid-cols-[1.5fr_1fr_1fr_120px_140px_60px] gap-4 px-6 py-3 border-b border-border/60 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
              <div>Client</div>
              <div>Goal</div>
              <div>Phase</div>
              <div>Adherence</div>
              <div>Next Action</div>
              <div></div>
            </div>
            <div className="divide-y divide-border/60">
              {filtered.map((c, i) => (
                <ClientRow key={c.id} client={c} index={i} onOpen={() => openClient(c.id)} onMessage={() => openConversation(c.id)} />
              ))}
            </div>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden space-y-3">
            {filtered.map((c, i) => (
              <ClientCardMobile key={c.id} client={c} index={i} onOpen={() => openClient(c.id)} onMessage={() => openConversation(c.id)} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function FilterChip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'shrink-0 px-2.5 py-1 rounded-md text-xs font-medium transition-colors tap-smooth',
        active ? 'bg-primary text-primary-foreground' : 'bg-muted/60 text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}

function ClientRow({
  client: c,
  index,
  onOpen,
  onMessage,
}: {
  client: Client
  index: number
  onOpen: () => void
  onMessage: () => void
}) {
  const actionIcon = c.next_action
    ? c.next_action.type === 'review_check_in'
      ? ClipboardCheck
      : c.next_action.type === 'reply_message'
        ? MessageSquare
        : c.next_action.type === 'update_workout'
          ? Dumbbell
          : CalendarClock
    : null
  const ActionIcon = actionIcon

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
      onClick={onOpen}
      className="grid grid-cols-[1.5fr_1fr_1fr_120px_140px_60px] gap-4 px-6 py-3.5 hover:bg-muted/40 transition-colors cursor-pointer group items-center"
    >
      <div className="flex items-center gap-3 min-w-0">
        <Avatar className="w-9 h-9 rounded-lg shrink-0">
          <AvatarFallback className="bg-muted text-foreground text-xs font-semibold rounded-lg">
            {c.avatar}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground truncate">{c.full_name}</span>
            {c.unread_count ? <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" /> : null}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[11px] text-muted-foreground">{c.age}y · {c.gender}</span>
            <StatusTag status={c.status} />
          </div>
        </div>
      </div>
      <div><GoalTag goal={c.goal} /></div>
      <div><PhaseTag phase={c.training_phase} /></div>
      <div className="flex items-center gap-2">
        <AdherenceRing score={c.adherence_score} size={36} stroke={3.5} />
        <span className="text-xs text-muted-foreground">{c.weekly_streak}w streak</span>
      </div>
      <div>
        {c.next_action && ActionIcon ? (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
              <ActionIcon className="w-3 h-3 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-foreground truncate">{c.next_action.label}</div>
              <div className="text-[10px] text-muted-foreground">{c.next_action.due}</div>
            </div>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground/60">—</span>
        )}
      </div>
      <div className="flex items-center justify-end">
        <ChevronRight className="w-4 h-4 text-muted-foreground/60 group-hover:text-foreground transition-colors" />
      </div>
    </motion.div>
  )
}

function ClientCardMobile({
  client: c,
  index,
  onOpen,
  onMessage,
}: {
  client: Client
  index: number
  onOpen: () => void
  onMessage: () => void
}) {
  const actionIcon = c.next_action
    ? c.next_action.type === 'review_check_in'
      ? ClipboardCheck
      : c.next_action.type === 'reply_message'
        ? MessageSquare
        : c.next_action.type === 'update_workout'
          ? Dumbbell
          : CalendarClock
    : null
  const ActionIcon = actionIcon

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
      className="card-premium rounded-xl p-4"
    >
      <button onClick={onOpen} className="w-full text-left tap-smooth">
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="w-11 h-11 rounded-xl shrink-0">
            <AvatarFallback className="bg-muted text-foreground text-sm font-semibold rounded-xl">
              {c.avatar}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-sm font-semibold text-foreground truncate">{c.full_name}</span>
              {c.unread_count ? (
                <span className="ml-auto text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                  {c.unread_count} new
                </span>
              ) : null}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-muted-foreground">{c.age}y · {c.gender}</span>
              <StatusTag status={c.status} />
              <GoalTag goal={c.goal} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-3 p-2.5 rounded-lg bg-muted/40">
          <AdherenceRing score={c.adherence_score} size={40} stroke={3.5} />
          <div className="flex-1 grid grid-cols-2 gap-2">
            <div>
              <div className="text-[10px] text-muted-foreground">Phase</div>
              <div className="text-xs font-medium text-foreground truncate">{c.training_phase}</div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground">Streak</div>
              <div className="text-xs font-medium text-foreground">{c.weekly_streak} weeks</div>
            </div>
          </div>
        </div>
      </button>

      {c.next_action && ActionIcon && (
        <div className="flex items-center gap-2 pt-3 border-t border-border/60">
          <button onClick={onOpen} className="flex-1 flex items-center gap-2 min-w-0 tap-smooth">
            <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
              <ActionIcon className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <div className="text-xs font-medium text-foreground truncate">{c.next_action.label}</div>
              <div className="text-[10px] text-muted-foreground">Due {c.next_action.due}</div>
            </div>
          </button>
          <button
            onClick={onMessage}
            className="w-9 h-9 rounded-md bg-muted flex items-center justify-center tap-smooth shrink-0"
            aria-label="Message"
          >
            <MessageSquare className="w-4 h-4 text-foreground" />
          </button>
        </div>
      )}
    </motion.div>
  )
}
