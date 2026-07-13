'use client'

import * as React from 'react'
import { Dumbbell, Plus, ChevronRight, TrendingUp, TrendingDown, CalendarClock } from 'lucide-react'
import type { Client, Program, CheckIn } from '@/lib/types'
import { GoalTag } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import { useUIStore } from '@/lib/store'

export function ClientOverviewTab({
  client,
  program,
  checkIns,
}: {
  client: Client
  program: Program | null | undefined
  checkIns: CheckIn[]
}) {
  const setScreen = useUIStore((s) => s.setScreen)

  const progressSeries = [...checkIns]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((ci) => ({
      date: format(new Date(ci.date), 'MMM d'),
      weight: ci.body_weight,
    }))

  const weightTrend = progressSeries.map((p) => p.weight)
  const weightChange = weightTrend.length >= 2
    ? Number((weightTrend[weightTrend.length - 1] - weightTrend[0]).toFixed(1))
    : 0

  const latest = checkIns[0]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
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
          </div>
          {latest ? (
            <div>
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

        {/* Weight trend mini */}
        <div className="card-premium rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Weight Trend</h3>
            {weightChange !== 0 && (
              <span className={cn('text-xs font-medium flex items-center gap-0.5', weightChange < 0 ? 'text-success' : 'text-primary')}>
                {weightChange < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                {Math.abs(weightChange)}kg
              </span>
            )}
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
                <Area type="monotone" dataKey="weight" stroke="var(--primary)" strokeWidth={2} fill="url(#weightGrad)" dot={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Right column */}
      <div className="space-y-4 lg:space-y-6">
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

        <div className="card-premium rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">At a Glance</h3>
          <div className="space-y-3">
            <StatRow label="Sessions completed" value="42" sub="last 8 weeks" />
            <StatRow label="Avg session length" value="68 min" />
            <StatRow label="PRs this block" value="3" sub="squat, bench, deadlift" />
            <StatRow label="Check-in rate" value="96%" sub="last 8 weeks" />
          </div>
        </div>

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
          <RadialBarChartInner data={data} color={color} />
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

// Tiny inline import to avoid name clash
import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts'
function RadialBarChartInner({ data, color }: { data: { name: string; value: number; fill: string }[]; color: string }) {
  return (
    <RadialBarChart innerRadius="70%" outerRadius="100%" data={data} startAngle={90} endAngle={-270}>
      <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
      <RadialBar background={{ fill: 'var(--muted)' }} dataKey="value" cornerRadius={8} angleAxisId={0} fill={color} />
    </RadialBarChart>
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
