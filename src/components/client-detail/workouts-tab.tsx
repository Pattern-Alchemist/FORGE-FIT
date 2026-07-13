'use client'

import { Dumbbell, Plus, Pencil, Clock, ChevronRight } from 'lucide-react'
import { useWorkoutTemplates, useClientProgram } from '@/lib/hooks'
import { useUIStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/shared'
import { Skeleton } from '@/components/ui/skeleton'

export function ClientWorkoutsTab({ clientId }: { clientId: string }) {
  const { data: program } = useClientProgram(clientId)
  const { data: allTemplates = [], isLoading } = useWorkoutTemplates()
  const setScreen = useUIStore((s) => s.setScreen)
  const setBuilder = useUIStore((s) => s.setBuilder)

  const assignedTemplates = program
    ? allTemplates.filter((t) => program.workout_template_ids.includes(t.id))
    : []

  if (isLoading) {
    return (
      <div className="card-premium rounded-xl p-5">
        <Skeleton className="h-5 w-40 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    )
  }

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
