'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  ClipboardCheck,
  Search,
  ChevronRight,
  Clock,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Send,
  Camera,
} from 'lucide-react'
import { useUIStore } from '@/lib/store'
import { useClients, useCheckIns, useReviewCheckIn } from '@/lib/hooks'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusTag, GoalTag, EmptyState } from '@/components/shared'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { format, formatDistanceToNow } from 'date-fns'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { Client, CheckIn } from '@/lib/types'

export function CheckIns() {
  const { data: clients = [], isLoading: clientsLoading } = useClients()
  const openClient = useUIStore((s) => s.openClient)
  const [search, setSearch] = React.useState('')
  const [filter, setFilter] = React.useState<'all' | 'pending' | 'reviewed'>('all')
  const [selectedClientId, setSelectedClientId] = React.useState<string | null>(null)

  // Load check-ins for the selected client
  const { data: selectedCheckIns = [] } = useCheckIns(selectedClientId)

  const selectedClient = clients.find((c) => c.id === selectedClientId)

  // Build the client list with pending counts
  const pendingList = clients
    .filter((c) => c.status !== 'completed')
    .map((c) => ({
      client: c,
      // We only know pending counts per-client by fetching; for the list view we
      // approximate using the client's pending_check_in flag. In production this
      // would be a single aggregate query.
      pendingCount: c.pending_check_in ? 1 : 0,
    }))
    .filter((entry) => {
      if (search && !entry.client.full_name.toLowerCase().includes(search.toLowerCase())) return false
      if (filter === 'pending' && entry.pendingCount === 0) return false
      return true
    })

  // Auto-select first client with a pending check-in on first load
  React.useEffect(() => {
    if (!selectedClientId && clients.length > 0) {
      const firstPending = clients.find((c) => c.pending_check_in)
      setSelectedClientId(firstPending?.id ?? clients[0].id)
    }
  }, [clients, selectedClientId])

  return (
    <div className="px-4 lg:px-8 py-6 lg:py-8 max-w-[1400px] mx-auto">
      <div className="mb-6">
        <h1 className="text-display text-2xl lg:text-[28px] text-foreground">Check-ins</h1>
        <p className="text-sm text-muted-foreground mt-1">Review weekly client check-ins</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4 lg:gap-6">
        {/* Left: Client list */}
        <div className="card-premium rounded-xl p-4 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:flex lg:flex-col">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients…"
              className="pl-9 h-9 text-xs bg-muted/50 border-transparent focus:border-border"
            />
          </div>
          <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/60 mb-3">
            {(['all', 'pending', 'reviewed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'flex-1 py-1.5 rounded-md text-[11px] font-medium capitalize transition-all',
                  filter === f ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground',
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto -mr-2 pr-2 space-y-1 min-h-[300px] lg:min-h-0">
            {clientsLoading ? (
              Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)
            ) : pendingList.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">No clients match.</p>
            ) : (
              pendingList.map(({ client, pendingCount }) => (
                <button
                  key={client.id}
                  onClick={() => setSelectedClientId(client.id)}
                  className={cn(
                    'w-full flex items-center gap-2.5 p-2.5 rounded-lg text-left transition-all tap-smooth',
                    selectedClientId === client.id ? 'bg-primary/10' : 'hover:bg-muted/40',
                  )}
                >
                  <Avatar className="w-9 h-9 rounded-lg shrink-0">
                    <AvatarFallback className="bg-muted text-foreground text-[11px] font-semibold rounded-lg">
                      {client.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-foreground truncate">{client.full_name}</span>
                      {pendingCount > 0 && (
                        <span className="text-[9px] bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 font-bold shrink-0">
                          {pendingCount}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate">{client.goal}</div>
                  </div>
                  {pendingCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 pulse-soft" />}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right: Selected client check-in timeline */}
        <div>
          {!selectedClient ? (
            <div className="card-premium rounded-xl">
              <EmptyState icon={ClipboardCheck} title="Select a client" description="Pick a client on the left to review their check-in history." />
            </div>
          ) : (
            <CheckInTimeline client={selectedClient} checkIns={selectedCheckIns} onOpenClient={() => openClient(selectedClient.id)} />
          )}
        </div>
      </div>
    </div>
  )
}

function CheckInTimeline({
  client,
  checkIns,
  onOpenClient,
}: {
  client: Client
  checkIns: CheckIn[]
  onOpenClient: () => void
}) {
  const reviewCheckIn = useReviewCheckIn()
  const sorted = [...checkIns].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4">
        <button onClick={onOpenClient} className="flex items-center gap-3 text-left tap-smooth">
          <Avatar className="w-10 h-10 rounded-lg">
            <AvatarFallback className="bg-muted text-foreground text-xs font-semibold rounded-lg">
              {client.avatar}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-sm font-semibold text-foreground">{client.full_name}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <GoalTag goal={client.goal} />
              <StatusTag status={client.status} />
            </div>
          </div>
        </button>
        <Button variant="ghost" size="sm" onClick={onOpenClient} className="text-xs">
          Open profile
          <ChevronRight className="w-3 h-3 ml-1" />
        </Button>
      </div>

      {sorted.length === 0 ? (
        <div className="card-premium rounded-xl">
          <EmptyState icon={ClipboardCheck} title="No check-ins yet" description="This client hasn't submitted a weekly check-in." />
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((ci, i) => (
            <motion.div
              key={ci.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
              className="card-premium rounded-xl p-5"
            >
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', ci.status === 'pending' ? 'bg-warning/15' : 'bg-success/10')}>
                    {ci.status === 'pending' ? <Clock className="w-4 h-4 text-warning-foreground" /> : <CheckCircle2 className="w-4 h-4 text-success" />}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{format(new Date(ci.date), 'EEEE, MMM d')}</div>
                    <div className="text-[11px] text-muted-foreground">{formatDistanceToNow(new Date(ci.date), { addSuffix: true })}</div>
                  </div>
                </div>
                {ci.status === 'pending' ? (
                  <Badge variant="outline" className="text-warning-foreground border-warning/30 bg-warning/10 text-[10px] font-medium">Pending</Badge>
                ) : (
                  <Badge variant="outline" className="text-success border-success/20 bg-success/10 text-[10px] font-medium">Reviewed</Badge>
                )}
              </div>

              <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
                <VitalTile label="Weight" value={`${ci.body_weight}kg`} />
                <VitalTile label="Waist" value={ci.waist ? `${ci.waist}cm` : '—'} />
                <VitalTile label="Chest" value={ci.chest ? `${ci.chest}cm` : '—'} />
                <VitalTile label="Arms" value={ci.arms ? `${ci.arms}cm` : '—'} />
                <VitalTile label="Thighs" value={ci.thighs ? `${ci.thighs}cm` : '—'} />
                <VitalTile label="Adherence" value={`${ci.adherence_percent}%`} />
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <SubjectiveBar label="Energy" value={ci.energy_score} max={10} color="var(--chart-2)" />
                <SubjectiveBar label="Sleep" value={ci.sleep_score} max={10} color="var(--chart-4)" />
                <SubjectiveBar label="Mood" value={ci.mood_score} max={10} color="var(--chart-5)" />
              </div>

              {ci.progress_photo_placeholder && (
                <div className="flex items-center gap-2 mb-4 p-2 rounded-lg bg-muted/30">
                  <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center">
                    <Camera className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <span className="text-[11px] text-muted-foreground">3 progress photos attached</span>
                </div>
              )}

              <div className="bg-muted/30 rounded-lg p-3 mb-3">
                <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">Client Notes</div>
                <p className="text-sm text-foreground leading-relaxed">&ldquo;{ci.client_notes}&rdquo;</p>
              </div>

              {ci.coach_response && (
                <div className="bg-primary/5 border border-primary/15 rounded-lg p-3 mb-3">
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-primary mb-1">Your Response</div>
                  <p className="text-sm text-foreground leading-relaxed">{ci.coach_response}</p>
                </div>
              )}

              {ci.status === 'pending' && (
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    size="sm"
                    className="gap-1.5 flex-1"
                    disabled={reviewCheckIn.isPending}
                    onClick={() =>
                      reviewCheckIn.mutate({
                        checkInId: ci.id,
                        coachResponse: 'Great work this week. Keep the protein up and prioritize sleep — even 30 min earlier helps.',
                        status: 'reviewed',
                      })
                    }
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send Response
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">Mark Reviewed</Button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

function VitalTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center p-2 rounded-lg bg-muted/30">
      <div className="text-[10px] text-muted-foreground font-medium mb-0.5">{label}</div>
      <div className="text-sm font-semibold tabular-nums text-foreground">{value}</div>
    </div>
  )
}

function SubjectiveBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = (value / max) * 100
  return (
    <div className="p-2 rounded-lg bg-muted/30">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
        <span className="text-[11px] font-semibold tabular-nums" style={{ color }}>{value}/{max}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}
