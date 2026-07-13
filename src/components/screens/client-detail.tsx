'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  MessageSquare,
  ClipboardCheck,
  Dumbbell,
  CalendarClock,
  Pencil,
  Phone,
  Mail,
  ChevronRight,
  Flame,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Activity,
  StickyNote,
  Plus,
  Send,
  CheckCircle2,
  Circle,
  Video,
} from 'lucide-react'
import { useStore, useClient, useClientCheckIns, useClientMessages, useClientProgram } from '@/lib/store'
import { StatusTag, GoalTag, PhaseTag, AdherenceRing, Sparkline, EmptyState } from '@/components/shared'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { formatDistanceToNow, format, differenceInWeeks } from 'date-fns'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from 'recharts'

type Tab = 'overview' | 'workouts' | 'check-ins' | 'progress' | 'notes' | 'chat'

export function ClientDetail() {
  const selectedId = useStore((s) => s.selectedClientId)
  const setScreen = useStore((s) => s.setScreen)
  const openConversation = useStore((s) => s.openConversation)
  const templates = useStore((s) => s.templates)

  const client = useClient(selectedId)
  const checkIns = useClientCheckIns(selectedId)
  const messages = useClientMessages(selectedId)
  const program = useClientProgram(selectedId)
  const [tab, setTab] = React.useState<Tab>('overview')

  if (!client) {
    return (
      <div className="px-4 lg:px-8 py-8 max-w-[1400px] mx-auto">
        <EmptyState
          icon={Dumbbell}
          title="No client selected"
          description="Pick a client from the list to see their full operating view."
          action={<Button onClick={() => setScreen('clients')}>Go to Clients</Button>}
        />
      </div>
    )
  }

  const unread = messages.filter((m) => !m.read_status && m.sender_type === 'client').length
  const pendingCi = checkIns.filter((ci) => ci.status === 'pending').length
  const weeksSinceJoin = differenceInWeeks(new Date(), new Date(client.join_date))

  // Build progress series from check-ins (oldest → newest)
  const progressSeries = [...checkIns]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((ci) => ({
      date: format(new Date(ci.date), 'MMM d'),
      weight: ci.body_weight,
      waist: ci.waist,
      energy: ci.energy_score,
      sleep: ci.sleep_score,
      mood: ci.mood_score,
      adherence: ci.adherence_percent,
    }))

  const weightTrend = progressSeries.map((p) => p.weight)
  const weightChange = weightTrend.length >= 2 ? Number((weightTrend[weightTrend.length - 1] - weightTrend[0]).toFixed(1)) : 0

  // Vitals summary for current week
  const latest = checkIns[0]

  return (
    <div className="pb-20 lg:pb-0">
      {/* Hero */}
      <div className="surface-gradient border-b border-border/60">
        <div className="px-4 lg:px-8 py-5 lg:py-7 max-w-[1400px] mx-auto">
          {/* Back button + actions */}
          <div className="flex items-center justify-between gap-3 mb-5">
            <button
              onClick={() => setScreen('clients')}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors tap-smooth"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Clients</span>
            </button>
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="sm" className="gap-1.5 h-8" onClick={() => openConversation(client.id)}>
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Message</span>
                {unread > 0 && (
                  <span className="ml-1 text-[10px] bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 font-bold">
                    {unread}
                  </span>
                )}
              </Button>
              <Button size="sm" className="gap-1.5 h-8">
                <Pencil className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
            </div>
          </div>

          {/* Hero content */}
          <div className="flex flex-col lg:flex-row lg:items-start gap-5 lg:gap-8">
            <div className="flex items-start gap-4 lg:gap-5 flex-1 min-w-0">
              <Avatar className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl shrink-0 ring-2 ring-background shadow-sm">
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-lg lg:text-xl font-semibold rounded-2xl">
                  {client.avatar}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h1 className="text-display text-xl lg:text-2xl text-foreground">{client.full_name}</h1>
                  <StatusTag status={client.status} />
                </div>
                <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground mb-3">
                  <span>{client.age}y · {client.gender === 'M' ? 'Male' : client.gender === 'F' ? 'Female' : 'Non-binary'}</span>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                  <span>Client {weeksSinceJoin}w</span>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                  <GoalTag goal={client.goal} />
                  <PhaseTag phase={client.training_phase} />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {client.tags.map((t) => (
                    <Badge key={t} variant="outline" className="bg-primary/5 border-primary/20 text-primary text-[10px] font-medium">
                      {t}
                    </Badge>
                  ))}
                </div>
                {client.injuries_limitations.length > 0 && (
                  <div className="mt-3 inline-flex items-start gap-1.5 text-xs text-warning-foreground bg-warning/10 border border-warning/20 rounded-md px-2 py-1.5">
                    <span className="font-medium">⚠ Injuries:</span>
                    <span>{client.injuries_limitations.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Adherence + Next Action */}
            <div className="grid grid-cols-2 lg:flex lg:flex-col gap-3 lg:gap-4 lg:w-[260px]">
              <div className="card-premium rounded-xl p-4 flex items-center gap-3">
                <AdherenceRing score={client.adherence_score} size={52} stroke={5} />
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Adherence</div>
                  <div className="text-lg font-semibold tabular-nums text-foreground">{client.adherence_score}%</div>
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Flame className="w-3 h-3 text-primary" />
                    {client.weekly_streak}w streak
                  </div>
                </div>
              </div>
              {client.next_action && (
                <button
                  onClick={() => {
                    if (client.next_action?.type === 'reply_message') openConversation(client.id)
                    else if (client.next_action?.type === 'update_workout') setScreen('workout-builder')
                  }}
                  className="card-premium rounded-xl p-4 text-left hover:border-primary/30 transition-colors tap-smooth"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
                      <CalendarClock className="w-3.5 h-3.5 text-primary-foreground" />
                    </div>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Next Action</span>
                  </div>
                  <div className="text-xs font-medium text-foreground leading-snug mb-1">{client.next_action.label}</div>
                  <div className="text-[11px] text-primary font-medium">Due {client.next_action.due}</div>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 lg:px-8 py-5 lg:py-7 max-w-[1400px] mx-auto">
        <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
          <TabsList className="bg-muted/60 h-10 p-1 rounded-lg overflow-x-auto scrollbar-none">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="workouts" className="text-xs">Workouts</TabsTrigger>
            <TabsTrigger value="check-ins" className="text-xs">
              Check-ins
              {pendingCi > 0 && (
                <span className="ml-1.5 text-[9px] bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 font-bold">
                  {pendingCi}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="progress" className="text-xs">Progress</TabsTrigger>
            <TabsTrigger value="notes" className="text-xs">Notes</TabsTrigger>
            <TabsTrigger value="chat" className="text-xs">
              Chat
              {unread > 0 && (
                <span className="ml-1.5 text-[9px] bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 font-bold">
                  {unread}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-5">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
              {/* Left: Current program + Stats */}
              <div className="lg:col-span-2 space-y-4 lg:space-y-6">
                {/* Current program */}
                <div className="card-premium rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-foreground">Current Program</h3>
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setScreen('workout-builder')}>
                      Update
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                  {program ? (
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div>
                          <div className="text-base font-semibold text-foreground">{program.title}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {program.weeks}-week program · Started {format(new Date(program.start_date), 'MMM d')}
                          </div>
                        </div>
                        <GoalTag goal={program.goal} />
                      </div>
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <Stat label="Workouts" value={`${program.workout_template_ids.length}`} />
                        <Stat label="Phase" value={program.phase} />
                        <Stat label="Goal" value={program.goal} />
                      </div>
                      {/* Program timeline */}
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${Math.min(100, Math.round(((program.weeks - 4) / program.weeks) * 100))}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5">
                        <span>Week {Math.max(1, program.weeks - 4)}</span>
                        <span>Week {program.weeks}</span>
                      </div>
                    </div>
                  ) : (
                    <EmptyState
                      icon={Dumbbell}
                      title="No active program"
                      description="Build a workout and assign it to get started."
                      action={
                        <Button size="sm" onClick={() => setScreen('workout-builder')} className="gap-1.5">
                          <Plus className="w-3.5 h-3.5" />
                          Assign Program
                        </Button>
                      }
                    />
                  )}
                </div>

                {/* Latest check-in */}
                <div className="card-premium rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-foreground">Latest Check-in</h3>
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setTab('check-ins')}>
                      View all
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                  {latest ? (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(latest.date), 'EEEE, MMM d')}
                        </span>
                        {latest.status === 'pending' && (
                          <Badge variant="outline" className="text-warning-foreground border-warning/30 bg-warning/10 text-[10px]">
                            Pending Review
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-foreground leading-relaxed mb-4 bg-muted/30 rounded-lg p-3">
                        &ldquo;{latest.client_notes}&rdquo;
                      </p>
                      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
                        <Vital label="Weight" value={`${latest.body_weight}kg`} delta={weightChange} />
                        <Vital label="Energy" value={`${latest.energy_score}/10`} />
                        <Vital label="Sleep" value={`${latest.sleep_score}/10`} />
                        <Vital label="Mood" value={`${latest.mood_score}/10`} />
                        <Vital label="Waist" value={latest.waist ? `${latest.waist}cm` : '—'} />
                        <Vital label="Adherence" value={`${latest.adherence_percent}%`} />
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground py-4 text-center">No check-ins yet.</p>
                  )}
                </div>

                {/* Progress trend mini */}
                <div className="card-premium rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-foreground">Weight Trend</h3>
                    <div className="flex items-center gap-2">
                      {weightChange !== 0 && (
                        <span
                          className={cn(
                            'text-xs font-medium flex items-center gap-0.5',
                            weightChange < 0 ? 'text-success' : weightChange > 0 ? 'text-primary' : 'text-muted-foreground',
                          )}
                        >
                          {weightChange < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                          {Math.abs(weightChange)}kg
                        </span>
                      )}
                      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setTab('progress')}>
                        Full
                        <ChevronRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                  <div className="h-32 -mx-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={progressSeries} margin={{ top: 5, right: 8, bottom: 0, left: 8 }}>
                        <defs>
                          <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.25} />
                            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area
                          type="monotone"
                          dataKey="weight"
                          stroke="var(--primary)"
                          strokeWidth={2}
                          fill="url(#weightGrad)"
                          dot={false}
                        />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                        <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Right: Vitals + Recent activity */}
              <div className="space-y-4 lg:space-y-6">
                {/* Vitals rings */}
                <div className="card-premium rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-4">This Week&apos;s Vitals</h3>
                  {latest && (
                    <div className="grid grid-cols-3 gap-3">
                      <VitalRing label="Energy" value={latest.energy_score} max={10} color="var(--chart-2)" />
                      <VitalRing label="Sleep" value={latest.sleep_score} max={10} color="var(--chart-4)" />
                      <VitalRing label="Mood" value={latest.mood_score} max={10} color="var(--chart-5)" />
                    </div>
                  )}
                </div>

                {/* Quick stats */}
                <div className="card-premium rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-4">At a Glance</h3>
                  <div className="space-y-3">
                    <StatRow label="Sessions completed" value="42" sub="last 8 weeks" />
                    <StatRow label="Avg session length" value="68 min" />
                    <StatRow label="PRs this block" value="3" sub="squat, bench, deadlift" />
                    <StatRow label="Check-in rate" value="96%" sub="last 8 weeks" />
                  </div>
                </div>

                {/* Injuries */}
                {client.injuries_limitations.length > 0 && (
                  <div className="card-premium rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Injuries & Limitations</h3>
                    <ul className="space-y-2">
                      {client.injuries_limitations.map((inj, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs">
                          <div className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5 shrink-0" />
                          <span className="text-foreground/80">{inj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Workouts Tab */}
          <TabsContent value="workouts" className="mt-5">
            <WorkoutsTab clientId={client.id} />
          </TabsContent>

          {/* Check-ins Tab */}
          <TabsContent value="check-ins" className="mt-5">
            <CheckInsTab clientId={client.id} />
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="mt-5">
            <ProgressTab clientId={client.id} />
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="mt-5">
            <NotesTab client={client} />
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="mt-5">
            <ChatTab clientId={client.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-2.5 rounded-lg bg-muted/40">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{label}</div>
      <div className="text-sm font-semibold text-foreground truncate mt-0.5">{value}</div>
    </div>
  )
}

function Vital({ label, value, delta }: { label: string; value: string; delta?: number }) {
  return (
    <div className="text-center p-2 rounded-lg bg-muted/30">
      <div className="text-[10px] text-muted-foreground font-medium mb-0.5">{label}</div>
      <div className="text-sm font-semibold tabular-nums text-foreground">{value}</div>
      {delta !== undefined && delta !== 0 && (
        <div className={cn('text-[10px] font-medium flex items-center justify-center gap-0.5', delta < 0 ? 'text-success' : 'text-primary')}>
          {delta < 0 ? <TrendingDown className="w-2.5 h-2.5" /> : <TrendingUp className="w-2.5 h-2.5" />}
          {Math.abs(delta)}
        </div>
      )}
    </div>
  )
}

function VitalRing({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = (value / max) * 100
  const data = [{ name: label, value: pct, fill: color }]
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-16 h-16">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart innerRadius="70%" outerRadius="100%" data={data} startAngle={90} endAngle={-270}>
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar background={{ fill: 'var(--muted)' }} dataKey="value" cornerRadius={8} angleAxisId={0} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-base font-semibold tabular-nums" style={{ color }}>{value}</span>
          <span className="text-[9px] text-muted-foreground">/{max}</span>
        </div>
      </div>
      <span className="text-[10px] text-muted-foreground font-medium mt-1">{label}</span>
    </div>
  )
}

function StatRow({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-xs text-foreground">{label}</div>
        {sub && <div className="text-[10px] text-muted-foreground">{sub}</div>}
      </div>
      <span className="text-sm font-semibold tabular-nums text-foreground">{value}</span>
    </div>
  )
}

// ---------- Workouts Tab ----------
function WorkoutsTab({ clientId }: { clientId: string }) {
  const program = useClientProgram(clientId)
  const templates = useStore((s) => s.templates)
  const setScreen = useStore((s) => s.setScreen)
  const setBuilder = useStore((s) => s.setBuilder)

  const assignedTemplates = program
    ? templates.filter((t) => program.workout_template_ids.includes(t.id))
    : []

  if (assignedTemplates.length === 0) {
    return (
      <div className="card-premium rounded-xl">
        <EmptyState
          icon={Dumbbell}
          title="No workouts assigned yet"
          description="Build a workout template and assign it to this client to get started."
          action={
            <Button onClick={() => { setBuilder(null); setScreen('workout-builder') }} className="gap-1.5">
              <Plus className="w-4 h-4" />
              Build Workout
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {assignedTemplates.map((t) => (
        <div key={t.id} className="card-premium rounded-xl p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-semibold text-foreground">{t.title}</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <Badge variant="outline" className="text-[10px]">{t.category}</Badge>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{t.duration} min</span>
                <span>·</span>
                <span>{t.blocks.length} blocks</span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { setBuilder(t.id); setScreen('workout-builder') }}>
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </Button>
          </div>
          <div className="space-y-2">
            {t.blocks.map((b, i) => (
              <div key={b.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <div className="w-6 h-6 rounded-md bg-primary/10 text-primary text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wide">{b.block_type}</span>
                    <span className="text-[10px] text-muted-foreground">·</span>
                    <span className="text-[11px] text-muted-foreground">{b.exercises.length} exercises</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {b.exercises.map((e) => (
                      <span key={e.id} className="text-[11px] text-foreground/80 bg-card border border-border/60 rounded px-1.5 py-0.5">
                        {e.name} · {e.sets}×{e.reps}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ---------- Check-ins Tab ----------
function CheckInsTab({ clientId }: { clientId: string }) {
  const checkIns = useClientCheckIns(clientId)
  const toggleTask = useStore((s) => s.toggleTask)
  const sorted = [...checkIns].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="space-y-4">
      {sorted.length === 0 ? (
        <div className="card-premium rounded-xl">
          <EmptyState icon={ClipboardCheck} title="No check-ins yet" description="This client hasn't submitted a weekly check-in." />
        </div>
      ) : (
        sorted.map((ci, i) => (
          <motion.div
            key={ci.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.25 }}
            className="card-premium rounded-xl p-5"
          >
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                  <ClipboardCheck className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{format(new Date(ci.date), 'EEEE, MMM d')}</div>
                  <div className="text-[11px] text-muted-foreground">{formatDistanceToNow(new Date(ci.date), { addSuffix: true })}</div>
                </div>
              </div>
              {ci.status === 'pending' ? (
                <Badge variant="outline" className="text-warning-foreground border-warning/30 bg-warning/10 text-[10px] font-medium">
                  Pending Review
                </Badge>
              ) : (
                <Badge variant="outline" className="text-success border-success/20 bg-success/10 text-[10px] font-medium">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Reviewed
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
              <Vital label="Weight" value={`${ci.body_weight}kg`} />
              <Vital label="Waist" value={ci.waist ? `${ci.waist}cm` : '—'} />
              <Vital label="Energy" value={`${ci.energy_score}/10`} />
              <Vital label="Sleep" value={`${ci.sleep_score}/10`} />
              <Vital label="Mood" value={`${ci.mood_score}/10`} />
              <Vital label="Adherence" value={`${ci.adherence_percent}%`} />
            </div>

            <div className="bg-muted/30 rounded-lg p-3 mb-3">
              <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">Client Notes</div>
              <p className="text-sm text-foreground leading-relaxed">&ldquo;{ci.client_notes}&rdquo;</p>
            </div>

            {ci.coach_response && (
              <div className="bg-primary/5 border border-primary/15 rounded-lg p-3">
                <div className="text-[10px] uppercase tracking-wider font-semibold text-primary mb-1">Your Response</div>
                <p className="text-sm text-foreground leading-relaxed">{ci.coach_response}</p>
              </div>
            )}

            {ci.status === 'pending' && (
              <div className="flex gap-2 mt-3">
                <Button size="sm" className="gap-1.5">
                  <Send className="w-3.5 h-3.5" />
                  Send Response
                </Button>
                <Button variant="outline" size="sm">Mark Reviewed</Button>
              </div>
            )}
          </motion.div>
        ))
      )}
    </div>
  )
}

// ---------- Progress Tab ----------
function ProgressTab({ clientId }: { clientId: string }) {
  const checkIns = useClientCheckIns(clientId)
  const series = [...checkIns]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((ci) => ({
      date: format(new Date(ci.date), 'MMM d'),
      weight: ci.body_weight,
      waist: ci.waist,
      energy: ci.energy_score,
      sleep: ci.sleep_score,
      mood: ci.mood_score,
      adherence: ci.adherence_percent,
    }))

  if (series.length === 0) {
    return (
      <div className="card-premium rounded-xl">
        <EmptyState icon={TrendingUp} title="No progress data yet" description="Check-ins will populate trend charts here." />
      </div>
    )
  }

  const charts = [
    { key: 'weight', label: 'Body Weight', unit: 'kg', color: 'var(--primary)' },
    { key: 'waist', label: 'Waist', unit: 'cm', color: 'var(--chart-2)' },
    { key: 'adherence', label: 'Adherence', unit: '%', color: 'var(--success)' },
    { key: 'energy', label: 'Energy', unit: '/10', color: 'var(--chart-4)' },
    { key: 'sleep', label: 'Sleep', unit: '/10', color: 'var(--chart-5)' },
    { key: 'mood', label: 'Mood', unit: '/10', color: 'var(--chart-3)' },
  ] as const

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {charts.map((c) => (
        <div key={c.key} className="card-premium rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">{c.label}</h3>
            <span className="text-xs text-muted-foreground tabular-nums">
              {series[series.length - 1][c.key]}{c.unit}
            </span>
          </div>
          <div className="h-40 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 5, right: 8, bottom: 0, left: 8 }}>
                <defs>
                  <linearGradient id={`grad-${c.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={c.color} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={c.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey={c.key} stroke={c.color} strokeWidth={2} fill={`url(#grad-${c.key})`} dot={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} width={28} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: 'var(--foreground)',
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      ))}
    </div>
  )
}

// ---------- Notes Tab ----------
function NotesTab({ client }: { client: ReturnType<typeof useClient> }) {
  if (!client) return null
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 card-premium rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Coach Notes</h3>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5">
            <Pencil className="w-3 h-3" />
            Edit
          </Button>
        </div>
        <div className="bg-muted/30 rounded-lg p-4">
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{client.coach_notes}</p>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Textarea placeholder="Add a private note…" className="bg-muted/40 border-transparent resize-none" rows={3} />
        </div>
        <div className="flex justify-end mt-2">
          <Button size="sm">Save Note</Button>
        </div>
      </div>
      <div className="card-premium rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Tags</h3>
        <div className="flex flex-wrap gap-2 mb-5">
          {client.tags.map((t) => (
            <Badge key={t} variant="outline" className="bg-primary/5 border-primary/20 text-primary">
              {t}
            </Badge>
          ))}
          <button className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 px-2 py-1 rounded-md border border-dashed border-border/80">
            <Plus className="w-3 h-3" />
            Add tag
          </button>
        </div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Contact</h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="w-3.5 h-3.5" />
            <span className="text-foreground/80">{client.full_name.toLowerCase().replace(' ', '.')}@email.com</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="w-3.5 h-3.5" />
            <span className="text-foreground/80">+1 (555) 0{Math.floor(100 + client.id.charCodeAt(2) * 7 % 900)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------- Chat Tab ----------
function ChatTab({ clientId }: { clientId: string }) {
  const messages = useClientMessages(clientId)
  const sendMessage = useStore((s) => s.sendMessage)
  const savedReplies = useStore((s) => s.savedReplies)
  const [input, setInput] = React.useState('')
  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length])

  const handleSend = () => {
    if (!input.trim()) return
    sendMessage(clientId, input.trim())
    setInput('')
  }

  const sorted = [...messages].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  return (
    <div className="card-premium rounded-xl overflow-hidden flex flex-col" style={{ height: '600px' }}>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-3">
        {sorted.length === 0 ? (
          <EmptyState icon={MessageSquare} title="No messages yet" description="Start the conversation." />
        ) : (
          sorted.map((m, i) => {
            const isCoach = m.sender_type === 'coach'
            const prev = sorted[i - 1]
            const showAvatar = !prev || prev.sender_type !== m.sender_type
            return (
              <div key={m.id} className={cn('flex gap-2.5', isCoach && 'flex-row-reverse')}>
                <div className="w-7 shrink-0">
                  {showAvatar && (
                    <div className={cn(
                      'w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-semibold',
                      isCoach ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground',
                    )}>
                      {isCoach ? 'MV' : clientId.slice(-2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className={cn('max-w-[75%] flex flex-col', isCoach && 'items-end')}>
                  <div
                    className={cn(
                      'px-3.5 py-2 rounded-2xl text-sm leading-relaxed',
                      isCoach
                        ? 'bg-primary text-primary-foreground rounded-tr-sm'
                        : 'bg-muted text-foreground rounded-tl-sm',
                    )}
                  >
                    {m.message_text}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 px-1">
                    {format(new Date(m.created_at), 'p')}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Saved replies */}
      <div className="px-4 lg:px-6 py-2 border-t border-border/60 bg-muted/30">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold self-center shrink-0">Saved:</span>
          {savedReplies.slice(0, 4).map((sr) => (
            <button
              key={sr.id}
              onClick={() => setInput(sr.body)}
              className="shrink-0 text-[11px] px-2.5 py-1 rounded-md bg-card border border-border/60 text-foreground hover:border-primary/30 hover:text-primary transition-colors tap-smooth"
            >
              {sr.title}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-3 lg:p-4 border-t border-border/60 flex items-center gap-2">
        <button className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0">
          <Plus className="w-4 h-4" />
        </button>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          placeholder="Type a message…"
          rows={1}
          className="resize-none bg-muted/40 border-transparent min-h-[40px] max-h-32"
        />
        <Button size="icon" onClick={handleSend} disabled={!input.trim()} className="shrink-0 h-9 w-9 rounded-lg">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
