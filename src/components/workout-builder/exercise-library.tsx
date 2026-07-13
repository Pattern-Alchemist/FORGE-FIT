'use client'

import * as React from 'react'
import { Search, Dumbbell, ChevronDown, ChevronUp, Plus } from 'lucide-react'
import { useExerciseLibrary } from '@/lib/hooks'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { Exercise, WorkoutBlock } from '@/lib/types'

export function ExerciseLibraryPanel({
  blocks,
  onAddExercise,
}: {
  blocks: WorkoutBlock[]
  onAddExercise: (blockId: string, ex: Exercise) => void
}) {
  const { data: exercises = [], isLoading } = useExerciseLibrary()
  const [search, setSearch] = React.useState('')
  const [muscleFilter, setMuscleFilter] = React.useState<string | null>(null)

  const muscleGroups = Array.from(new Set(exercises.map((e) => e.muscle_group)))

  const filtered = exercises.filter((e) => {
    if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false
    if (muscleFilter && e.muscle_group !== muscleFilter) return false
    return true
  })

  return (
    <div className="card-premium rounded-xl p-4 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:flex lg:flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">Exercise Library</h3>
        <Badge variant="outline" className="text-[10px]">{filtered.length}</Badge>
      </div>
      <div className="relative mb-3">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search exercises…"
          className="pl-8 h-9 text-xs bg-muted/50 border-transparent focus:border-border"
        />
      </div>
      <div className="flex gap-1 mb-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setMuscleFilter(null)}
          className={cn(
            'shrink-0 px-2 py-0.5 rounded text-[10px] font-medium transition-colors',
            !muscleFilter ? 'bg-primary text-primary-foreground' : 'bg-muted/60 text-muted-foreground',
          )}
        >
          All
        </button>
        {muscleGroups.slice(0, 6).map((m) => (
          <button
            key={m}
            onClick={() => setMuscleFilter(m)}
            className={cn(
              'shrink-0 px-2 py-0.5 rounded text-[10px] font-medium transition-colors truncate max-w-[100px]',
              muscleFilter === m ? 'bg-primary text-primary-foreground' : 'bg-muted/60 text-muted-foreground',
            )}
          >
            {m}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto -mr-2 pr-2 space-y-1.5 min-h-[200px] lg:min-h-0">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)
        ) : (
          filtered.map((ex) => (
            <ExerciseCard key={ex.id} exercise={ex} blocks={blocks} onAdd={onAddExercise} />
          ))
        )}
      </div>
    </div>
  )
}

function ExerciseCard({
  exercise,
  blocks,
  onAdd,
}: {
  exercise: Exercise
  blocks: WorkoutBlock[]
  onAdd: (blockId: string, ex: Exercise) => void
}) {
  const [open, setOpen] = React.useState(false)
  return (
    <div className="rounded-lg border border-border/60 bg-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 p-2.5 text-left hover:bg-muted/40 transition-colors tap-smooth"
      >
        <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center shrink-0">
          <Dumbbell className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-foreground truncate">{exercise.name}</div>
          <div className="text-[10px] text-muted-foreground truncate">{exercise.muscle_group}</div>
        </div>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border/60"
          >
            <div className="p-2.5 space-y-2">
              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                <div className="bg-muted/40 rounded px-1.5 py-1">
                  <span className="text-muted-foreground">Equipment:</span> <span className="text-foreground font-medium">{exercise.equipment}</span>
                </div>
                <div className="bg-muted/40 rounded px-1.5 py-1">
                  <span className="text-muted-foreground">Default:</span> <span className="text-foreground font-medium">{exercise.sets}×{exercise.reps}</span>
                </div>
                <div className="bg-muted/40 rounded px-1.5 py-1">
                  <span className="text-muted-foreground">Tempo:</span> <span className="text-foreground font-medium">{exercise.tempo}</span>
                </div>
                <div className="bg-muted/40 rounded px-1.5 py-1">
                  <span className="text-muted-foreground">Rest:</span> <span className="text-foreground font-medium">{exercise.rest_seconds}s</span>
                </div>
              </div>
              {blocks.length === 0 ? (
                <p className="text-[10px] text-muted-foreground text-center py-1">Add a block first</p>
              ) : (
                <div className="space-y-1">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold px-1">Add to:</div>
                  {blocks.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        onAdd(b.id, exercise)
                        setOpen(false)
                      }}
                      className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-muted/40 hover:bg-primary/10 hover:text-primary text-[11px] font-medium text-foreground transition-colors tap-smooth"
                    >
                      <Plus className="w-3 h-3" />
                      <span className="capitalize">{b.block_type}</span>
                      <span className="text-muted-foreground ml-auto">{b.exercises.length} ex</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
