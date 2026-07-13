'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Trophy, Dumbbell, Clock, TrendingUp, ChevronRight } from 'lucide-react'
import { useClientPRs, useClientWorkoutLogs } from '@/lib/hooks'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { format, formatDistanceToNow } from 'date-fns'
import type { Tab } from './app'

export function ClientProgress({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  const { data: prs = [], isLoading: prsLoading } = useClientPRs()
  const { data: logs = [], isLoading: logsLoading } = useClientWorkoutLogs()

  return (
    <div className="px-4 py-5 pb-8">
      <h1 className="text-display text-xl text-foreground mb-4">Progress</h1>

      {/* PRs section */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <div className="flex items-center gap-2 mb-3 px-1">
          <Trophy className="w-4 h-4 text-primary" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Personal Records</h2>
        </div>
        {prsLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : prs.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-border/60 p-6 text-center">
            <Trophy className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">No PRs yet</p>
            <p className="text-xs text-muted-foreground mt-1">Complete a workout with weights to track your PRs.</p>
            <button
              onClick={() => onNavigate('workout')}
              className="mt-3 text-xs text-primary font-medium"
            >
              Start a workout →
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Group PRs by exercise */}
            {Object.entries(
              prs.reduce((acc, pr) => {
                if (!acc[pr.exercise_name]) acc[pr.exercise_name] = []
                acc[pr.exercise_name].push(pr)
                return acc
              }, {} as Record<string, typeof prs>)
            ).map(([exercise, exercisePRs]) => {
              const best1RM = Math.max(...exercisePRs.map((p) => p.estimated_1rm))
              return (
                <div key={exercise} className="rounded-xl bg-card border border-border/60 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                        <Dumbbell className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-foreground truncate">{exercise}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold tabular-nums text-primary">{best1RM.toFixed(1)}kg</div>
                      <div className="text-[9px] text-muted-foreground">est. 1RM</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {exercisePRs.map((pr) => (
                      <div key={pr.id} className="flex items-center gap-1 bg-muted/40 rounded-md px-2 py-1">
                        <span className="text-[11px] font-semibold tabular-nums text-foreground">{pr.weight}kg</span>
                        <span className="text-[10px] text-muted-foreground">× {pr.reps}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* Workout history */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-3 px-1">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Workout History</h2>
        </div>
        {logsLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-border/60 p-6 text-center">
            <Clock className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">No workouts logged yet</p>
            <p className="text-xs text-muted-foreground mt-1">Complete your first workout to see it here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {logs.slice(0, 15).map((log) => (
              <div key={log.id} className="rounded-xl bg-card border border-border/60 p-3">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{log.title}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {format(new Date(log.completed_at), 'EEE, MMM d · p')}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[11px] font-medium text-foreground tabular-nums">{log.duration_min}min</div>
                    <div className="text-[10px] text-muted-foreground tabular-nums">{log.total_sets} sets</div>
                  </div>
                </div>
                {log.estimated_volume > 0 && (
                  <div className="flex items-center gap-1 mt-1.5">
                    <TrendingUp className="w-3 h-3 text-success" />
                    <span className="text-[11px] text-muted-foreground">
                      {Math.round(log.estimated_volume).toLocaleString()}kg total volume
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
