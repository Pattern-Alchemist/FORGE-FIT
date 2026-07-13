'use client'

import { TrendingUp } from 'lucide-react'
import type { CheckIn } from '@/lib/types'
import { EmptyState } from '@/components/shared'
import { format } from 'date-fns'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export function ClientProgressTab({ checkIns }: { checkIns: CheckIn[] }) {
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
