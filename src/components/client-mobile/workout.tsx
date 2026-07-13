'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  Pause,
  Check,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  Video,
  Clock,
  CheckCircle2,
  ArrowLeft,
  Timer,
  RotateCcw,
} from 'lucide-react'
import { useClientWorkouts, useLogWorkout } from '@/lib/hooks'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { WorkoutTemplate, Exercise } from '@/lib/types'

type Tab = 'home' | 'workout' | 'check-in' | 'messages'

export function ClientWorkout({
  templateId,
  onClearActive,
  onNavigate,
}: {
  templateId: string | null
  onClearActive: () => void
  onNavigate: (tab: Tab) => void
}) {
  const { data: workouts = [], isLoading } = useClientWorkouts()
  const logWorkout = useLogWorkout()

  // If a templateId is active, show the logger; otherwise show the list
  if (templateId) {
    const workout = workouts.find((w) => w.id === templateId)
    if (workout) {
      return <WorkoutLogger workout={workout} onBack={onClearActive} onComplete={() => { onClearActive(); onNavigate('home') }} logWorkout={logWorkout} />
    }
  }

  if (isLoading) {
    return (
      <div className="px-4 py-5">
        <Skeleton className="h-8 w-40 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-5">
      <h1 className="text-display text-xl text-foreground mb-4">Your Workouts</h1>
      {workouts.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border/60 p-8 text-center">
          <Dumbbell className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm font-medium text-foreground">No workouts assigned</p>
          <p className="text-xs text-muted-foreground mt-1">Your coach hasn't assigned any workouts yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {workouts.map((w, i) => (
            <WorkoutCard key={w.id} workout={w} index={i} onStart={() => { /* parent handles via templateId */ }} />
          ))}
        </div>
      )}
    </div>
  )
}

function WorkoutCard({ workout, index, onStart }: { workout: WorkoutTemplate; index: number; onStart: () => void }) {
  const totalExercises = workout.blocks.reduce((a, b) => a + b.exercises.length, 0)
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.25 }}
      className="rounded-xl bg-card border border-border/60 p-4"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-foreground">{workout.title}</h3>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{workout.duration} min</span>
            <span>·</span>
            <span>{workout.blocks.length} blocks</span>
            <span>·</span>
            <span>{totalExercises} exercises</span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-3">
        {workout.blocks.map((b, i) => (
          <span key={b.id} className="text-[10px] text-foreground/80 bg-muted rounded px-1.5 py-0.5 capitalize">
            {i + 1}. {b.block_type}
          </span>
        ))}
      </div>
    </motion.div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Workout Logger — the actual session UI
