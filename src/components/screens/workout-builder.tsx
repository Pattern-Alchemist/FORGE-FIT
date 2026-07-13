'use client'

import * as React from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Plus,
  Save,
  Send,
  GripVertical,
  Trash2,
  ChevronDown,
  ChevronUp,
  Copy,
  Clock,
  Dumbbell,
  Flame,
  Layers,
  Video,
  X,
  Check,
  Filter,
  Sparkles,
} from 'lucide-react'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { WorkoutBlock, BlockType, Exercise } from '@/lib/types'

const BLOCK_TYPES: { type: BlockType; label: string; color: string }[] = [
  { type: 'warmup', label: 'Warm-up', color: 'bg-chart-4/15 text-chart-4 border-chart-4/20' },
  { type: 'strength', label: 'Strength', color: 'bg-primary/15 text-primary border-primary/20' },
  { type: 'accessory', label: 'Accessory', color: 'bg-chart-2/15 text-chart-2 border-chart-2/20' },
  { type: 'conditioning', label: 'Conditioning', color: 'bg-chart-5/15 text-chart-5 border-chart-5/20' },
  { type: 'cooldown', label: 'Cooldown', color: 'bg-chart-3/15 text-chart-3 border-chart-3/20' },
]

const BLOCK_ICONS: Record<BlockType, string> = {
  warmup: '🔥',
  strength: '💪',
  accessory: '🔩',
  conditioning: '⚡',
  cooldown: '🧘',
}

