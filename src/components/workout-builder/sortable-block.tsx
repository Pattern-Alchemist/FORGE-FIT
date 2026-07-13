'use client'

import * as React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion, AnimatePresence } from 'framer-motion'
import { GripVertical, Trash2, ChevronDown, ChevronUp, Plus, Dumbbell, X, Video } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WorkoutBlock, Exercise } from '@/lib/types'
import { BLOCK_TYPES, BLOCK_ICONS } from './constants'
import { ExerciseEditor } from './exercise-editor'

export function SortableBlock({
  block,
  index,
  onRemove,
  onUpdate,
}: {
  block: WorkoutBlock
  index: number
  onRemove: () => void
  onUpdate: (patch: Partial<WorkoutBlock>) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id })
  const [expanded, setExpanded] = React.useState(true)
  const [showNotes, setShowNotes] = React.useState(!!block.notes)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const btConfig = BLOCK_TYPES.find((bt) => bt.type === block.block_type)!
  const totalSets = block.exercises.reduce((a, e) => a + e.sets, 0)

  const updateExercise = (exId: string, patch: Partial<Exercise>) => {
    onUpdate({
      exercises: block.exercises.map((e) => (e.id === exId ? { ...e, ...patch } : e)),
    })
  }

  const removeExercise = (exId: string) => {
    onUpdate({ exercises: block.exercises.filter((e) => e.id !== exId) })
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={cn(
        'rounded-xl border bg-card overflow-hidden',
        isDragging ? 'shadow-lg border-primary/40' : 'border-border/60 shadow-[var(--shadow-sm)]',
      )}
    >
      <div className="flex items-center gap-2 p-3 border-b border-border/60 bg-muted/20">
        <button
          {...attributes}
          {...listeners}
          className="touch-none cursor-grab active:cursor-grabbing p-1 -m-1 text-muted-foreground hover:text-foreground"
          aria-label="Drag block"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <div className={cn('inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-[11px] font-semibold', btConfig.color)}>
          <span>{BLOCK_ICONS[block.block_type]}</span>
          <span className="capitalize">{block.block_type}</span>
        </div>
        <span className="text-[11px] text-muted-foreground">
          {block.exercises.length} {block.exercises.length === 1 ? 'exercise' : 'exercises'} · {totalSets} sets
        </span>
        <div className="ml-auto flex items-center gap-0.5">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-7 h-7 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onRemove}
            className="w-7 h-7 rounded-md hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
            aria-label="Remove block"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-3 space-y-2">
              {block.exercises.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-border/40 rounded-lg">
                  <Dumbbell className="w-5 h-5 text-muted-foreground/60 mx-auto mb-2" />
                  <p className="text-[11px] text-muted-foreground">Add exercises from the library</p>
                </div>
              ) : (
                block.exercises.map((ex, i) => (
                  <ExerciseEditor
                    key={ex.id}
                    exercise={ex}
                    index={i}
                    onChange={(patch) => updateExercise(ex.id, patch)}
                    onRemove={() => removeExercise(ex.id)}
                  />
                ))
              )}
              {showNotes ? (
                <textarea
                  value={block.notes || ''}
                  onChange={(e) => onUpdate({ notes: e.target.value })}
                  placeholder="Block notes (e.g. focus cues, rest between exercises)…"
                  className="w-full text-xs p-2.5 rounded-lg bg-muted/30 border border-transparent focus:border-border outline-none resize-none"
                  rows={2}
                />
              ) : (
                <button
                  onClick={() => setShowNotes(true)}
                  className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1 px-2 py-1"
                >
                  <Plus className="w-3 h-3" />
                  Add block notes
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
