'use client'

import { X, Video } from 'lucide-react'
import type { Exercise } from '@/lib/types'

export function ExerciseEditor({
  exercise,
  index,
  onChange,
  onRemove,
}: {
  exercise: Exercise
  index: number
  onChange: (patch: Partial<Exercise>) => void
  onRemove: () => void
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-card p-2.5 lg:p-3">
      <div className="flex items-start gap-2 mb-2.5">
        <span className="text-[10px] font-semibold text-muted-foreground bg-muted rounded w-4 h-4 flex items-center justify-center shrink-0 mt-0.5">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-foreground truncate">{exercise.name}</span>
            <Video className="w-3 h-3 text-muted-foreground/60 shrink-0" />
          </div>
          <div className="text-[10px] text-muted-foreground">{exercise.muscle_group} · {exercise.equipment}</div>
        </div>
        <button
          onClick={onRemove}
          className="w-6 h-6 rounded-md hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors shrink-0"
          aria-label="Remove exercise"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
        <Field label="Sets" value={exercise.sets} onChange={(v) => onChange({ sets: Number(v) })} type="number" />
        <Field label="Reps" value={exercise.reps} onChange={(v) => onChange({ reps: v })} />
        <Field label="Tempo" value={exercise.tempo} onChange={(v) => onChange({ tempo: v })} />
        <Field label="Rest" value={exercise.rest_seconds} onChange={(v) => onChange({ rest_seconds: Number(v) })} type="number" suffix="s" />
        <Field label="RPE" value={exercise.rpe} onChange={(v) => onChange({ rpe: Number(v) })} type="number" />
      </div>
      {exercise.notes && (
        <div className="mt-2 text-[10px] text-muted-foreground bg-muted/30 rounded px-2 py-1 italic">
          {exercise.notes}
        </div>
      )}
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  suffix,
}: {
  label: string
  value: string | number
  onChange: (v: string) => void
  type?: string
  suffix?: string
}) {
  return (
    <div>
      <label className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground/80 block mb-0.5">
        {label}{suffix ? <span className="text-muted-foreground/60 normal-case font-normal ml-0.5">({suffix})</span> : null}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-8 px-2 text-xs font-medium rounded-md bg-muted/50 border border-transparent focus:border-border focus:bg-card outline-none tabular-nums"
      />
    </div>
  )
}
