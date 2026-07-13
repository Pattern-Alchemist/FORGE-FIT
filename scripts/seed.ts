/**
 * Forge — Database seed script (JSON fixture-based)
 *
 * Usage: `bun run db:seed`
 *
 * Idempotent: uses upserts on stable IDs so re-running won't duplicate.
 */
import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

// Load JSON fixture that mirrors the original TS seed data.
// Generated from src/lib/data.ts via a one-time conversion.
const FIXTURE_PATH = resolve('scripts/seed-data.json')

async function main() {
  console.log('🌱 Seeding Forge database…')
  const raw = readFileSync(FIXTURE_PATH, 'utf-8')
  const data = JSON.parse(raw)

  const {
    coach: coachData,
    clients: clientsData,
    programs: programsData,
    workoutTemplates: templatesData,
    exercises: exercisesData,
    checkIns: checkInsData,
    messages: messagesData,
    habitLogs: habitLogsData,
    savedReplies: savedRepliesData,
    tasks: tasksData,
    activityEvents: activityEventsData,
  } = data

  // 1. Coach
  const coach = await db.coach.upsert({
    where: { id: coachData.id },
    update: {
      email: coachData.email,
      name: coachData.name,
      avatar: coachData.avatar,
      businessName: coachData.business_name,
      accentColor: coachData.accent_color,
      subscriptionPlan: coachData.subscription_plan,
    },
    create: {
      id: coachData.id,
      email: coachData.email,
      name: coachData.name,
      avatar: coachData.avatar,
      businessName: coachData.business_name,
      accentColor: coachData.accent_color,
      subscriptionPlan: coachData.subscription_plan,
      notifications: { create: {} },
      settings: { create: { theme: coachData.settings.theme } },
    },
  })
  await db.coachNotifications.upsert({
    where: { coachId: coach.id },
    update: {
      newCheckIns: coachData.settings.notifications.new_check_ins,
      unreadMessages: coachData.settings.notifications.unread_messages,
      lowAdherence: coachData.settings.notifications.low_adherence,
      weeklySummary: coachData.settings.notifications.weekly_summary,
    },
    create: {
      coachId: coach.id,
      newCheckIns: coachData.settings.notifications.new_check_ins,
      unreadMessages: coachData.settings.notifications.unread_messages,
      lowAdherence: coachData.settings.notifications.low_adherence,
      weeklySummary: coachData.settings.notifications.weekly_summary,
    },
  })
  await db.coachSettings.upsert({
    where: { coachId: coach.id },
    update: { theme: coachData.settings.theme },
    create: { coachId: coach.id, theme: coachData.settings.theme },
  })
  console.log(`  ✓ Coach: ${coach.name}`)

  // 2. Exercise library
  const seenEx = new Set<string>()
  for (const ex of exercisesData) {
    if (seenEx.has(ex.name)) continue
    seenEx.add(ex.name)
    await db.exerciseLibrary.upsert({
      where: { coachId_name: { coachId: coach.id, name: ex.name } },
      update: {},
      create: {
        coachId: coach.id,
        name: ex.name,
        muscleGroup: ex.muscle_group,
        equipment: ex.equipment,
        hasVideoDemo: ex.video_demo_placeholder,
        videoUrl: ex.video_url ?? null,
        defaultSets: ex.sets,
        defaultReps: ex.reps,
        defaultTempo: ex.tempo,
        defaultRest: ex.rest_seconds,
        defaultRpe: ex.rpe,
        notes: ex.notes,
      },
    })
  }
  console.log(`  ✓ Exercise library: ${seenEx.size} exercises`)

  // 3. Clients
  for (const c of clientsData) {
    await db.client.upsert({
      where: { id: c.id },
      update: {
        coachId: coach.id,
        fullName: c.full_name,
        avatar: c.avatar,
        age: c.age,
        gender: c.gender,
        goal: c.goal,
        trainingPhase: c.training_phase,
        status: c.status,
        joinDate: new Date(c.join_date),
        adherenceScore: c.adherence_score,
        weeklyStreak: c.weekly_streak,
        injuries: JSON.stringify(c.injuries_limitations),
        coachNotes: c.coach_notes,
        tags: JSON.stringify(c.tags),
        nextActionType: c.next_action?.type ?? null,
        nextActionLabel: c.next_action?.label ?? null,
        nextActionDue: c.next_action?.due ?? null,
        lastActivityAt: c.last_activity ? new Date(c.last_activity) : null,
        workoutDueToday: c.workout_due_today ?? false,
      },
      create: {
        id: c.id,
        coachId: coach.id,
        fullName: c.full_name,
        avatar: c.avatar,
        age: c.age,
        gender: c.gender,
        goal: c.goal,
        trainingPhase: c.training_phase,
        status: c.status,
        joinDate: new Date(c.join_date),
        adherenceScore: c.adherence_score,
        weeklyStreak: c.weekly_streak,
        injuries: JSON.stringify(c.injuries_limitations),
        coachNotes: c.coach_notes,
        tags: JSON.stringify(c.tags),
        nextActionType: c.next_action?.type ?? null,
        nextActionLabel: c.next_action?.label ?? null,
        nextActionDue: c.next_action?.due ?? null,
        lastActivityAt: c.last_activity ? new Date(c.last_activity) : null,
        workoutDueToday: c.workout_due_today ?? false,
      },
    })
  }
  console.log(`  ✓ Clients: ${clientsData.length}`)

  // 4. Workout templates + blocks + exercises
  for (const t of templatesData) {
    const existing = await db.workoutTemplate.findUnique({ where: { id: t.id } })
    if (existing) {
      await db.workoutBlock.deleteMany({ where: { templateId: t.id } })
    }
    await db.workoutTemplate.upsert({
      where: { id: t.id },
      update: {
        coachId: coach.id,
        title: t.title,
        category: t.category,
        duration: t.duration,
      },
      create: {
        id: t.id,
        coachId: coach.id,
        title: t.title,
        category: t.category,
        duration: t.duration,
      },
    })
    for (let bi = 0; bi < t.blocks.length; bi++) {
      const b = t.blocks[bi]
      const block = await db.workoutBlock.create({
        data: {
          templateId: t.id,
          blockType: b.block_type,
          sortOrder: bi,
          notes: b.notes ?? null,
        },
      })
      for (let ei = 0; ei < b.exercises.length; ei++) {
        const e = b.exercises[ei]
        await db.exercise.create({
          data: {
            blockId: block.id,
            name: e.name,
            muscleGroup: e.muscle_group,
            equipment: e.equipment,
            hasVideoDemo: e.video_demo_placeholder,
            videoUrl: e.video_url ?? null,
            sets: e.sets,
            reps: e.reps,
            tempo: e.tempo,
            restSeconds: e.rest_seconds,
            rpe: e.rpe,
            notes: e.notes ?? null,
            sortOrder: ei,
          },
        })
      }
    }
  }
  console.log(`  ✓ Workout templates: ${templatesData.length}`)

  // 5. Programs + template assignments
  for (const p of programsData) {
    const existing = await db.program.findUnique({ where: { id: p.id } })
    if (existing) {
      await db.workoutTemplateAssignment.deleteMany({ where: { programId: p.id } })
    }
    await db.program.upsert({
      where: { id: p.id },
      update: {
        clientId: p.client_id,
        coachId: coach.id,
        title: p.title,
        goal: p.goal,
        phase: p.phase,
        startDate: new Date(p.start_date),
        endDate: new Date(p.end_date),
        weeks: p.weeks,
        isActive: p.workout_template_ids.length > 0,
      },
      create: {
        id: p.id,
        clientId: p.client_id,
        coachId: coach.id,
        title: p.title,
        goal: p.goal,
        phase: p.phase,
        startDate: new Date(p.start_date),
        endDate: new Date(p.end_date),
        weeks: p.weeks,
        isActive: p.workout_template_ids.length > 0,
      },
    })
    for (let i = 0; i < p.workout_template_ids.length; i++) {
      const tid = p.workout_template_ids[i]
      await db.workoutTemplateAssignment.create({
        data: {
          templateId: tid,
          programId: p.id,
          clientId: p.client_id,
          sortOrder: i,
        },
      })
    }
  }
  console.log(`  ✓ Programs: ${programsData.length}`)

  // 6. Check-ins
  for (const ci of checkInsData) {
    await db.checkIn.upsert({
      where: { id: ci.id },
      update: {
        clientId: ci.client_id,
        date: new Date(ci.date),
        bodyWeight: ci.body_weight,
        waist: ci.waist ?? null,
        chest: ci.chest ?? null,
        arms: ci.arms ?? null,
        thighs: ci.thighs ?? null,
        energyScore: ci.energy_score,
        sleepScore: ci.sleep_score,
        moodScore: ci.mood_score,
        adherencePercent: ci.adherence_percent,
        hasProgressPhoto: ci.progress_photo_placeholder,
        clientNotes: ci.client_notes,
        coachResponse: ci.coach_response ?? null,
        status: ci.status,
      },
      create: {
        id: ci.id,
        clientId: ci.client_id,
        date: new Date(ci.date),
        bodyWeight: ci.body_weight,
        waist: ci.waist ?? null,
        chest: ci.chest ?? null,
        arms: ci.arms ?? null,
        thighs: ci.thighs ?? null,
        energyScore: ci.energy_score,
        sleepScore: ci.sleep_score,
        moodScore: ci.mood_score,
        adherencePercent: ci.adherence_percent,
        hasProgressPhoto: ci.progress_photo_placeholder,
        clientNotes: ci.client_notes,
        coachResponse: ci.coach_response ?? null,
        coachId: ci.status === 'reviewed' ? coach.id : null,
        status: ci.status,
      },
    })
  }
  console.log(`  ✓ Check-ins: ${checkInsData.length}`)

  // 7. Messages
  for (const m of messagesData) {
    await db.message.upsert({
      where: { id: m.id },
      update: {
        clientId: m.client_id,
        coachId: m.sender_type === 'coach' ? coach.id : null,
        senderType: m.sender_type,
        messageText: m.message_text,
        hasAttachment: m.attachment_placeholder,
        readStatus: m.read_status,
        createdAt: new Date(m.created_at),
      },
      create: {
        id: m.id,
        clientId: m.client_id,
        coachId: m.sender_type === 'coach' ? coach.id : null,
        senderType: m.sender_type,
        messageText: m.message_text,
        hasAttachment: m.attachment_placeholder,
        readStatus: m.read_status,
        createdAt: new Date(m.created_at),
      },
    })
  }
  console.log(`  ✓ Messages: ${messagesData.length}`)

  // 8. Habit logs
  for (const hl of habitLogsData) {
    const date = new Date(hl.date)
    const id = `hl-${hl.client_id}-${date.toISOString().slice(0, 10)}`
    await db.habitLog.upsert({
      where: { id },
      update: {
        clientId: hl.client_id,
        date,
        steps: hl.steps,
        water: hl.water,
        protein: hl.protein,
        sleepHours: hl.sleep_hours,
        workoutCompleted: hl.workout_completed,
      },
      create: {
        id,
        clientId: hl.client_id,
        date,
        steps: hl.steps,
        water: hl.water,
        protein: hl.protein,
        sleepHours: hl.sleep_hours,
        workoutCompleted: hl.workout_completed,
      },
    })
  }
  console.log(`  ✓ Habit logs: ${habitLogsData.length}`)

  // 9. Saved replies
  for (const sr of savedRepliesData) {
    await db.savedReply.upsert({
      where: { id: sr.id },
      update: {
        coachId: coach.id,
        title: sr.title,
        body: sr.body,
        category: sr.category,
      },
      create: {
        id: sr.id,
        coachId: coach.id,
        title: sr.title,
        body: sr.body,
        category: sr.category,
      },
    })
  }
  console.log(`  ✓ Saved replies: ${savedRepliesData.length}`)

  // 10. Tasks
  for (const t of tasksData) {
    await db.task.upsert({
      where: { id: t.id },
      update: {
        coachId: coach.id,
        clientId: t.client_id,
        type: t.type,
        label: t.label,
        due: t.due,
        priority: t.priority,
        completed: t.completed,
      },
      create: {
        id: t.id,
        coachId: coach.id,
        clientId: t.client_id,
        type: t.type,
        label: t.label,
        due: t.due,
        priority: t.priority,
        completed: t.completed,
      },
    })
  }
  console.log(`  ✓ Tasks: ${tasksData.length}`)

  // 11. Activity events
  for (const ev of activityEventsData) {
    await db.activityEvent.upsert({
      where: { id: ev.id },
      update: {
        coachId: coach.id,
        clientId: ev.client_id,
        type: ev.type,
        label: ev.label,
        timestamp: new Date(ev.timestamp),
      },
      create: {
        id: ev.id,
        coachId: coach.id,
        clientId: ev.client_id,
        type: ev.type,
        label: ev.label,
        timestamp: new Date(ev.timestamp),
      },
    })
  }
  console.log(`  ✓ Activity events: ${activityEventsData.length}`)

  // 12. Auth accounts (coach + 3 clients)
  console.log('\n🔐 Seeding auth accounts…')
  const coachPassword = await bcrypt.hash('forge123', 10)
  const clientPassword = await bcrypt.hash('client123', 10)

  // Coach login
  await db.user.upsert({
    where: { email: 'marcus@forge.coach' },
    update: { passwordHash: coachPassword, role: 'coach', coachId: coach.id, clientId: null },
    create: {
      email: 'marcus@forge.coach',
      passwordHash: coachPassword,
      role: 'coach',
      coachId: coach.id,
    },
  })
  console.log('  ✓ Coach login: marcus@forge.coach / forge123')

  // Client logins (3 demo clients)
  const clientLogins = [
    { email: 'elena@client.forge.coach', clientId: 'cl1' },
    { email: 'daichi@client.forge.coach', clientId: 'cl2' },
    { email: 'priya@client.forge.coach', clientId: 'cl3' },
  ]
  for (const cl of clientLogins) {
    await db.user.upsert({
      where: { email: cl.email },
      update: { passwordHash: clientPassword, role: 'client', clientId: cl.clientId, coachId: null },
      create: {
        email: cl.email,
        passwordHash: clientPassword,
        role: 'client',
        clientId: cl.clientId,
      },
    })
  }
  console.log('  ✓ Client logins: elena@client.forge.coach, daichi@client.forge.coach, priya@client.forge.coach (all / client123)')

  console.log('\n✅ Seed complete.')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
