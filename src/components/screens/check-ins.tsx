'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  ClipboardCheck,
  Search,
  Filter,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Send,
  Camera,
} from 'lucide-react'
import { useStore } from '@/lib/store'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusTag, GoalTag, EmptyState } from '@/components/shared'
import { cn } from '@/lib/utils'
import { format, formatDistanceToNow } from 'date-fns'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export function CheckIns() {
  const clients = useStore((s) => s.clients)
  const checkIns = useStore((s) => s.checkIns)
  const openClient = useStore((s) => s.openClient)
  const [search, setSearch] = React.useState('')
  const [filter, setFilter] = React.useState<'all' | 'pending' | 'reviewed'>('all')
  const [selectedClientId, setSelectedClientId] = React.useState<string | null>(
    clients.find((c) => c.pending_check_in)?.id ?? null,
  )

  const selectedClient = clients.find((c) => c.id === selectedClientId)
  const selectedCheckIns = selectedClientId
    ? checkIns
        .filter((ci) => ci.client_id === selectedClientId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : []

  const pendingList = clients
    .filter((c) => {
      if (search && !c.full_name.toLowerCase().includes(search.toLowerCase())) return false
      const hasPending = checkIns.some((ci) => ci.client_id === c.id && ci.status === 'pending')
      const hasReviewed = checkIns.some((ci) => ci.client_id === c.id && ci.status === 'reviewed')
      if (filter === 'pending' && !hasPending) return false
      if (filter === 'reviewed' && !hasReviewed) return false
      return c.status !== 'completed'
    })
    .map((c) => ({
      client: c,
      pendingCount: checkIns.filter((ci) => ci.client_id === c.id && ci.status === 'pending').length,
      latest: checkIns
        .filter((ci) => ci.client_id === c.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0],
    }))

  return (
    <div className="px-4 lg:px-8 py-6 lg:py-8 max-w-[1400px] mx-auto">
      <div className="mb-6">
        <h1 className="text-display text-2xl lg:text-[28px] text-foreground">Check-ins</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {checkIns.filter((ci) => ci.status === 'pending').length} pending review · {checkIns.length} total this cycle
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4 lg:gap-6">
        {/* Left: Client list with pending check-ins */}
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
            {pendingList.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">No clients match.</p>
            ) : (
              pendingList.map(({ client, pendingCount, latest }) => (
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
                    <div className="text-[10px] text-muted-foreground truncate">
                      {latest ? format(new Date(latest.date), 'MMM d') : 'No check-ins'}
                    </div>
                  </div>
                  {pendingCount > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 pulse-soft" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right: Selected client check-in timeline */}
        <div>
          {!selectedClient ? (
            <div className="card-premium rounded-xl">
              <EmptyState
                icon={ClipboardCheck}
                title="Select a client"
                description="Pick a client on the left to review their check-in history."
              />
            </div>
          ) : (
            <div>
              {/* Header */}
              <div className="flex items-center justify-between gap-3 mb-4">
                <button
                  onClick={() => openClient(selectedClient.id)}
                  className="flex items-center gap-3 text-left tap-smooth"
                >
                  <Avatar className="w-10 h-10 rounded-lg">
                    <AvatarFallback className="bg-muted text-foreground text-xs font-semibold rounded-lg">
                      {selectedClient.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{selectedClient.full_name}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <GoalTag goal={selectedClient.goal} />
                      <StatusTag status={selectedClient.status} />
                    </div>
                  </div>
                </button>
                <Button variant="ghost" size="sm" onClick={() => openClient(selectedClient.id)} className="text-xs">
                  Open profile
                  <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </div>

              {/* Trend overview */}
              {selectedCheckIns.length > 1 && (
                <div className="card-premium rounded-xl p-5 mb-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">8-Week Trend</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <TrendStat
                      label="Weight"
                      value={`${selectedCheckIns[0].body_weight}kg`}
                      delta={Number((selectedCheckIns[0].body_weight - selectedCheckIns[selectedCheckIns.length - 1].body_weight).toFixed(1))}
                      goodDirection="down"
                      unit="kg"
                    />
                    <TrendStat
                      label="Energy"
                      value={`${selectedCheckIns[0].energy_score}/10`}
                      delta={selectedCheckIns[0].energy_score - selectedCheckIns[selectedCheckIns.length - 1].energy_score}
                      goodDirection="up"
                    />
                    <TrendStat
                      label="Sleep"
                      value={`${selectedCheckIns[0].sleep_score}/10`}
                      delta={selectedCheckIns[0].sleep_score - selectedCheckIns[selectedCheckIns.length - 1].sleep_score}
                      goodDirection="up"
                    />
                    <TrendStat
                      label="Adherence"
                      value={`${selectedCheckIns[0].adherence_percent}%`}
                      delta={selectedCheckIns[0].adherence_percent - selectedCheckIns[selectedCheckIns.length - 1].adherence_percent}
                      goodDirection="up"
                      unit="pts"
                    />
                  </div>
                  <div className="h-32 mt-4 -mx-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={[...selectedCheckIns]
                          .reverse()
                          .map((ci) => ({
                            date: format(new Date(ci.date), 'MMM d'),
                            weight: ci.body_weight,
                            adherence: ci.adherence_percent,
                          }))}
                        margin={{ top: 5, right: 8, bottom: 0, left: 8 }}
                      >
                        <defs>
                          <linearGradient id="adherenceGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--success)" stopOpacity={0.25} />
                            <stop offset="100%" stopColor="var(--success)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="adherence" stroke="var(--success)" strokeWidth={2} fill="url(#adherenceGrad)" dot={false} />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                        <YAxis hide domain={[40, 100]} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Check-in timeline */}
              <div className="space-y-3">
                {selectedCheckIns.length === 0 ? (
                  <div className="card-premium rounded-xl">
                    <EmptyState
                      icon={ClipboardCheck}
                      title="No check-ins yet"
                      description="This client hasn't submitted a weekly check-in."
                    />
                  </div>
                ) : (
                  selectedCheckIns.map((ci, i) => (
                    <motion.div
                      key={ci.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.25 }}
                      className="card-premium rounded-xl p-5"
                    >
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            'w-9 h-9 rounded-lg flex items-center justify-center',
                            ci.status === 'pending' ? 'bg-warning/15' : 'bg-success/10',
                          )}>
                            {ci.status === 'pending' ? (
                              <Clock className="w-4 h-4 text-warning-foreground" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-success" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-foreground">{format(new Date(ci.date), 'EEEE, MMM d')}</div>
                            <div className="text-[11px] text-muted-foreground">{formatDistanceToNow(new Date(ci.date), { addSuffix: true })}</div>
                          </div>
                        </div>
                        {ci.status === 'pending' ? (
                          <Badge variant="outline" className="text-warning-foreground border-warning/30 bg-warning/10 text-[10px] font-medium">
                            Pending
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-success border-success/20 bg-success/10 text-[10px] font-medium">
                            Reviewed
                          </Badge>
                        )}
                      </div>

                      {/* Vitals grid */}
                      <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
                        <VitalTile label="Weight" value={`${ci.body_weight}kg`} />
                        <VitalTile label="Waist" value={ci.waist ? `${ci.waist}cm` : '—'} />
                        <VitalTile label="Chest" value={ci.chest ? `${ci.chest}cm` : '—'} />
                        <VitalTile label="Arms" value={ci.arms ? `${ci.arms}cm` : '—'} />
                        <VitalTile label="Thighs" value={ci.thighs ? `${ci.thighs}cm` : '—'} />
                        <VitalTile label="Adherence" value={`${ci.adherence_percent}%`} />
                      </div>

                      {/* Subjective scores */}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <SubjectiveBar label="Energy" value={ci.energy_score} max={10} color="var(--chart-2)" />
                        <SubjectiveBar label="Sleep" value={ci.sleep_score} max={10} color="var(--chart-4)" />
                        <SubjectiveBar label="Mood" value={ci.mood_score} max={10} color="var(--chart-5)" />
                      </div>

                      {/* Progress photos */}
                      {ci.progress_photo_placeholder && (
                        <div className="flex items-center gap-2 mb-4 p-2 rounded-lg bg-muted/30">
                          <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center">
                            <Camera className="w-3.5 h-3.5 text-muted-foreground" />
                          </div>
                          <span className="text-[11px] text-muted-foreground">3 progress photos attached</span>
                        </div>
                      )}

                      {/* Client notes */}
                      <div className="bg-muted/30 rounded-lg p-3 mb-3">
                        <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">Client Notes</div>
                        <p className="text-sm text-foreground leading-relaxed">&ldquo;{ci.client_notes}&rdquo;</p>
                      </div>

                      {/* Coach response */}
                      {ci.coach_response && (
                        <div className="bg-primary/5 border border-primary/15 rounded-lg p-3 mb-3">
                          <div className="text-[10px] uppercase tracking-wider font-semibold text-primary mb-1">Your Response</div>
                          <p className="text-sm text-foreground leading-relaxed">{ci.coach_response}</p>
                        </div>
                      )}

                      {/* Pending actions */}
                      {ci.status === 'pending' && (
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button size="sm" className="gap-1.5 flex-1">
                            <Send className="w-3.5 h-3.5" />
                            Send Response
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            Mark Reviewed
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TrendStat({
  label,
  value,
  delta,
  goodDirection,
  unit,
}: {
  label: string
  value: string
  delta: number
  goodDirection: 'up' | 'down'
  unit?: string
}) {
  const isGood = delta === 0 ? null : (goodDirection === 'up' ? delta > 0 : delta < 0)
  return (
    <div className="p-2.5 rounded-lg bg-muted/30">
      <div className="text-[10px] text-muted-foreground font-medium mb-0.5">{label}</div>
      <div className="text-base font-semibold tabular-nums text-foreground">{value}</div>
      {delta !== 0 && (
        <div className={cn(
          'text-[10px] font-medium flex items-center gap-0.5 mt-0.5',
          isGood === null ? 'text-muted-foreground' : isGood ? 'text-success' : 'text-destructive',
        )}>
          {delta < 0 ? <TrendingDown className="w-2.5 h-2.5" /> : <TrendingUp className="w-2.5 h-2.5" />}
          {Math.abs(delta)}{unit || ''}
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
