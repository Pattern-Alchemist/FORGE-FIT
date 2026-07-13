/**
 * Forge — Server-side data queries
 *
 * Pure read functions used by React Query fetchers. Each function maps Prisma
 * rows to the UI-facing types defined in src/lib/types.ts.
 *
 * Auth-aware: reads use getServerSession() to resolve the current user.
 * Coaches see all their data; clients see only their own.
 */
import { db } from '@/lib/db'
import { requireCoachId, requireClientId } from '@/lib/session'
import type {
  Coach,
  Client,
  Program,
  WorkoutTemplate,
  WorkoutBlock,
  Exercise,
  CheckIn,
  Message,
  HabitLog,
  SavedReply,
  Task,
  ActivityEvent,
} from '@/lib/types'

function parseJSON<T>(s: string | null | undefined, fallback: T): T {
  if (!s) return fallback
  try {
    return JSON.parse(s) as T
  } catch {
    return fallback
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Coach
// ────────────────────────────────────────────────────────────────────────────
export async function getCoach(): Promise<Coach | null> {
  const coachId = await requireCoachId().catch(() => null)
  if (!coachId) return null
  const c = await db.coach.findUnique({
    where: { id: coachId },
    include: { notifications: true, settings: true },
  })
  if (!c) return null
  return {
    id: c.id,
    name: c.name,
    email: c.email,
    avatar: c.avatar,
    business_name: c.businessName,
    accent_color: c.accentColor,
    subscription_plan: c.subscriptionPlan as Coach['subscription_plan'],
    settings: {
      notifications: {
        new_check_ins: c.notifications?.newCheckIns ?? true,
        unread_messages: c.notifications?.unreadMessages ?? true,
        low_adherence: c.notifications?.lowAdherence ?? true,
        weekly_summary: c.notifications?.weeklySummary ?? true,
      },
      theme: (c.settings?.theme as 'light' | 'dark' | 'system') ?? 'system',
    },
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Clients
// ────────────────────────────────────────────────────────────────────────────
export async function getClients(): Promise<Client[]> {
  const coachId = await requireCoachId()
  const rows = await db.client.findMany({
    where: { coachId },
    orderBy: { lastActivityAt: 'desc' },
  })
  return rows.map((c) => ({
    id: c.id,
    full_name: c.fullName,
    avatar: c.avatar,
    age: c.age,
    gender: c.gender as Client['gender'],
    goal: c.goal as Client['goal'],
    training_phase: c.trainingPhase as Client['training_phase'],
    status: c.status as Client['status'],
    join_date: c.joinDate.toISOString(),
    adherence_score: c.adherenceScore,
    weekly_streak: c.weeklyStreak,
    injuries_limitations: parseJSON<string[]>(c.injuries, []),
    coach_notes: c.coachNotes,
    tags: parseJSON<string[]>(c.tags, []),
    next_action: c.nextActionType
      ? {
          type: c.nextActionType as Client['next_action'] extends infer T ? (T extends { type: infer U } ? U : never) : never,
          label: c.nextActionLabel ?? '',
          due: c.nextActionDue ?? undefined,
        }
      : undefined,
    last_activity: c.lastActivityAt?.toISOString(),
    workout_due_today: c.workoutDueToday,
  }))
}

export async function getClient(clientId: string): Promise<Client | null> {
  const c = await db.client.findUnique({ where: { id: clientId } })
  if (!c) return null
  return {
    id: c.id,
    full_name: c.fullName,
    avatar: c.avatar,
    age: c.age,
    gender: c.gender as Client['gender'],
    goal: c.goal as Client['goal'],
    training_phase: c.trainingPhase as Client['training_phase'],
    status: c.status as Client['status'],
    join_date: c.joinDate.toISOString(),
    adherence_score: c.adherenceScore,
    weekly_streak: c.weeklyStreak,
    injuries_limitations: parseJSON<string[]>(c.injuries, []),
    coach_notes: c.coachNotes,
    tags: parseJSON<string[]>(c.tags, []),
    next_action: c.nextActionType
      ? {
          type: c.nextActionType as 'review_check_in' | 'update_workout' | 'reply_message' | 'start_program',
          label: c.nextActionLabel ?? '',
          due: c.nextActionDue ?? undefined,
        }
      : undefined,
    last_activity: c.lastActivityAt?.toISOString(),
    workout_due_today: c.workoutDueToday,
    unread_count: 0, // populated by getDashboardStats
    pending_check_in: false, // populated by getDashboardStats
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Programs
// ────────────────────────────────────────────────────────────────────────────
export async function getClientProgram(clientId: string): Promise<Program | null> {
  const p = await db.program.findFirst({
    where: { clientId, isActive: true },
    orderBy: { createdAt: 'desc' },
    include: {
      templateAssignments: { orderBy: { sortOrder: 'asc' } },
    },
  })
  if (!p) return null
  return {
    id: p.id,
    client_id: p.clientId,
    title: p.title,
    goal: p.goal as Program['goal'],
    phase: p.phase as Program['phase'],
    start_date: p.startDate.toISOString(),
    end_date: p.endDate.toISOString(),
    weeks: p.weeks,
    assigned_by: p.coachId,
    workout_template_ids: p.templateAssignments.map((a) => a.templateId),
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Workout templates
// ────────────────────────────────────────────────────────────────────────────
export async function getWorkoutTemplates(): Promise<WorkoutTemplate[]> {
  const coachId = await requireCoachId()
  const rows = await db.workoutTemplate.findMany({
    where: { coachId },
    orderBy: { createdAt: 'desc' },
    include: {
      blocks: {
        orderBy: { sortOrder: 'asc' },
        include: {
          exercises: { orderBy: { sortOrder: 'asc' } },
        },
      },
      programLinks: true,
    },
  })
  return rows.map((t) => ({
    id: t.id,
    title: t.title,
    category: t.category,
    duration: t.duration,
    created_at: t.createdAt.toISOString(),
    assigned_to: Array.from(new Set(t.programLinks.map((l) => l.clientId))),
    blocks: t.blocks.map((b): WorkoutBlock => ({
      id: b.id,
      block_type: b.blockType as WorkoutBlock['block_type'],
      notes: b.notes ?? undefined,
      exercises: b.exercises.map((e): Exercise => ({
        id: e.id,
        name: e.name,
        muscle_group: e.muscleGroup,
        equipment: e.equipment,
        video_demo_placeholder: e.hasVideoDemo,
        sets: e.sets,
        reps: e.reps,
        tempo: e.tempo,
        rest_seconds: e.restSeconds,
        rpe: e.rpe,
        notes: e.notes ?? undefined,
      })),
    })),
  }))
}

export async function getWorkoutTemplate(templateId: string): Promise<WorkoutTemplate | null> {
  const t = await db.workoutTemplate.findUnique({
    where: { id: templateId },
    include: {
      blocks: {
        orderBy: { sortOrder: 'asc' },
        include: {
          exercises: { orderBy: { sortOrder: 'asc' } },
        },
      },
      programLinks: true,
    },
  })
  if (!t) return null
  return {
    id: t.id,
    title: t.title,
    category: t.category,
    duration: t.duration,
    created_at: t.createdAt.toISOString(),
    assigned_to: Array.from(new Set(t.programLinks.map((l) => l.clientId))),
    blocks: t.blocks.map((b): WorkoutBlock => ({
      id: b.id,
      block_type: b.blockType as WorkoutBlock['block_type'],
      notes: b.notes ?? undefined,
      exercises: b.exercises.map((e): Exercise => ({
        id: e.id,
        name: e.name,
        muscle_group: e.muscleGroup,
        equipment: e.equipment,
        video_demo_placeholder: e.hasVideoDemo,
        sets: e.sets,
        reps: e.reps,
        tempo: e.tempo,
        rest_seconds: e.restSeconds,
        rpe: e.rpe,
        notes: e.notes ?? undefined,
      })),
    })),
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Exercise library
// ────────────────────────────────────────────────────────────────────────────
export async function getExerciseLibrary(): Promise<Exercise[]> {
  const coachId = await requireCoachId()
  const rows = await db.exerciseLibrary.findMany({
    where: { coachId },
    orderBy: { name: 'asc' },
  })
  return rows.map((e) => ({
    id: e.id,
    name: e.name,
    muscle_group: e.muscleGroup,
    equipment: e.equipment,
    video_demo_placeholder: e.hasVideoDemo,
    sets: e.defaultSets,
    reps: e.defaultReps,
    tempo: e.defaultTempo,
    rest_seconds: e.defaultRest,
    rpe: e.defaultRpe,
    notes: e.notes ?? undefined,
  }))
}

// ────────────────────────────────────────────────────────────────────────────
// Check-ins
// ────────────────────────────────────────────────────────────────────────────
export async function getClientCheckIns(clientId: string): Promise<CheckIn[]> {
  const rows = await db.checkIn.findMany({
    where: { clientId },
    orderBy: { date: 'desc' },
  })
  return rows.map((ci) => ({
    id: ci.id,
    client_id: ci.clientId,
    date: ci.date.toISOString(),
    body_weight: ci.bodyWeight,
    waist: ci.waist ?? undefined,
    chest: ci.chest ?? undefined,
    arms: ci.arms ?? undefined,
    thighs: ci.thighs ?? undefined,
    energy_score: ci.energyScore,
    sleep_score: ci.sleepScore,
    mood_score: ci.moodScore,
    adherence_percent: ci.adherencePercent,
    progress_photo_placeholder: ci.hasProgressPhoto,
    client_notes: ci.clientNotes,
    coach_response: ci.coachResponse ?? undefined,
    status: ci.status as CheckIn['status'],
  }))
}

// ────────────────────────────────────────────────────────────────────────────
// Messages
// ────────────────────────────────────────────────────────────────────────────
export async function getClientMessages(clientId: string): Promise<Message[]> {
  const rows = await db.message.findMany({
    where: { clientId },
    orderBy: { createdAt: 'asc' },
  })
  return rows.map((m) => ({
    id: m.id,
    client_id: m.clientId,
    sender_type: m.senderType as Message['sender_type'],
    message_text: m.messageText,
    created_at: m.createdAt.toISOString(),
    attachment_placeholder: m.hasAttachment,
    read_status: m.readStatus,
  }))
}

// ────────────────────────────────────────────────────────────────────────────
// Habit logs
// ────────────────────────────────────────────────────────────────────────────
export async function getClientHabitLogs(clientId: string): Promise<HabitLog[]> {
  const rows = await db.habitLog.findMany({
    where: { clientId },
    orderBy: { date: 'desc' },
  })
  return rows.map((h) => ({
    id: h.id,
    client_id: h.clientId,
    date: h.date.toISOString(),
    steps: h.steps,
    water: h.water,
    protein: h.protein,
    sleep_hours: h.sleepHours,
    workout_completed: h.workoutCompleted,
  }))
}

// ────────────────────────────────────────────────────────────────────────────
// Saved replies
// ────────────────────────────────────────────────────────────────────────────
export async function getSavedReplies(): Promise<SavedReply[]> {
  const coachId = await requireCoachId()
  const rows = await db.savedReply.findMany({
    where: { coachId },
    orderBy: { createdAt: 'asc' },
  })
  return rows.map((sr) => ({
    id: sr.id,
    title: sr.title,
    body: sr.body,
    category: sr.category as SavedReply['category'],
  }))
}

// ────────────────────────────────────────────────────────────────────────────
// Tasks
// ────────────────────────────────────────────────────────────────────────────
export async function getTasks(): Promise<Task[]> {
  const coachId = await requireCoachId()
  const rows = await db.task.findMany({
    where: { coachId },
    orderBy: [{ completed: 'asc' }, { createdAt: 'desc' }],
  })
  return rows.map((t) => ({
    id: t.id,
    client_id: t.clientId,
    type: t.type as Task['type'],
    label: t.label,
    due: t.due,
    priority: t.priority as Task['priority'],
    completed: t.completed,
  }))
}

// ────────────────────────────────────────────────────────────────────────────
// Activity events
// ────────────────────────────────────────────────────────────────────────────
export async function getActivityEvents(): Promise<ActivityEvent[]> {
  const coachId = await requireCoachId()
  const rows = await db.activityEvent.findMany({
    where: { coachId },
    orderBy: { timestamp: 'desc' },
    take: 20,
  })
  return rows.map((ev) => ({
    id: ev.id,
    client_id: ev.clientId,
    type: ev.type as ActivityEvent['type'],
    label: ev.label,
    timestamp: ev.timestamp.toISOString(),
  }))
}

// ────────────────────────────────────────────────────────────────────────────
// Dashboard stats (aggregated)
// ────────────────────────────────────────────────────────────────────────────
export interface DashboardStats {
  activeClients: number
  workoutsDueToday: number
  pendingCheckIns: number
  unreadMessages: number
  avgAdherence: number
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const coachId = await requireCoachId()
  const [activeClients, workoutsDue, pendingCheckIns, unread, adherenceAgg] = await Promise.all([
    db.client.count({ where: { coachId, status: 'active' } }),
    db.client.count({ where: { coachId, workoutDueToday: true, status: 'active' } }),
    db.checkIn.count({ where: { status: 'pending', client: { coachId } } }),
    db.message.count({ where: { senderType: 'client', readStatus: false, client: { coachId } } }),
    db.client.aggregate({
      where: { coachId, status: 'active' },
      _avg: { adherenceScore: true },
    }),
  ])
  return {
    activeClients,
    workoutsDueToday: workoutsDue,
    pendingCheckIns,
    unreadMessages: unread,
    avgAdherence: Math.round(adherenceAgg._avg.adherenceScore ?? 0),
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Client-scoped queries (for the client mobile app)
// ────────────────────────────────────────────────────────────────────────────

// The client's own profile
export async function getMyClientProfile(): Promise<Client | null> {
  const clientId = await requireClientId()
  return getClient(clientId)
}

// The client's assigned workout templates (via their active program)
export async function getMyWorkouts(): Promise<WorkoutTemplate[]> {
  const clientId = await requireClientId()
  const program = await db.program.findFirst({
    where: { clientId, isActive: true },
    orderBy: { createdAt: 'desc' },
    include: {
      templateAssignments: {
        orderBy: { sortOrder: 'asc' },
        include: {
          template: {
            include: {
              blocks: {
                orderBy: { sortOrder: 'asc' },
                include: { exercises: { orderBy: { sortOrder: 'asc' } } },
              },
            },
          },
        },
      },
    },
  })
  if (!program) return []
  return program.templateAssignments.map((ta) => {
    const t = ta.template
    return {
      id: t.id,
      title: t.title,
      category: t.category,
      duration: t.duration,
      created_at: t.createdAt.toISOString(),
      assigned_to: [clientId],
      blocks: t.blocks.map((b): WorkoutBlock => ({
        id: b.id,
        block_type: b.blockType as WorkoutBlock['block_type'],
        notes: b.notes ?? undefined,
        exercises: b.exercises.map((e): Exercise => ({
          id: e.id,
          name: e.name,
          muscle_group: e.muscleGroup,
          equipment: e.equipment,
          video_demo_placeholder: e.hasVideoDemo,
          sets: e.sets,
          reps: e.reps,
          tempo: e.tempo,
          rest_seconds: e.restSeconds,
          rpe: e.rpe,
          notes: e.notes ?? undefined,
        })),
      })),
    }
  })
}

// The client's own check-ins
export async function getMyCheckIns(): Promise<CheckIn[]> {
  const clientId = await requireClientId()
  return getClientCheckIns(clientId)
}

// The client's chat with their coach
export async function getMyMessages(): Promise<Message[]> {
  const clientId = await requireClientId()
  return getClientMessages(clientId)
}

// The client's coach (for chat header / profile)
export async function getMyCoach() {
  const clientId = await requireClientId()
  const client = await db.client.findUnique({
    where: { id: clientId },
    select: { coach: { select: { id: true, name: true, avatar: true, businessName: true } } },
  })
  return client?.coach ?? null
}

// Client dashboard summary
export interface ClientHomeStats {
  adherenceScore: number
  weeklyStreak: number
  unreadMessages: number
  workoutDueToday: boolean
  nextActionLabel: string | null
  nextActionDue: string | null
}

export async function getClientHomeStats(): Promise<ClientHomeStats | null> {
  const clientId = await requireClientId()
  const client = await db.client.findUnique({
    where: { id: clientId },
    select: {
      adherenceScore: true,
      weeklyStreak: true,
      workoutDueToday: true,
      nextActionLabel: true,
      nextActionDue: true,
    },
  })
  if (!client) return null
  const unreadMessages = await db.message.count({
    where: { clientId, senderType: 'coach', readStatus: false },
  })
  return {
    adherenceScore: client.adherenceScore,
    weeklyStreak: client.weeklyStreak,
    unreadMessages,
    workoutDueToday: client.workoutDueToday,
    nextActionLabel: client.nextActionLabel,
    nextActionDue: client.nextActionDue,
  }
}

