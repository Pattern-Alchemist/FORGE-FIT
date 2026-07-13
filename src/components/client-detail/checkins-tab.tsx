'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { ClipboardCheck, Send, CheckCircle2, Clock, Camera } from 'lucide-react'
import { useCheckIns, useReviewCheckIn } from '@/lib/hooks'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/shared'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { format, formatDistanceToNow } from 'date-fns'

export function ClientCheckInsTab({ clientId }: { clientId: string }) {
  const { data: checkIns = [], isLoading } = useCheckIns(clientId)
  const reviewCheckIn = useReviewCheckIn()
  const sorted = [...checkIns].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (sorted.length === 0) {
    return (
      <div className="card-premium rounded-xl">
        <EmptyState icon={ClipboardCheck} title="No check-ins yet" description="This client hasn't submitted a weekly check-in." />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {sorted.map((ci, i) => (
        <motion.div
          key={ci.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04, duration: 0.25 }}
          className="card-premium rounded-xl p-5"
        >
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className={cn(
                'w-9 h-9 rounded-lg flex items-center justify-center',
                ci.status === 'pending' ? 'bg-warning/15' : 'bg-success/10',
              )}>
                {ci.status === 'pending' ? <Clock className="w-4 h-4 text-warning-foreground" /> : <CheckCircle2 className="w-4 h-4 text-success" />}
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">{format(new Date(ci.date), 'EEEE, MMM d')}</div>
                <div className="text-[11px] text-muted-foreground">{formatDistanceToNow(new Date(ci.date), { addSuffix: true })}</div>
              </div>
            </div>
            {ci.status === 'pending' ? (
              <Badge variant="outline" className="text-warning-foreground border-warning/30 bg-warning/10 text-[10px] font-medium">Pending Review</Badge>
            ) : (
              <Badge variant="outline" className="text-success border-success/20 bg-success/10 text-[10px] font-medium">
                <CheckCircle2 className="w-3 h-3 mr-1" />Reviewed
              </Badge>
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
              <Button variant="outline" size="sm">Mark Reviewed</Button>
            </div>
          )}
        </motion.div>
      ))}
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