// ────────────────────────────────────────────────────────────────────────────
function WorkoutLogger({
  workout,
  onBack,
  onComplete,
  logWorkout,
}: {
  workout: WorkoutTemplate
  onBack: () => void
  onComplete: () => void
  logWorkout: ReturnType<typeof useLogWorkout>
}) {
  const [activeBlockIdx, setActiveBlockIdx] = React.useState(0)
  const [completedSets, setCompletedSets] = React.useState<Record<string, boolean[]>>({})
  const [restTimer, setRestTimer] = React.useState<{ seconds: number; remaining: number } | null>(null)
  const [showComplete, setShowComplete] = React.useState(false)

  // Flatten all exercises for progress tracking
  const allExercises = workout.blocks.flatMap((b) => b.exercises)
  const totalSets = allExercises.reduce((a, e) => a + e.sets, 0)
  const completedCount = Object.values(completedSets).reduce((a, sets) => a + sets.filter(Boolean).length, 0)
  const progress = totalSets > 0 ? Math.round((completedCount / totalSets) * 100) : 0

  // Rest timer countdown
  React.useEffect(() => {
    if (!restTimer) return
    if (restTimer.remaining <= 0) {
      setRestTimer(null)
      return
    }
    const id = setTimeout(() => {
      setRestTimer((t) => (t ? { ...t, remaining: t.remaining - 1 } : null))
    }, 1000)
    return () => clearTimeout(id)
  }, [restTimer])

  const toggleSet = (exerciseId: string, setIdx: number, restSeconds: number) => {
    setCompletedSets((prev) => {
      const sets = prev[exerciseId] ? [...prev[exerciseId]] : []
      sets[setIdx] = !sets[setIdx]
      return { ...prev, [exerciseId]: sets }
    })
    // Start rest timer when completing a set
    const wasCompleted = completedSets[exerciseId]?.[setIdx]
    if (!wasCompleted && restSeconds > 0) {
      setRestTimer({ seconds: restSeconds, remaining: restSeconds })
    }
  }

  const handleComplete = () => {
    logWorkout.mutate(
      { workoutTemplateId: workout.id, durationMin: workout.duration },
      { onSuccess: () => { setShowComplete(true); setTimeout(onComplete, 1800) } },
    )
  }

  if (showComplete) {
    return (
      <div className="px-4 py-5 flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="w-20 h-20 rounded-2xl bg-success/10 flex items-center justify-center mb-4"
        >
          <CheckCircle2 className="w-10 h-10 text-success" strokeWidth={2.5} />
        </motion.div>
        <h2 className="text-display text-xl text-foreground mb-1">Workout complete!</h2>
        <p className="text-sm text-muted-foreground">Great work. Your coach has been notified.</p>
      </div>
    )
  }

  return (
    <div className="px-4 py-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="w-9 h-9 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground tap-smooth">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold text-foreground truncate">{workout.title}</h1>
          <p className="text-[11px] text-muted-foreground">{completedCount}/{totalSets} sets · {progress}%</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-muted overflow-hidden mb-5">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Rest timer overlay */}
      <AnimatePresence>
        {restTimer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 max-w-[480px] w-full px-4"
          >
            <div className="bg-primary text-primary-foreground rounded-2xl p-4 shadow-lg flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Timer className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="text-[11px] uppercase tracking-wider font-semibold opacity-90">Rest</div>
                <div className="text-2xl font-bold tabular-nums">{restTimer.remaining}s</div>
              </div>
              <button
                onClick={() => setRestTimer(null)}
                className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center tap-smooth"
                aria-label="Skip rest"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Blocks */}
      <div className="space-y-4">
        {workout.blocks.map((block, bi) => (
          <div key={block.id}>
            <div className="flex items-center gap-2 mb-2 px-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded-md">
                {block.block_type}
              </span>
              <span className="text-[10px] text-muted-foreground">{block.exercises.length} exercises</span>
            </div>
            <div className="space-y-2">
              {block.exercises.map((ex) => (
                <ExerciseLogger
                  key={ex.id}
                  exercise={ex}
                  completedSets={completedSets[ex.id] ?? []}
                  onToggleSet={(setIdx) => toggleSet(ex.id, setIdx, ex.rest_seconds)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Complete button */}
      <div className="mt-6 sticky bottom-20">
        <Button
          onClick={handleComplete}
          disabled={logWorkout.isPending || completedCount === 0}
          className="w-full h-12 gap-2 text-base font-semibold rounded-xl"
        >
          {logWorkout.isPending ? (
            <>
              <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              Logging...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Complete Workout
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

function ExerciseLogger({
  exercise,
  completedSets,
  onToggleSet,
}: {
  exercise: Exercise
  completedSets: boolean[]
  onToggleSet: (setIdx: number) => void
}) {
  const [expanded, setExpanded] = React.useState(true)

  return (
    <div className="rounded-xl bg-card border border-border/60 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-3 text-left tap-smooth"
      >
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
          <Dumbbell className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-foreground truncate">{exercise.name}</div>
          <div className="text-[11px] text-muted-foreground">
            {exercise.sets} × {exercise.reps} · {exercise.rest_seconds}s rest · RPE {exercise.rpe}
          </div>
        </div>
        {exercise.video_demo_placeholder && (
          <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center shrink-0">
            <Video className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
        )}
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border/60"
          >
            <div className="p-3 space-y-2">
              {/* Set checklist */}
              <div className="space-y-1.5">
                {Array.from({ length: exercise.sets }).map((_, setIdx) => {
                  const done = completedSets[setIdx]
                  return (
                    <button
                      key={setIdx}
                      onClick={() => onToggleSet(setIdx)}
                      className={cn(
                        'w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all tap-smooth min-h-[44px]',
                        done
                          ? 'bg-success/10 border-success/30'
                          : 'bg-muted/40 border-border/60 hover:border-border',
                      )}
                    >
                      <div
                        className={cn(
                          'w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors',
                          done ? 'bg-success text-white' : 'bg-muted border border-border',
                        )}
                      >
                        {done && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                      </div>
                      <div className="flex-1 text-left">
                        <span className="text-sm font-medium text-foreground">Set {setIdx + 1}</span>
                        <span className="text-[11px] text-muted-foreground ml-2">{exercise.reps} reps · {exercise.tempo}</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground">{exercise.rest_seconds}s</span>
                    </button>
                  )
                })}
              </div>
              {exercise.notes && (
                <div className="text-[11px] text-muted-foreground bg-muted/30 rounded-md px-2.5 py-1.5 italic">
                  {exercise.notes}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