export function WorkoutBuilder() {
  const exercises = useStore((s) => s.exercises)
  const templates = useStore((s) => s.templates)
  const draftBlocks = useStore((s) => s.builderDraftBlocks)
  const title = useStore((s) => s.builderTitle)
  const category = useStore((s) => s.builderCategory)
  const setTitle = useStore((s) => s.setBuilderTitle)
  const setCategory = useStore((s) => s.setBuilderCategory)
  const addBlock = useStore((s) => s.addBlock)
  const moveBlock = useStore((s) => s.moveBlock)
  const removeBlock = useStore((s) => s.removeBlock)
  const updateBlock = useStore((s) => s.updateBlock)
  const saveTemplate = useStore((s) => s.saveTemplate)
  const setBuilder = useStore((s) => s.setBuilder)

  const [search, setSearch] = React.useState('')
  const [muscleFilter, setMuscleFilter] = React.useState<string | null>(null)
  const [showTemplates, setShowTemplates] = React.useState(false)
  const [showAssign, setShowAssign] = React.useState(false)
  const [saveFlash, setSaveFlash] = React.useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const muscleGroups = Array.from(new Set(exercises.map((e) => e.muscle_group)))

  const filteredExercises = exercises.filter((e) => {
    if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false
    if (muscleFilter && e.muscle_group !== muscleFilter) return false
    return true
  })

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over) return
    const oldIdx = draftBlocks.findIndex((b) => b.id === active.id)
    const newIdx = draftBlocks.findIndex((b) => b.id === over.id)
    if (oldIdx < 0 || newIdx < 0) return
    moveBlock(oldIdx, newIdx)
  }

  const handleAddBlock = (type: BlockType) => {
    const block: WorkoutBlock = {
      id: `b-${Date.now()}`,
      block_type: type,
      exercises: [],
    }
    addBlock(block)
  }

  const handleAddExercise = (blockId: string, ex: Exercise) => {
    const block = draftBlocks.find((b) => b.id === blockId)
    if (!block) return
    updateBlock(blockId, { exercises: [...block.exercises, { ...ex, id: `${ex.id}-${Date.now()}` }] })
  }

  const handleSave = () => {
    saveTemplate()
    setSaveFlash(true)
    setTimeout(() => setSaveFlash(false), 1800)
  }

  const totalDuration = draftBlocks.reduce((acc, b) => acc + b.exercises.reduce((a, e) => a + e.sets * (e.rest_seconds + 60), 0), 0)
  const totalSets = draftBlocks.reduce((acc, b) => acc + b.exercises.reduce((a, e) => a + e.sets, 0), 0)
  const totalExercises = draftBlocks.reduce((acc, b) => acc + b.exercises.length, 0)

  return (
    <div className="px-4 lg:px-8 py-6 lg:py-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium mb-1">
            <Dumbbell className="w-3.5 h-3.5" />
            <span>Workout Builder</span>
          </div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-display text-2xl lg:text-[28px] text-foreground bg-transparent border-none outline-none w-full focus:bg-muted/30 rounded-lg px-1 -mx-1 transition-colors"
            placeholder="Untitled Workout"
          />
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary text-[11px]">
              <Layers className="w-3 h-3 mr-1" />
              {category}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />~{Math.round(totalDuration / 60)} min
            </span>
            <span className="text-xs text-muted-foreground">{totalSets} sets</span>
            <span className="text-xs text-muted-foreground">{totalExercises} exercises</span>
            <span className="text-xs text-muted-foreground">{draftBlocks.length} blocks</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTemplates(true)}
            className="gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Templates
          </Button>
          <Button variant="outline" size="sm" onClick={handleSave} className="gap-1.5">
            {saveFlash ? <Check className="w-3.5 h-3.5 text-success" /> : <Save className="w-3.5 h-3.5" />}
            {saveFlash ? 'Saved' : 'Save'}
          </Button>
          <Button size="sm" onClick={() => setShowAssign(true)} className="gap-1.5">
            <Send className="w-3.5 h-3.5" />
            Assign
          </Button>
        </div>
      </div>

      {/* Mobile category + template picker */}
      <div className="lg:hidden mb-4 flex items-center gap-2">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-9 px-3 text-xs rounded-lg bg-muted/60 border border-transparent focus:border-border outline-none"
        >
          {['Strength', 'Hypertrophy', 'Conditioning', 'Mobility', 'Full Body'].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 lg:gap-6">
        {/* Left: Exercise Library */}
        <div className="card-premium rounded-xl p-4 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:flex lg:flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Exercise Library</h3>
            <Badge variant="outline" className="text-[10px]">{filteredExercises.length}</Badge>
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
            {filteredExercises.map((ex) => (
              <ExerciseCard key={ex.id} exercise={ex} blocks={draftBlocks} onAdd={handleAddExercise} />
            ))}
          </div>
        </div>

        {/* Right: Workout canvas */}
        <div>
          {/* Add block row */}
          <div className="flex items-center gap-2 mb-4 overflow-x-auto scrollbar-none pb-1">
            <span className="text-xs font-medium text-muted-foreground shrink-0">Add block:</span>
            {BLOCK_TYPES.map((bt) => (
              <button
                key={bt.type}
                onClick={() => handleAddBlock(bt.type)}
                className={cn(
                  'shrink-0 inline-flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-medium border transition-colors tap-smooth',
                  bt.color,
                )}
              >
                <Plus className="w-3 h-3" strokeWidth={2.5} />
                {bt.label}
              </button>
            ))}
          </div>

          {/* Empty state */}
          {draftBlocks.length === 0 ? (
            <div className="card-premium rounded-xl border-2 border-dashed border-border/60 p-12">
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <Layers className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">Start building</h3>
                <p className="text-xs text-muted-foreground max-w-xs mb-5">
                  Add a warm-up, strength block, or any structure above. Then drag exercises from the library on the left.
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleAddBlock('warmup')} className="gap-1.5">
                    <Plus className="w-3.5 h-3.5" /> Warm-up
                  </Button>
                  <Button size="sm" onClick={() => handleAddBlock('strength')} className="gap-1.5">
                    <Plus className="w-3.5 h-3.5" /> Strength Block
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={draftBlocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  <AnimatePresence>
                    {draftBlocks.map((block, idx) => (
                      <SortableBlock
                        key={block.id}
                        block={block}
                        index={idx}
                        onRemove={() => removeBlock(block.id)}
                        onUpdate={(patch) => updateBlock(block.id, patch)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </SortableContext>
            </DndContext>
          )}

          {/* Bottom save bar (mobile) */}
          {draftBlocks.length > 0 && (
            <div className="lg:hidden sticky bottom-20 mt-6 -mx-4 px-4 py-3 bg-background/95 backdrop-blur-xl border-t border-border/60 flex gap-2">
              <Button variant="outline" size="sm" onClick={handleSave} className="flex-1 gap-1.5">
                {saveFlash ? <Check className="w-3.5 h-3.5 text-success" /> : <Save className="w-3.5 h-3.5" />}
                {saveFlash ? 'Saved' : 'Save Template'}
              </Button>
              <Button size="sm" onClick={() => setShowAssign(true)} className="flex-1 gap-1.5">
                <Send className="w-3.5 h-3.5" />
                Assign
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Templates dialog */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Workout Templates</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setBuilder(t.id)
                  setShowTemplates(false)
                }}
                className="text-left p-4 rounded-lg border border-border/60 hover:border-primary/30 hover:bg-muted/30 transition-all tap-smooth"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="w-3.5 h-3.5 text-primary" />
                  <span className="text-sm font-semibold text-foreground">{t.title}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span>{t.category}</span>
                  <span>·</span>
                  <span>{t.duration} min</span>
                  <span>·</span>
                  <span>{t.blocks.length} blocks</span>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign dialog */}
      <AssignDialog open={showAssign} onOpenChange={setShowAssign} />
    </div>
  )
}

// ---------- Exercise Card ----------
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

// ---------- Sortable Block ----------
function SortableBlock({
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
      {/* Block header */}
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
              {/* Block notes */}
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

// ---------- Exercise Editor (within block) ----------
function ExerciseEditor({
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

// ---------- Assign Dialog ----------
function AssignDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const clients = useStore((s) => s.clients)
  const [selected, setSelected] = React.useState<string[]>([])
  const [assigned, setAssigned] = React.useState(false)

  const toggle = (id: string) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  }

  const handleAssign = () => {
    setAssigned(true)
    setTimeout(() => {
      setAssigned(false)
      onOpenChange(false)
      setSelected([])
    }, 1500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign to Clients</DialogTitle>
        </DialogHeader>
        {assigned ? (
          <div className="flex flex-col items-center py-8">
            <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center mb-4">
              <Check className="w-7 h-7 text-success" strokeWidth={2.5} />
            </div>
            <p className="text-sm font-semibold text-foreground">Workout assigned</p>
            <p className="text-xs text-muted-foreground mt-1">Sent to {selected.length} clients</p>
          </div>
        ) : (
          <>
            <div className="space-y-1.5 max-h-[50vh] overflow-y-auto">
              {clients.map((c) => (
                <button
                  key={c.id}
                  onClick={() => toggle(c.id)}
                  className={cn(
                    'w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all tap-smooth',
                    selected.includes(c.id)
                      ? 'border-primary/30 bg-primary/5'
                      : 'border-border/60 hover:bg-muted/40',
                  )}
                >
                  <Avatar className="w-8 h-8 rounded-lg shrink-0">
                    <AvatarFallback className="bg-muted text-foreground text-[11px] font-semibold rounded-lg">
                      {c.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left min-w-0">
                    <div className="text-xs font-medium text-foreground truncate">{c.full_name}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{c.goal} · {c.training_phase}</div>
                  </div>
                  <div
                    className={cn(
                      'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors',
                      selected.includes(c.id) ? 'bg-primary border-primary' : 'border-border',
                    )}
                  >
                    {selected.includes(c.id) && <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button className="flex-1 gap-1.5" disabled={selected.length === 0} onClick={handleAssign}>
                <Send className="w-3.5 h-3.5" />
                Assign to {selected.length || ''}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
