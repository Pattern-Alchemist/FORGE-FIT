'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Dumbbell,
  MessageSquare,
  ClipboardCheck,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Flame,
  ChevronRight,
  Activity,
} from 'lucide-react'
import { useStore } from '@/lib/store'
import { KPICard, AdherenceRing, GoalTag, StatusTag } from '@/components/shared'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

export function Dashboard() {
  const coach = useStore((s) => s.coach)
  const clients = useStore((s) => s.clients)
  const tasks = useStore((s) => s.tasks)
  const toggleTask = useStore((s) => s.toggleTask)
  const activityEvents = useStore((s) => s.activityEvents)
  const messages = useStore((s) => s.messages)
  const checkIns = useStore((s) => s.checkIns)
  const openClient = useStore((s) => s.openClient)
  const setScreen = useStore((s) => s.setScreen)
  const openConversation = useStore((s) => s.openConversation)

  const activeClients = clients.filter((c) => c.status === 'active').length
  const workoutsDueToday = clients.filter((c) => c.workout_due_today).length
  const unreadMessages = messages.filter((m) => !m.read_status && m.sender_type === 'client').length
  const pendingCheckIns = checkIns.filter((ci) => ci.status === 'pending').length
  const avgAdherence = Math.round(
    clients.filter((c) => c.status === 'active').reduce((sum, c) => sum + c.adherence_score, 0) /
      Math.max(1, activeClients),
  )

  const pendingTasks = tasks.filter((t) => !t.completed)
  const completedToday = tasks.filter((t) => t.completed).length

  const flaggedClients = clients.filter(
    (c) => c.status === 'active' && (c.adherence_score < 78 || c.pending_check_in),
  )

  const topMovers = [...clients]
    .filter((c) => c.status === 'active')
    .sort((a, b) => b.weekly_streak - a.weekly_streak)
    .slice(0, 4)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const fadeUp = {
    hidden: { opacity: 0, y: 8 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.04, duration: 0.3, ease: [0.4, 0, 0.2, 1] as const },
    }),
  }

  return (
    <div className="px-4 lg:px-8 py-6 lg:py-8 max-w-[1400px] mx-auto">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6 lg:mb-8"
      >
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-success pulse-soft" />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} · All systems on track</span>
        </div>
        <h1 className="text-display text-2xl lg:text-[32px] text-foreground">
          {greeting}, {coach.name.split(' ')[0]}.
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          You have <span className="font-semibold text-foreground">{pendingTasks.length} tasks</span> waiting and{' '}
          <span className="font-semibold text-foreground">{pendingCheckIns} check-ins</span> to review today.
        </p>
      </motion.div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4 mb-8">
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show">
          <KPICard
            label="Active Clients"
            value={activeClients}
            icon={Users}
            trend={{ value: '+1', direction: 'up', good: true }}
            hint="1 paused, 1 completed"
            onClick={() => setScreen('clients')}
          />
        </motion.div>
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="show">
          <KPICard
            label="Workouts Due Today"
            value={workoutsDueToday}
            icon={Dumbbell}
            accent
            hint="Across 7 clients"
            onClick={() => setScreen('workout-builder')}
          />
        </motion.div>
        <motion.div custom={2} variants={fadeUp} initial="hidden" animate="show">
          <KPICard
            label="Pending Check-ins"
            value={pendingCheckIns}
            icon={ClipboardCheck}
            trend={{ value: '2 new', direction: 'up', good: false }}
            hint="Review queue"
            onClick={() => setScreen('check-ins')}
          />
        </motion.div>
        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="show">
          <KPICard
            label="Unread Messages"
            value={unreadMessages}
            icon={MessageSquare}
            hint="From 4 clients"
            onClick={() => setScreen('messages')}
          />
        </motion.div>
        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="show">
          <KPICard
            label="Avg Adherence"
            value={`${avgAdherence}%`}
            icon={TrendingUp}
            trend={{ value: '2.4pts', direction: 'up', good: true }}
            hint="Rolling 30-day"
          />
        </motion.div>
      </div>

      {/* Main grid: Today's tasks (left, primary) + Activity (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6">
        {/* Today's Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="lg:col-span-2 card-premium rounded-xl overflow-hidden"
        >
          <div className="p-5 lg:p-6 border-b border-border/60">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-foreground">Today&apos;s Coach Tasks</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {pendingTasks.length} remaining · {completedToday} done today
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Progress</div>
                  <div className="text-sm font-semibold tabular-nums">
                    {completedToday}/{tasks.length}
                  </div>
                </div>
                <div className="w-12 h-12">
                  <AdherenceRing
                    score={Math.round((completedToday / tasks.length) * 100)}
                    size={48}
                    stroke={4}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="divide-y divide-border/60 max-h-[480px] overflow-y-auto">
            {pendingTasks.length === 0 ? (
              <div className="p-8 flex flex-col items-center text-center">
                <CheckCircle2 className="w-8 h-8 text-success mb-2" />
                <p className="text-sm font-medium text-foreground">All caught up</p>
                <p className="text-xs text-muted-foreground mt-1">Nothing pending. Enjoy the breather.</p>
              </div>
            ) : (
              pendingTasks.map((task, i) => {
                const client = clients.find((c) => c.id === task.client_id)
                if (!client) return null
                const priorityColor =
                  task.priority === 'high'
                    ? 'bg-destructive'
                    : task.priority === 'medium'
                      ? 'bg-warning'
                      : 'bg-muted-foreground'
                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + i * 0.04, duration: 0.25 }}
                    onClick={() => {
                      if (task.type === 'reply_message') openConversation(client.id)
                      else openClient(client.id)
                    }}
                    className="w-full flex items-center gap-3 lg:gap-4 p-4 lg:px-6 lg:py-4 hover:bg-muted/50 transition-colors text-left tap-smooth group cursor-pointer"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleTask(task.id)
                      }}
                      className="shrink-0"
                      aria-label="Mark complete"
                    >
                      <Circle className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                    </button>
                    <div className="shrink-0">
                      <Avatar className="w-9 h-9 rounded-lg">
                        <AvatarFallback className="bg-muted text-foreground text-xs font-semibold rounded-lg">
                          {client.avatar}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium text-foreground truncate">{client.full_name}</span>
                        <StatusTag status={client.status} />
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{task.label}</p>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <span className={cn('w-1.5 h-1.5 rounded-full', priorityColor)} />
                      <span className="text-[11px] text-muted-foreground hidden sm:inline">{task.due}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/60 group-hover:text-foreground transition-colors" />
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>
        </motion.div>

        {/* Right column */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="space-y-4 lg:space-y-6"
        >
          {/* Flagged issues */}
          <div className="card-premium rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-destructive" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Needs Attention</h3>
              <span className="ml-auto text-xs text-muted-foreground">{flaggedClients.length}</span>
            </div>
            <div className="space-y-2">
              {flaggedClients.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">Nothing flagged today.</p>
              ) : (
                flaggedClients.slice(0, 4).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => openClient(c.id)}
                    className="w-full flex items-center gap-2.5 p-2 -m-2 rounded-lg hover:bg-muted/50 transition-colors text-left tap-smooth"
                  >
                    <Avatar className="w-7 h-7 rounded-md shrink-0">
                      <AvatarFallback className="bg-muted text-foreground text-[10px] font-semibold rounded-md">
                        {c.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-foreground truncate">{c.full_name}</div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        {c.pending_check_in ? 'Pending check-in · ' : ''}
                        {c.adherence_score < 78 ? `Adherence ${c.adherence_score}%` : ''}
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Recent activity */}
          <div className="card-premium rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                <Activity className="w-4 h-4 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
            </div>
            <div className="space-y-3">
              {activityEvents.slice(0, 6).map((ev) => {
                const client = clients.find((c) => c.id === ev.client_id)
                if (!client) return null
                const iconBg =
                  ev.type === 'adherence_drop'
                    ? 'bg-destructive/10 text-destructive'
                    : ev.type === 'check_in'
                      ? 'bg-success/10 text-success'
                      : ev.type === 'workout_complete'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                const Icon =
                  ev.type === 'adherence_drop'
                    ? AlertTriangle
                    : ev.type === 'check_in'
                      ? ClipboardCheck
                      : ev.type === 'workout_complete'
                        ? Dumbbell
                        : MessageSquare
                return (
                  <div key={ev.id} className="flex items-start gap-2.5">
                    <div className={cn('w-6 h-6 rounded-md shrink-0 flex items-center justify-center mt-0.5', iconBg)}>
                      <Icon className="w-3 h-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground leading-snug">
                        <span className="font-medium">{client.full_name}</span>{' '}
                        <span className="text-muted-foreground">{ev.label}</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {formatDistanceToNow(new Date(ev.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Top movers */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="card-premium rounded-xl p-5 lg:p-6"
      >
        <div className="flex items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Flame className="w-4 h-4 text-primary" />
              Top Consistency Streaks
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">Clients on a roll — recognize them this week</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setScreen('clients')} className="text-xs">
            View all
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {topMovers.map((c, i) => (
            <button
              key={c.id}
              onClick={() => openClient(c.id)}
              className="text-left p-3 rounded-lg border border-border/60 hover:border-border hover:bg-muted/30 transition-all tap-smooth group"
            >
              <div className="flex items-center gap-2.5 mb-3">
                <Avatar className="w-9 h-9 rounded-lg">
                  <AvatarFallback className="bg-muted text-foreground text-[11px] font-semibold rounded-lg">
                    {c.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-foreground truncate">{c.full_name}</div>
                  <GoalTag goal={c.goal} />
                </div>
                <span className="text-[10px] text-muted-foreground font-medium">#{i + 1}</span>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-xl font-semibold tabular-nums text-foreground">{c.weekly_streak}</div>
                  <div className="text-[10px] text-muted-foreground">week streak</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold tabular-nums" style={{ color: 'var(--success)' }}>
                    {c.adherence_score}%
                  </div>
                  <div className="text-[10px] text-muted-foreground">adherence</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
