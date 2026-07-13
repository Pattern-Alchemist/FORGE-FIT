/**
 * Forge — Zod validation schemas
 *
 * Shared between client forms and server actions. Single source of truth for
 * entity shapes, validation rules, and TS types.
 *
 * Usage:
 *   import { clientSchema, clientSchemaInput } from '@/lib/schemas'
 *   const parsed = clientSchema.parse(input)        // strict, full shape
 *   const parsed = clientSchemaInput.parse(input)   // create-time, omits id/timestamps
 */
import { z } from 'zod'

// ────────────────────────────────────────────────────────────────────────────
// Enums (as strings — portable to Postgres enums later)
// ────────────────────────────────────────────────────────────────────────────
export const goalSchema = z.enum([
  'Hypertrophy',
  'Fat Loss',
  'Strength',
  'General Fitness',
  'Athletic Performance',
  'Recomposition',
])
export type Goal = z.infer<typeof goalSchema>

export const trainingPhaseSchema = z.enum([
  'Foundation',
  'Volume Block',
  'Intensity Block',
  'Peaking',
  'Deload',
  'Maintenance',
])
export type TrainingPhase = z.infer<typeof trainingPhaseSchema>

export const clientStatusSchema = z.enum(['active', 'paused', 'completed'])
export type ClientStatus = z.infer<typeof clientStatusSchema>

export const blockTypeSchema = z.enum([
  'warmup',
  'strength',
  'accessory',
  'conditioning',
  'cooldown',
])
export type BlockType = z.infer<typeof blockTypeSchema>

export const senderTypeSchema = z.enum(['coach', 'client'])
export type SenderType = z.infer<typeof senderTypeSchema>

export const savedReplyCategorySchema = z.enum([
  'check_in',
  'motivation',
  'form',
  'logistics',
])
export type SavedReplyCategory = z.infer<typeof savedReplyCategorySchema>

export const taskTypeSchema = z.enum([
  'review_check_in',
  'update_workout',
  'reply_message',
  'start_program',
])

export const taskPrioritySchema = z.enum(['high', 'medium', 'low'])

export const checkInStatusSchema = z.enum(['pending', 'reviewed'])

// ────────────────────────────────────────────────────────────────────────────
// Domain entity schemas
// ────────────────────────────────────────────────────────────────────────────
export const clientSchemaInput = z.object({
  fullName: z.string().min(1, 'Name is required').max(120),
  avatar: z.string().max(8).default(''),
  age: z.number().int().min(13).max(120),
  gender: z.enum(['M', 'F', 'NB']).default('NB'),
  goal: goalSchema,
  trainingPhase: trainingPhaseSchema,
  status: clientStatusSchema.default('active'),
  adherenceScore: z.number().int().min(0).max(100).default(80),
  weeklyStreak: z.number().int().min(0).default(0),
  injuries: z.array(z.string()).default([]),
  coachNotes: z.string().default(''),
  tags: z.array(z.string()).default([]),
  nextActionType: taskTypeSchema.nullable().optional(),
  nextActionLabel: z.string().nullable().optional(),
  nextActionDue: z.string().nullable().optional(),
  workoutDueToday: z.boolean().default(false),
})
export type ClientInput = z.infer<typeof clientSchemaInput>

export const exerciseSchemaInput = z.object({
  name: z.string().min(1).max(120),
  muscleGroup: z.string().min(1).max(80),
  equipment: z.string().min(1).max(60),
  hasVideoDemo: z.boolean().default(false),
  sets: z.number().int().min(1).max(20),
  reps: z.string().min(1).max(20),
  tempo: z.string().min(1).max(12),
  restSeconds: z.number().int().min(0).max(600),
  rpe: z.number().int().min(1).max(10),
  notes: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0),
})
export type ExerciseInput = z.infer<typeof exerciseSchemaInput>

export const blockSchemaInput = z.object({
  blockType: blockTypeSchema,
  notes: z.string().optional().nullable(),
  exercises: z.array(exerciseSchemaInput).default([]),
  sortOrder: z.number().int().default(0),
})
export type BlockInput = z.infer<typeof blockSchemaInput>

export const workoutTemplateSchemaInput = z.object({
  title: z.string().min(1, 'Title is required').max(120),
  category: z.string().min(1).max(60),
  duration: z.number().int().min(5).max(300).default(60),
  blocks: z.array(blockSchemaInput).default([]),
})
export type WorkoutTemplateInput = z.infer<typeof workoutTemplateSchemaInput>

export const checkInSchemaInput = z.object({
  clientId: z.string().min(1),
  date: z.coerce.date(),
  bodyWeight: z.number().min(30).max(300),
  waist: z.number().optional().nullable(),
  chest: z.number().optional().nullable(),
  arms: z.number().optional().nullable(),
  thighs: z.number().optional().nullable(),
  energyScore: z.number().int().min(1).max(10),
  sleepScore: z.number().int().min(1).max(10),
  moodScore: z.number().int().min(1).max(10),
  adherencePercent: z.number().int().min(0).max(100),
  hasProgressPhoto: z.boolean().default(false),
  clientNotes: z.string().default(''),
})
export type CheckInInput = z.infer<typeof checkInSchemaInput>

export const checkInReviewSchema = z.object({
  checkInId: z.string().min(1),
  coachResponse: z.string().min(1, 'Response cannot be empty').max(2000),
  status: z.literal('reviewed'),
})
export type CheckInReview = z.infer<typeof checkInReviewSchema>

export const messageSchemaInput = z.object({
  clientId: z.string().min(1),
  messageText: z.string().min(1, 'Message cannot be empty').max(4000),
})
export type MessageInput = z.infer<typeof messageSchemaInput>

export const savedReplySchemaInput = z.object({
  title: z.string().min(1).max(80),
  body: z.string().min(1).max(2000),
  category: savedReplyCategorySchema.default('check_in'),
})
export type SavedReplyInput = z.infer<typeof savedReplySchemaInput>

export const taskToggleSchema = z.object({
  taskId: z.string().min(1),
  completed: z.boolean(),
})
export type TaskToggle = z.infer<typeof taskToggleSchema>

export const assignTemplateSchema = z.object({
  templateId: z.string().min(1),
  clientIds: z.array(z.string()).min(1, 'Select at least one client'),
})
export type AssignTemplateInput = z.infer<typeof assignTemplateSchema>

// ────────────────────────────────────────────────────────────────────────────
// Result helpers for server actions
// ────────────────────────────────────────────────────────────────────────────
export type ActionResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> }
