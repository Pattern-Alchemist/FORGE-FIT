'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Play, Flame, TrendingUp, MessageSquare, ClipboardCheck, ChevronRight, Dumbbell, CheckCircle2, Trophy, Apple } from 'lucide-react'
import { useClientHomeStats, useClientWorkouts, useClientProfile } from '@/lib/hooks'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { AdherenceRing } from '@/components/shared'
import { cn } from '@/lib/utils'
import type { Tab } from './app'

export function ClientHome({
  onStartWorkout,
  onNavigate,
}: {
  onStartWorkout: (templateId: string) => void
  onNavigate: (tab: Tab) => void
}) {
  const { data: stats, isLoading: statsLoading } = useClientHomeStats()
  const { data: workouts = [], isLoading: workoutsLoading } = useClientWorkouts()
  const { data: profile } = useClientProfile()

  const todayWorkout = workouts[0]
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="px-4 py-5">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="flex items-center gap-3 mb-5">
          <Avatar className="w-11 h-11 rounded-xl">
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-sm font-semibold rounded-xl">
              {profile?.avatar ?? '??'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">{greeting},</p>
            <p className="text-base font-semibold text-foreground truncate">{profile?.full_name ?? 'Athlete'}</p>
          </div>
          <div className="flex items-center gap-1.5 bg-muted/60 rounded-full px-2.5 py-1">
            <Flame className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold tabular-nums">{stats?.weeklyStreak ?? 0}</span>
            <span className="text-[10px] text-muted-foreground">weeks</span>
          </div>
        </div>
      </motion.div>

      {/* Today's workout — the primary CTA */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="mb-5"
      >
        {workoutsLoading ? (
          <Skeleton className="h-44 w-full rounded-2xl" />
        ) : todayWorkout ? (
          <button
            onClick={() => onStartWorkout(todayWorkout.id)}
            className="w-full text-left rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-5 shadow-lg hover:shadow-xl transition-all tap-smooth relative overflow-hidden"
          >
            {/* Decorative pattern */}
            <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10" />
            <div className="absolute -right-12 -bottom-12 w-40 h-40 rounded-full bg-white/5" />

            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                  <Dumbbell className="w-4 h-4" strokeWidth={2.5} />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wider opacity-90">Today&apos;s Workout</span>
                {stats?.workoutDueToday && (
                  <span className="ml-auto text-[10px] bg-white/20 rounded-full px-2 py-0.5 font-medium">Due today</span>
                )}
              </div>
              <h2 className="text-xl font-semibold mb-1">{todayWorkout.title}</h2>
              <p className="text-xs opacity-90 mb-4">
                {todayWorkout.duration} min · {todayWorkout.blocks.length} blocks ·{' '}
                {todayWorkout.blocks.reduce((a, b) => a + b.exercises.length, 0)} exercises
              </p>
              <div className="inline-flex items-center gap-2 bg-white text-primary rounded-xl px-4 h-11 font-semibold text-sm shadow-sm">
                <Play className="w-4 h-4 fill-current" />
                Start Workout
              </div>
            </div>
          </button>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-border/60 p-8 text-center">
            <Dumbbell className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">No workout assigned</p>
            <p className="text-xs text-muted-foreground mt-1">Check back soon or message your coach.</p>
          </div>
        )}
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="grid grid-cols-3 gap-3 mb-5"
      >
        <StatCard
          label="Adherence"
          value={stats ? `${stats.adherenceScore}%` : '—'}
          icon={TrendingUp}
          color="var(--success)"
          loading={statsLoading}
        />
        <StatCard
          label="Streak"
          value={stats ? `${stats.weeklyStreak}w` : '—'}
          icon={Flame}
          color="var(--primary)"
          loading={statsLoading}
        />
        <StatCard
          label="Unread"
          value={stats ? `${stats.unreadMessages}` : '—'}
          icon={MessageSquare}
          color="var(--chart-5)"
          loading={statsLoading}
          onClick={() => onNavigate('messages')}
        />
      </motion.div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        className="space-y-2"
      >
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1 mb-2">Quick Actions</h3>
        <QuickAction
          icon={ClipboardCheck}
          label="Submit weekly check-in"
          sub="Takes under 5 minutes"
          onClick={() => onNavigate('check-in')}
        />
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onNavigate('progress')}
            className="flex flex-col items-start gap-1.5 p-3 rounded-xl bg-card border border-border/60 hover:border-border transition-all tap-smooth text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xs font-medium text-foreground">PRs & History</span>
            <span className="text-[10px] text-muted-foreground">Track progress</span>
          </button>
          <button
            onClick={() => onNavigate('nutrition')}
            className="flex flex-col items-start gap-1.5 p-3 rounded-xl bg-card border border-border/60 hover:border-border transition-all tap-smooth text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
              <Apple className="w-4 h-4 text-success" />
            </div>
            <span className="text-xs font-medium text-foreground">Nutrition</span>
            <span className="text-[10px] text-muted-foreground">Log meals</span>
          </button>
        </div>
        <QuickAction
          icon={MessageSquare}
          label="Message your coach"
          sub={stats?.unreadMessages ? `${stats.unreadMessages} unread` : 'Ask a question'}
          onClick={() => onNavigate('messages')}
          badge={stats?.unreadMessages}
        />
        {stats?.nextActionLabel && (
          <div className="rounded-xl bg-primary/5 border border-primary/15 p-3.5">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-primary mb-1">From your coach</div>
            <p className="text-sm text-foreground font-medium">{stats.nextActionLabel}</p>
            {stats.nextActionDue && (
              <p className="text-[11px] text-muted-foreground mt-0.5">Due {stats.nextActionDue}</p>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  loading,
  onClick,
}: {
  label: string
  value: string
  icon: React.ElementType
  color: string
  loading?: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        'rounded-xl bg-card border border-border/60 p-3 text-center transition-all',
        onClick && 'hover:border-border tap-smooth',
      )}
    >
      <Icon className="w-4 h-4 mx-auto mb-1.5" style={{ color }} />
      {loading ? (
        <Skeleton className="h-5 w-12 mx-auto" />
      ) : (
        <div className="text-lg font-semibold tabular-nums text-foreground">{value}</div>
      )}
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </button>
  )
}

function QuickAction({
  icon: Icon,
  label,
  sub,
  onClick,
  badge,
}: {
  icon: React.ElementType
  label: string
  sub: string
  onClick: () => void
  badge?: number
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-card border border-border/60 hover:border-border hover:bg-muted/30 transition-all tap-smooth text-left"
    >
      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground">{label}</div>
        <div className="text-[11px] text-muted-foreground">{sub}</div>
      </div>
      {badge ? (
        <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center">
          {badge}
        </span>
      ) : null}
      <ChevronRight className="w-4 h-4 text-muted-foreground/60" />
    </button>
  )
}
