'use server'

/**
 * Forge — Coach domain server actions
 *
 * All mutations go through here. Each action:
 *   1. Validates input with Zod
 *   2. Mutates the DB via Prisma
 *   3. Returns an ActionResult<T>
 *   4. Calls revalidatePath so React Query refetches fresh data
 *
 * Note: For this MVP we use a hardcoded coachId since there's no auth yet.
 * When next-auth is wired, replace COACH_ID with the session user's id.
 */
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireCoachId, requireClientId, getSession } from '@/lib/session'
import {
  assignTemplateSchema,
  checkInReviewSchema,
  checkInSchemaInput,
  clientSchemaInput,
  messageSchemaInput,
  savedReplySchemaInput,
  taskToggleSchema,
  workoutTemplateSchemaInput,
  type ActionResult,
} from '@/lib/schemas'

// ────────────────────────────────────────────────────────────────────────────
// Task: toggle complete
// ────────────────────────────────────────────────────────────────────────────
export async function toggleTaskAction(
  input: z.infer<typeof taskToggleSchema>,
): Promise<ActionResult<{ id: string; completed: boolean }>> {
  const parsed = taskToggleSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'Invalid input', fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }
  const { taskId, completed } = parsed.data
  try {
    const updated = await db.task.update({
      where: { id: taskId },
      data: { completed, completedAt: completed ? new Date() : null },
      select: { id: true, completed: true },
    })
    revalidatePath('/')
    return { ok: true, data: updated }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Message: send from coach
// ────────────────────────────────────────────────────────────────────────────
export async function sendMessageAction(
  input: z.infer<typeof messageSchemaInput>,
): Promise<ActionResult<{ id: string; createdAt: Date }>> {
  const parsed = messageSchemaInput.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'Invalid input', fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }
  const { clientId, messageText } = parsed.data
  try {
    const coachId = await requireCoachId()
    const msg = await db.message.create({
      data: {
        clientId,
        coachId,
        senderType: 'coach',
        messageText,
        readStatus: true,
      },
      select: { id: true, createdAt: true },
    })
    // Broadcast to the chat service for real-time delivery
    try {
      await fetch(`http://localhost:3004/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          coachId,
          message: {
            id: msg.id,
            clientId,
            senderType: 'coach',
            messageText,
            createdAt: msg.createdAt.toISOString(),
          },
        }),
      })
    } catch {
      // Silent fail — message is persisted, realtime is a bonus
    }
    revalidatePath('/')
    return { ok: true, data: msg }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Check-in: coach review + response
// ────────────────────────────────────────────────────────────────────────────
export async function reviewCheckInAction(
  input: z.infer<typeof checkInReviewSchema>,
): Promise<ActionResult<{ id: string; status: string }>> {
  const parsed = checkInReviewSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'Invalid input', fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }
  const { checkInId, coachResponse, status } = parsed.data
  try {
    const coachId = await requireCoachId()
    const updated = await db.checkIn.update({
      where: { id: checkInId },
      data: { coachResponse, status, coachId },
      select: { id: true, status: true },
    })
    revalidatePath('/')
    return { ok: true, data: updated }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Workout template: save (create or update)
// ────────────────────────────────────────────────────────────────────────────
export async function saveWorkoutTemplateAction(
  input: z.infer<typeof workoutTemplateSchemaInput> & { id?: string },
): Promise<ActionResult<{ id: string }>> {
  const parsed = workoutTemplateSchemaInput.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'Invalid input', fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }
  const { title, category, duration, blocks } = parsed.data
  const { id } = input
  try {
    const coachId = await requireCoachId()
    if (id) {
      // Update: delete existing blocks, recreate
      await db.workoutBlock.deleteMany({ where: { templateId: id } })
      await db.workoutTemplate.update({
        where: { id },
        data: { title, category, duration },
      })
      for (let bi = 0; bi < blocks.length; bi++) {
        const b = blocks[bi]
        const block = await db.workoutBlock.create({
          data: { templateId: id, blockType: b.blockType, sortOrder: bi, notes: b.notes ?? null },
        })
        for (let ei = 0; ei < b.exercises.length; ei++) {
          const e = b.exercises[ei]
          await db.exercise.create({
            data: {
              blockId: block.id,
              name: e.name,
              muscleGroup: e.muscleGroup,
              equipment: e.equipment,
              hasVideoDemo: e.hasVideoDemo,
              sets: e.sets,
              reps: e.reps,
              tempo: e.tempo,
              restSeconds: e.restSeconds,
              rpe: e.rpe,
              notes: e.notes ?? null,
              sortOrder: ei,
            },
          })
        }
      }
      revalidatePath('/')
      return { ok: true, data: { id } }
    }
    // Create
    const newTpl = await db.workoutTemplate.create({
      data: {
        coachId,
        title,
        category,
        duration,
      },
    })
    for (let bi = 0; bi < blocks.length; bi++) {
      const b = blocks[bi]
      const block = await db.workoutBlock.create({
        data: { templateId: newTpl.id, blockType: b.blockType, sortOrder: bi, notes: b.notes ?? null },
      })
      for (let ei = 0; ei < b.exercises.length; ei++) {
        const e = b.exercises[ei]
        await db.exercise.create({
          data: {
            blockId: block.id,
            name: e.name,
            muscleGroup: e.muscleGroup,
            equipment: e.equipment,
            hasVideoDemo: e.hasVideoDemo,
            sets: e.sets,
            reps: e.reps,
            tempo: e.tempo,
            restSeconds: e.restSeconds,
            rpe: e.rpe,
            notes: e.notes ?? null,
            sortOrder: ei,
          },
        })
      }
    }
    revalidatePath('/')
    return { ok: true, data: { id: newTpl.id } }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Workout template: assign to one or many clients
// ────────────────────────────────────────────────────────────────────────────
export async function assignTemplateAction(
  input: z.infer<typeof assignTemplateSchema>,
): Promise<ActionResult<{ assigned: number }>> {
  const parsed = assignTemplateSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'Invalid input', fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }
  const { templateId, clientIds } = parsed.data
  try {
    let count = 0
    for (const clientId of clientIds) {
      // Find or create the client's active program; if none, skip with a clear signal
      const program = await db.program.findFirst({
        where: { clientId, isActive: true },
        orderBy: { createdAt: 'desc' },
      })
      if (!program) continue
      // Avoid duplicates
      const existing = await db.workoutTemplateAssignment.findFirst({
        where: { templateId, programId: program.id },
      })
      if (existing) continue
      await db.workoutTemplateAssignment.create({
        data: {
          templateId,
          programId: program.id,
          clientId,
          sortOrder: 0,
        },
      })
      count++
    }
    revalidatePath('/')
    return { ok: true, data: { assigned: count } }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Saved reply: create
// ────────────────────────────────────────────────────────────────────────────
export async function createSavedReplyAction(
  input: z.infer<typeof savedReplySchemaInput>,
): Promise<ActionResult<{ id: string }>> {
  const parsed = savedReplySchemaInput.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'Invalid input', fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }
  try {
    const coachId = await requireCoachId()
    const sr = await db.savedReply.create({
      data: { coachId, ...parsed.data },
      select: { id: true },
    })
    revalidatePath('/')
    return { ok: true, data: sr }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Client: create (basic — for the Add Client button)
// ────────────────────────────────────────────────────────────────────────────
export async function createClientAction(
  input: z.infer<typeof clientSchemaInput>,
): Promise<ActionResult<{ id: string }>> {
  const parsed = clientSchemaInput.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'Invalid input', fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }
  try {
    const coachId = await requireCoachId()
    const c = await db.client.create({
      data: {
        coachId,
        fullName: parsed.data.fullName,
        avatar: parsed.data.avatar || parsed.data.fullName.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase(),
        age: parsed.data.age,
        gender: parsed.data.gender,
        goal: parsed.data.goal,
        trainingPhase: parsed.data.trainingPhase,
        status: parsed.data.status,
        adherenceScore: parsed.data.adherenceScore,
        weeklyStreak: parsed.data.weeklyStreak,
        injuries: JSON.stringify(parsed.data.injuries),
        coachNotes: parsed.data.coachNotes,
        tags: JSON.stringify(parsed.data.tags),
        workoutDueToday: parsed.data.workoutDueToday,
      },
      select: { id: true },
    })
    revalidatePath('/')
    return { ok: true, data: c }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Client-side actions (for the client mobile app)
// ────────────────────────────────────────────────────────────────────────────

// Client: send a message to their coach
export async function clientSendMessageAction(
  input: z.infer<typeof messageSchemaInput>,
): Promise<ActionResult<{ id: string; createdAt: Date }>> {
  const parsed = messageSchemaInput.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'Invalid input', fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }
  const { messageText } = parsed.data
  try {
    const clientId = await requireClientId()
    const msg = await db.message.create({
      data: {
        clientId,
        senderType: 'client',
        messageText,
        readStatus: false,
      },
      select: { id: true, createdAt: true },
    })
    // Broadcast to the chat service for real-time delivery to the coach
    try {
      const client = await db.client.findUnique({
        where: { id: clientId },
        select: { coachId: true },
      })
      await fetch(`http://localhost:3004/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          coachId: client?.coachId,
          message: {
            id: msg.id,
            clientId,
            senderType: 'client',
            messageText,
            createdAt: msg.createdAt.toISOString(),
          },
        }),
      })
    } catch {
      // Silent fail — message is persisted, realtime is a bonus
    }
    revalidatePath('/')
    return { ok: true, data: msg }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

