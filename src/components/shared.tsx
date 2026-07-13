'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import type { ClientStatus, Goal, TrainingPhase } from '@/lib/types'
import { AlertTriangle, CheckCircle2, Clock, Pause, Trophy } from 'lucide-react'

// ---------- Status Tag ----------
export function StatusTag({ status }: { status: ClientStatus }) {
  const config = {
    active: { label: 'Active', cls: 'bg-success/15 text-success border-success/20' },
    paused: { label: 'Paused', cls: 'bg-warning/15 text-warning-foreground border-warning/30' },
    completed: { label: 'Completed', cls: 'bg-muted text-muted-foreground border-border' },
  }[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border',
        config.cls,
      )}
    >
      {status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-success pulse-soft" />}
      {status === 'paused' && <Pause className="w-2.5 h-2.5" />}
      {status === 'completed' && <Trophy className="w-2.5 h-2.5" />}
      {config.label}
    </span>
  )
}

// ---------- Goal Tag ----------
export function GoalTag({ goal }: { goal: Goal }) {
  const palette: Record<Goal, string> = {
    Hypertrophy: 'bg-primary/10 text-primary border-primary/20',
    'Fat Loss': 'bg-success/10 text-success border-success/20',
    Strength: 'bg-chart-3/15 text-chart-3 border-chart-3/20',
    'General Fitness': 'bg-muted text-muted-foreground border-border',
    'Athletic Performance': 'bg-chart-5/10 text-chart-5 border-chart-5/20',
    Recomposition: 'bg-chart-4/15 text-chart-4 border-chart-4/20',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border',
        palette[goal],
      )}
    >
      {goal}
    </span>
  )
}

// ---------- Phase Tag ----------
export function PhaseTag({ phase }: { phase: TrainingPhase }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted/70 text-foreground/80 border border-border/60">
      <span className="w-1 h-1 rounded-full bg-foreground/40" />
      {phase}
    </span>
  )
}

// ---------- Adherence Ring ----------
export function AdherenceRing({
  score,
  size = 56,
  stroke = 5,
  showLabel = true,
}: {
  score: number
  size?: number
  stroke?: number
  showLabel?: boolean
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - (score / 100) * c
  const color = score >= 85 ? 'var(--success)' : score >= 70 ? 'var(--warning)' : 'var(--destructive)'
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-muted/50" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 600ms cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[11px] font-semibold leading-none" style={{ color }}>
            {score}
          </span>
          <span className="text-[8px] text-muted-foreground leading-none mt-0.5">%</span>
        </div>
      )}
    </div>
  )
}

// ---------- KPI Card ----------
interface KPICardProps {
  label: string
  value: string | number
  icon: React.ElementType
  trend?: { value: string; direction: 'up' | 'down' | 'flat'; good?: boolean }
  hint?: string
  accent?: boolean
  onClick?: () => void
}

export function KPICard({ label, value, icon: Icon, trend, hint, accent, onClick }: KPICardProps) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        'text-left p-4 rounded-xl border transition-all tap-smooth',
        accent
          ? 'bg-primary text-primary-foreground border-primary shadow-sm hover:shadow-md'
          : 'bg-card text-card-foreground border-border/60 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:border-border',
        onClick && 'cursor-pointer',
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center',
            accent ? 'bg-primary-foreground/15' : 'bg-muted',
          )}
        >
          <Icon className={cn('w-4 h-4', accent ? 'text-primary-foreground' : 'text-muted-foreground')} strokeWidth={2.2} />
        </div>
        {trend && (
          <span
            className={cn(
              'text-[11px] font-medium px-1.5 py-0.5 rounded-md',
              accent
                ? 'bg-primary-foreground/15 text-primary-foreground'
                : trend.good
                  ? 'bg-success/10 text-success'
                  : 'bg-destructive/10 text-destructive',
            )}
          >
            {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'} {trend.value}
          </span>
        )}
      </div>
      <div className="space-y-0.5">
        <div className={cn('text-2xl font-semibold tracking-tight tabular-nums', accent && 'text-primary-foreground')}>
          {value}
        </div>
        <div className={cn('text-xs font-medium', accent ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
          {label}
        </div>
        {hint && (
          <div className={cn('text-[11px] mt-1', accent ? 'text-primary-foreground/70' : 'text-muted-foreground/80')}>
            {hint}
          </div>
        )}
      </div>
    </button>
  )
}

// ---------- Action Pill ----------
export function ActionPill({
  icon: Icon,
  label,
  tone = 'default',
  onClick,
}: {
  icon: React.ElementType
  label: string
  tone?: 'default' | 'primary' | 'warning'
  onClick?: () => void
}) {
  const tones = {
    default: 'bg-muted/70 text-foreground hover:bg-muted border-border/60',
    primary: 'bg-primary/10 text-primary hover:bg-primary/15 border-primary/20',
    warning: 'bg-warning/15 text-warning-foreground hover:bg-warning/25 border-warning/30',
  }
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors tap-smooth',
        tones[tone],
      )}
    >
      <Icon className="w-3 h-3" strokeWidth={2.2} />
      {label}
    </button>
  )
}

// ---------- Empty state ----------
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-muted-foreground" strokeWidth={1.8} />
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
      {description && <p className="text-xs text-muted-foreground max-w-xs mb-4">{description}</p>}
      {action}
    </div>
  )
}

// ---------- Mini sparkline (SVG, no library) ----------
export function Sparkline({
  data,
  color = 'var(--primary)',
  height = 32,
  width = 80,
  fill = true,
}: {
  data: number[]
  color?: string
  height?: number
  width?: number
  fill?: boolean
}) {
  if (!data.length) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const stepX = width / (data.length - 1 || 1)
  const points = data.map((d, i) => {
    const x = i * stepX
    const y = height - ((d - min) / range) * (height - 4) - 2
    return [x, y]
  })
  const linePath = points.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(' ')
  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`
  const gradId = `spark-${Math.random().toString(36).slice(2, 8)}`

  return (
    <svg width={width} height={height} className="overflow-visible">
      {fill && (
        <>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill={`url(#${gradId})`} />
        </>
      )}
      <path d={linePath} fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ---------- Page Header ----------
export function PageHeader({
  title,
  subtitle,
  action,
  meta,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
  meta?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div className="min-w-0 flex-1">
        <h1 className="text-display text-2xl lg:text-[28px] text-foreground">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        {meta && <div className="mt-3">{meta}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
