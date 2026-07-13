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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Plus,
  Save,
  Send,
  Clock,
  Dumbbell,
  Flame,
  Layers,
  Sparkles,
  Check,
} from 'lucide-react'
import { useUIStore } from '@/lib/store'
import { useWorkoutTemplate, useWorkoutTemplates, useExerciseLibrary, useSaveWorkoutTemplate, useAssignTemplate } from '@/lib/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { WorkoutBlock, BlockType, Exercise, WorkoutTemplate } from '@/lib/types'
import { ExerciseLibraryPanel } from '@/components/workout-builder/exercise-library'
import { SortableBlock } from '@/components/workout-builder/sortable-block'
import { AssignDialog } from '@/components/workout-builder/assign-dialog'
import { BLOCK_TYPES, BLOCK_ICONS } from '@/components/workout-builder/constants'

export function WorkoutBuilder() {
  const builderTemplateId = useUIStore((s) => s.builderTemplateId)
  const draftBlocks = useUIStore((s) => s.builderDraftBlocks)
  const title = useUIStore((s) => s.builderTitle)
  const category = useUIStore((s) => s.builderCategory)
  const setTitle = useUIStore((s) => s.setBuilderTitle)
  const setCategory = useUIStore((s) => s.setBuilderCategory)
  const setBuilder = useUIStore((s) => s.setBuilder)
  const addBlock = useUIStore((s) => s.addBlock)
  const moveBlock = useUIStore((s) => s.moveBlock)
  const removeBlock = useUIStore((s) => s.removeBlock)
  const updateBlock = useUIStore((s) => s.updateBlock)

  // Load the template being edited (if any)
  const { data: activeTemplate } = useWorkoutTemplate(builderTemplateId)

  // When the active template arrives, hydrate the draft
  React.useEffect(() => {
    if (activeTemplate && draftBlocks.length === 0) {
      activeTemplate.blocks.forEach((b) => {
        addBlock({ ...b, id: `draft-${b.id}-${Date.now()}` })
      })
      setTitle(activeTemplate.title)
      setCategory(activeTemplate.category)
    }
  }, [activeTemplate])

  const saveMutation = useSaveWorkoutTemplate()
  const [showTemplates, setShowTemplates] = React.useState(false)
  const [showAssign, setShowAssign] = React.useState(false)
  const [saveFlash, setSaveFlash] = React.useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

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
    saveMutation.mutate(
      {
        id: builderTemplateId ?? undefined,
        title,
        category,
        duration: 60,
        blocks: draftBlocks.map((b, bi) => ({
          blockType: b.block_type,
          sortOrder: bi,
          notes: b.notes ?? null,
          exercises: b.exercises.map((e, ei) => ({
            name: e.name,
            muscleGroup: e.muscle_group,
            equipment: e.equipment,
            hasVideoDemo: e.video_demo_placeholder,
            sets: e.sets,
            reps: e.reps,
            tempo: e.tempo,
            restSeconds: e.rest_seconds,
            rpe: e.rpe,
            notes: e.notes ?? null,
            sortOrder: ei,
          })),
        })),
      },
      {
        onSuccess: () => {
          setSaveFlash(true)
          setTimeout(() => setSaveFlash(false), 1800)
        },
      },
    )
  }

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIdx = draftBlocks.findIndex((b) => b.id === active.id)
    const newIdx = draftBlocks.findIndex((b) => b.id === over.id)
    if (oldIdx < 0 || newIdx < 0) return
    moveBlock(oldIdx, newIdx)
  }

  const totalSets = draftBlocks.reduce((acc, b) => acc + b.exercises.reduce((a, e) => a + e.sets, 0), 0)
  const totalExercises = draftBlocks.reduce((acc, b) => acc + b.exercises.length, 0)
  const estimatedDuration = Math.round((totalSets * 2 + draftBlocks.length * 5) / 1)

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
              <Clock className="w-3 h-3" />~{estimatedDuration || 60} min
            </span>
            <span className="text-xs text-muted-foreground">{totalSets} sets</span>
            <span className="text-xs text-muted-foreground">{totalExercises} exercises</span>
            <span className="text-xs text-muted-foreground">{draftBlocks.length} blocks</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowTemplates(true)} className="gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Templates
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="gap-1.5"
          >
            {saveFlash ? <Check className="w-3.5 h-3.5 text-success" /> : <Save className="w-3.5 h-3.5" />}
            {saveFlash ? 'Saved' : 'Save'}
          </Button>
          <Button size="sm" onClick={() => setShowAssign(true)} className="gap-1.5">
            <Send className="w-3.5 h-3.5" />
            Assign
          </Button>
        </div>
      </div>

      {/* Mobile category picker */}
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
        <ExerciseLibraryPanel onAddExercise={handleAddExercise} blocks={draftBlocks} />

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
              <Button variant="outline" size="sm" onClick={handleSave} disabled={saveMutation.isPending} className="flex-1 gap-1.5">
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
      <TemplatesDialog open={showTemplates} onOpenChange={setShowTemplates} onPick={(id) => { setBuilder(id); setShowTemplates(false) }} />

      {/* Assign dialog */}
      <AssignDialog open={showAssign} onOpenChange={setShowAssign} />
    </div>
  )
}

function TemplatesDialog({
  open,
  onOpenChange,
  onPick,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onPick: (id: string) => void
}) {
  const { data: templates = [] } = useWorkoutTemplates()
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Workout Templates</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
          {templates.map((t: WorkoutTemplate) => (
            <button
              key={t.id}
              onClick={() => onPick(t.id)}
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
  )
}