// Client: submit a weekly check-in
export async function submitCheckInAction(
  input: z.infer<typeof checkInSchemaInput>,
): Promise<ActionResult<{ id: string }>> {
  const parsed = checkInSchemaInput.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'Invalid input', fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }
  try {
    const clientId = await requireClientId()
    const ci = await db.checkIn.create({
      data: {
        clientId,
        date: parsed.data.date,
        bodyWeight: parsed.data.bodyWeight,
        waist: parsed.data.waist ?? null,
        chest: parsed.data.chest ?? null,
        arms: parsed.data.arms ?? null,
        thighs: parsed.data.thighs ?? null,
        energyScore: parsed.data.energyScore,
        sleepScore: parsed.data.sleepScore,
        moodScore: parsed.data.moodScore,
        adherencePercent: parsed.data.adherencePercent,
        hasProgressPhoto: parsed.data.hasProgressPhoto,
        clientNotes: parsed.data.clientNotes,
        status: 'pending',
      },
      select: { id: true },
    })
    revalidatePath('/')
    return { ok: true, data: ci }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

// Client: log a workout as completed
export async function logWorkoutCompletionAction(
  input: { workoutTemplateId: string; durationMin: number },
): Promise<ActionResult<{ id: string }>> {
  try {
    const clientId = await requireClientId()
    const today = new Date()
    const id = `hl-${clientId}-${today.toISOString().slice(0, 10)}`
    await db.habitLog.upsert({
      where: { id },
      update: { workoutCompleted: true },
      create: {
        id,
        clientId,
        date: today,
        workoutCompleted: true,
        steps: 0,
        water: 0,
        protein: 0,
        sleepHours: 0,
      },
    })
    const tpl = await db.workoutTemplate.findUnique({
      where: { id: input.workoutTemplateId },
      select: { title: true },
    })
    const client = await db.client.findUnique({
      where: { id: clientId },
      select: { coachId: true, fullName: true },
    })
    if (client) {
      await db.activityEvent.create({
        data: {
          coachId: client.coachId,
          clientId,
          type: 'workout_complete',
          label: `completed ${tpl?.title ?? 'workout'}`,
        },
      })
      await db.client.update({
        where: { id: clientId },
        data: { lastActivityAt: new Date(), workoutDueToday: false },
      })
    }
    revalidatePath('/')
    return { ok: true, data: { id } }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

// Client: mark messages from coach as read
export async function markMessagesReadAction(): Promise<ActionResult<{ count: number }>> {
  try {
    const clientId = await requireClientId()
    const result = await db.message.updateMany({
      where: { clientId, senderType: 'coach', readStatus: false },
      data: { readStatus: true },
    })
    revalidatePath('/')
    return { ok: true, data: { count: result.count } }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

