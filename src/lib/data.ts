import type {
  Coach,
  Client,
  Program,
  WorkoutTemplate,
  Exercise,
  WorkoutBlock,
  CheckIn,
  Message,
  HabitLog,
  SavedReply,
  Task,
  ActivityEvent,
} from './types'

// ---------- Coach ----------
export const coach: Coach = {
  id: 'c1',
  name: 'Marcus Vey',
  email: 'marcus@forge.coach',
  avatar: 'MV',
  business_name: 'Forge Performance',
  accent_color: '#E8593A',
  subscription_plan: 'Performance',
  settings: {
    notifications: {
      new_check_ins: true,
      unread_messages: true,
      low_adherence: true,
      weekly_summary: true,
    },
    theme: 'system',
  },
}

// ---------- Exercise library ----------
export const exercises: Exercise[] = [
  {
    id: 'e1',
    name: 'Barbell Back Squat',
    muscle_group: 'Quads / Glutes',
    equipment: 'Barbell',
    video_demo_placeholder: true,
    sets: 4,
    reps: '5',
    tempo: '30X0',
    rest_seconds: 180,
    rpe: 8,
    notes: 'Drive knees out, brace before descent.',
  },
  {
    id: 'e2',
    name: 'Conventional Deadlift',
    muscle_group: 'Posterior Chain',
    equipment: 'Barbell',
    video_demo_placeholder: true,
    sets: 3,
    reps: '3',
    tempo: '10X0',
    rest_seconds: 240,
    rpe: 8,
    notes: 'Pull slack out, push the floor away.',
  },
  {
    id: 'e3',
    name: 'Bench Press',
    muscle_group: 'Chest / Triceps',
    equipment: 'Barbell',
    video_demo_placeholder: true,
    sets: 4,
    reps: '6',
    tempo: '20X0',
    rest_seconds: 150,
    rpe: 8,
  },
  {
    id: 'e4',
    name: 'Weighted Pull-Up',
    muscle_group: 'Back / Biceps',
    equipment: 'Pull-Up Belt',
    video_demo_placeholder: true,
    sets: 4,
    reps: '6',
    tempo: '20X1',
    rest_seconds: 150,
    rpe: 8,
  },
  {
    id: 'e5',
    name: 'Standing Overhead Press',
    muscle_group: 'Shoulders / Triceps',
    equipment: 'Barbell',
    video_demo_placeholder: true,
    sets: 4,
    reps: '5',
    tempo: '20X0',
    rest_seconds: 150,
    rpe: 8,
  },
  {
    id: 'e6',
    name: 'Pendlay Row',
    muscle_group: 'Back / Biceps',
    equipment: 'Barbell',
    video_demo_placeholder: true,
    sets: 4,
    reps: '6',
    tempo: '10X1',
    rest_seconds: 120,
    rpe: 7,
  },
  {
    id: 'e7',
    name: 'Romanian Deadlift',
    muscle_group: 'Hamstrings / Glutes',
    equipment: 'Barbell',
    video_demo_placeholder: true,
    sets: 3,
    reps: '8',
    tempo: '30X0',
    rest_seconds: 120,
    rpe: 7,
  },
  {
    id: 'e8',
    name: 'Bulgarian Split Squat',
    muscle_group: 'Quads / Glutes',
    equipment: 'Dumbbell',
    video_demo_placeholder: true,
    sets: 3,
    reps: '10',
    tempo: '20X0',
    rest_seconds: 90,
    rpe: 8,
  },
  {
    id: 'e9',
    name: 'Hip Thrust',
    muscle_group: 'Glutes',
    equipment: 'Barbell',
    video_demo_placeholder: true,
    sets: 3,
    reps: '10',
    tempo: '20X2',
    rest_seconds: 90,
    rpe: 8,
  },
  {
    id: 'e10',
    name: 'Incline Dumbbell Press',
    muscle_group: 'Chest / Shoulders',
    equipment: 'Dumbbell',
    video_demo_placeholder: true,
    sets: 3,
    reps: '10',
    tempo: '20X0',
    rest_seconds: 90,
    rpe: 7,
  },
  {
    id: 'e11',
    name: 'Cable Lat Pulldown',
    muscle_group: 'Back / Biceps',
    equipment: 'Cable',
    video_demo_placeholder: true,
    sets: 3,
    reps: '12',
    tempo: '20X1',
    rest_seconds: 75,
    rpe: 7,
  },
  {
    id: 'e12',
    name: 'Lateral Raise',
    muscle_group: 'Shoulders',
    equipment: 'Dumbbell',
    video_demo_placeholder: true,
    sets: 3,
    reps: '15',
    tempo: '20X0',
    rest_seconds: 60,
    rpe: 7,
  },
  {
    id: 'e13',
    name: 'Face Pull',
    muscle_group: 'Rear Delts / Upper Back',
    equipment: 'Cable',
    video_demo_placeholder: true,
    sets: 3,
    reps: '15',
    tempo: '20X1',
    rest_seconds: 60,
    rpe: 6,
  },
  {
    id: 'e14',
    name: 'Leg Press',
    muscle_group: 'Quads / Glutes',
    equipment: 'Machine',
    video_demo_placeholder: true,
    sets: 3,
    reps: '12',
    tempo: '20X0',
    rest_seconds: 90,
    rpe: 7,
  },
  {
    id: 'e15',
    name: 'Dumbbell Curl',
    muscle_group: 'Biceps',
    equipment: 'Dumbbell',
    video_demo_placeholder: true,
    sets: 3,
    reps: '12',
    tempo: '20X0',
    rest_seconds: 60,
    rpe: 7,
  },
  {
    id: 'e16',
    name: 'Tricep Rope Pushdown',
    muscle_group: 'Triceps',
    equipment: 'Cable',
    video_demo_placeholder: true,
    sets: 3,
    reps: '12',
    tempo: '20X0',
    rest_seconds: 60,
    rpe: 7,
  },
  {
    id: 'e17',
    name: 'Concept2 Row',
    muscle_group: 'Full Body / Cardio',
    equipment: 'Rower',
    video_demo_placeholder: true,
    sets: 5,
    reps: '500m',
    tempo: '-',
    rest_seconds: 120,
    rpe: 8,
  },
  {
    id: 'e18',
    name: 'Assault Bike Intervals',
    muscle_group: 'Conditioning',
    equipment: 'Air Bike',
    video_demo_placeholder: true,
    sets: 8,
    reps: '30s on / 30s off',
    tempo: '-',
    rest_seconds: 30,
    rpe: 9,
  },
  {
    id: 'e19',
    name: 'Cat-Camel',
    muscle_group: 'Mobility',
    equipment: 'Bodyweight',
    video_demo_placeholder: true,
    sets: 2,
    reps: '10',
    tempo: '-',
    rest_seconds: 0,
    rpe: 3,
  },
  {
    id: 'e20',
    name: 'World\'s Greatest Stretch',
    muscle_group: 'Mobility',
    equipment: 'Bodyweight',
    video_demo_placeholder: true,
    sets: 2,
    reps: '8/side',
    tempo: '-',
    rest_seconds: 0,
    rpe: 3,
  },
  {
    id: 'e21',
    name: 'Goblet Squat',
    muscle_group: 'Quads / Glutes',
    equipment: 'Kettlebell',
    video_demo_placeholder: true,
    sets: 3,
    reps: '10',
    tempo: '20X0',
    rest_seconds: 75,
    rpe: 7,
  },
  {
    id: 'e22',
    name: 'Hanging Leg Raise',
    muscle_group: 'Core',
    equipment: 'Pull-Up Bar',
    video_demo_placeholder: true,
    sets: 3,
    reps: '12',
    tempo: '20X1',
    rest_seconds: 60,
    rpe: 7,
  },
]

// Helper to build blocks
const blk = (
  id: string,
  block_type: WorkoutBlock['block_type'],
  exerciseIds: string[],
  notes?: string,
): WorkoutBlock => ({
  id,
  block_type,
  notes,
  exercises: exerciseIds
    .map((eid) => exercises.find((e) => e.id === eid))
    .filter(Boolean) as Exercise[],
})

// ---------- Workout templates ----------
export const workoutTemplates: WorkoutTemplate[] = [
  {
    id: 'wt1',
    title: 'Lower Body — Strength',
    category: 'Lower Body',
    duration: 75,
    created_at: '2026-04-12T09:00:00Z',
    assigned_to: ['cl1', 'cl3', 'cl7'],
    blocks: [
      blk('b1', 'warmup', ['e19', 'e20'], '5-10 min easy cardio before.'),
      blk('b2', 'strength', ['e1', 'e2'], 'Top set at RPE 8.'),
      blk('b3', 'accessory', ['e8', 'e9', 'e22']),
      blk('b4', 'cooldown', ['e19'], 'Static stretch hamstrings and hips.'),
    ],
  },
  {
    id: 'wt2',
    title: 'Upper Body — Push/Pull',
    category: 'Upper Body',
    duration: 70,
    created_at: '2026-04-12T09:00:00Z',
    assigned_to: ['cl1', 'cl5', 'cl9'],
    blocks: [
      blk('b1', 'warmup', ['e20'], 'Shoulder mobility flow.'),
      blk('b2', 'strength', ['e3', 'e4'], 'Bench 4x6 RPE 8, Pull-ups 4x6 weighted.'),
      blk('b3', 'accessory', ['e10', 'e11', 'e12', 'e13']),
      blk('b4', 'cooldown', ['e19']),
    ],
  },
  {
    id: 'wt3',
    title: 'Posterior Chain — Hypertrophy',
    category: 'Lower Body',
    duration: 65,
    created_at: '2026-04-15T09:00:00Z',
    assigned_to: ['cl2', 'cl11'],
    blocks: [
      blk('b1', 'warmup', ['e19', 'e20']),
      blk('b2', 'strength', ['e2', 'e7']),
      blk('b3', 'accessory', ['e9', 'e14', 'e22']),
      blk('b4', 'cooldown', ['e19']),
    ],
  },
  {
    id: 'wt4',
    title: 'Conditioning — Engine Builder',
    category: 'Conditioning',
    duration: 45,
    created_at: '2026-04-18T09:00:00Z',
    assigned_to: ['cl4', 'cl8', 'cl12'],
    blocks: [
      blk('b1', 'warmup', ['e19', 'e20'], '5 min easy row.'),
      blk('b2', 'conditioning', ['e17', 'e18'], '8 rounds of 30s bike / 30s rest, then 5x500m row.'),
      blk('b3', 'cooldown', ['e19']),
    ],
  },
  {
    id: 'wt5',
    title: 'Upper Body — Volume',
    category: 'Upper Body',
    duration: 70,
    created_at: '2026-04-20T09:00:00Z',
    assigned_to: ['cl6', 'cl10'],
    blocks: [
      blk('b1', 'warmup', ['e20']),
      blk('b2', 'strength', ['e5', 'e6']),
      blk('b3', 'accessory', ['e10', 'e12', 'e13', 'e15', 'e16']),
      blk('b4', 'cooldown', ['e19']),
    ],
  },
  {
    id: 'wt6',
    title: 'Full Body — Foundation',
    category: 'Full Body',
    duration: 60,
    created_at: '2026-04-08T09:00:00Z',
    assigned_to: ['cl7', 'cl9'],
    blocks: [
      blk('b1', 'warmup', ['e19', 'e20']),
      blk('b2', 'strength', ['e21', 'e5']),
      blk('b3', 'accessory', ['e9', 'e11', 'e22']),
      blk('b4', 'cooldown', ['e19']),
    ],
  },
]

// ---------- Clients (12) ----------
const today = new Date('2026-07-13T08:00:00Z')

function daysAgo(n: number): string {
  const d = new Date(today)
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

export const clients: Client[] = [
  {
    id: 'cl1',
    full_name: 'Elena Reyes',
    avatar: 'ER',
    age: 31,
    gender: 'F',
    goal: 'Strength',
    training_phase: 'Intensity Block',
    status: 'active',
    join_date: daysAgo(210),
    adherence_score: 94,
    injuries_limitations: ['Mild lower back tightness'],
    coach_notes:
      'Highly consistent. Hit PRs on squat and bench last block. Ready to test deadlift in 2 weeks.',
    tags: ['Priority', 'PR Window'],
    current_program_id: 'p1',
    next_action: { type: 'update_workout', label: 'Finalize peak week', due: 'Today' },
    last_activity: daysAgo(0),
    unread_count: 0,
    pending_check_in: false,
    workout_due_today: true,
    weekly_streak: 11,
  },
  {
    id: 'cl2',
    full_name: 'Daichi Tanaka',
    avatar: 'DT',
    age: 28,
    gender: 'M',
    goal: 'Hypertrophy',
    training_phase: 'Volume Block',
    status: 'active',
    join_date: daysAgo(120),
    adherence_score: 88,
    injuries_limitations: [],
    coach_notes:
      'Adding 5 lbs/week on compounds. Form on RDL has improved dramatically. Watch shoulder position on pull-ups.',
    tags: ['Growing'],
    current_program_id: 'p2',
    next_action: { type: 'review_check_in', label: 'Review weekly check-in', due: 'Today' },
    last_activity: daysAgo(0),
    unread_count: 2,
    pending_check_in: true,
    workout_due_today: true,
    weekly_streak: 6,
  },
  {
    id: 'cl3',
    full_name: 'Priya Anand',
    avatar: 'PA',
    age: 35,
    gender: 'F',
    goal: 'Fat Loss',
    training_phase: 'Volume Block',
    status: 'active',
    join_date: daysAgo(75),
    adherence_score: 71,
    injuries_limitations: ['Right knee — meniscus repair (2024)'],
    coach_notes:
      'Down 8.2 kg since start. Sleep has been inconsistent past 2 weeks — energy scores dropping. Address in next check-in.',
    tags: ['Flagged', 'Adherence Drop'],
    current_program_id: 'p3',
    next_action: { type: 'review_check_in', label: 'Address sleep & energy', due: 'Today' },
    last_activity: daysAgo(1),
    unread_count: 1,
    pending_check_in: true,
    workout_due_today: false,
    weekly_streak: 2,
  },
  {
    id: 'cl4',
    full_name: 'Marcus Holloway',
    avatar: 'MH',
    age: 42,
    gender: 'M',
    goal: 'Athletic Performance',
    training_phase: 'Intensity Block',
    status: 'active',
    join_date: daysAgo(160),
    adherence_score: 91,
    injuries_limitations: [],
    coach_notes:
      'Training for HYROX in October. Conditioning numbers trending up. Need to add lateral work to balance sagittal dominance.',
    tags: ['Competitor'],
    current_program_id: 'p4',
    next_action: { type: 'update_workout', label: 'Add lateral accessory', due: 'Tomorrow' },
    last_activity: daysAgo(0),
    unread_count: 0,
    pending_check_in: false,
    workout_due_today: true,
    weekly_streak: 9,
  },
  {
    id: 'cl5',
    full_name: 'Sofia Marchetti',
    avatar: 'SM',
    age: 26,
    gender: 'F',
    goal: 'Recomposition',
    training_phase: 'Volume Block',
    status: 'active',
    join_date: daysAgo(95),
    adherence_score: 85,
    injuries_limitations: ['Wrist sprain — avoid heavy pressing'],
    coach_notes:
      'Responding well to dumbbell-only upper body work. Body recomp visible in photos. Cuff strength improving.',
    tags: ['Adapting'],
    current_program_id: 'p5',
    next_action: { type: 'reply_message', label: 'Reply about wrist brace', due: 'Today' },
    last_activity: daysAgo(0),
    unread_count: 3,
    pending_check_in: false,
    workout_due_today: true,
    weekly_streak: 7,
  },
  {
    id: 'cl6',
    full_name: 'Theo Brandt',
    avatar: 'TB',
    age: 38,
    gender: 'M',
    goal: 'Strength',
    training_phase: 'Volume Block',
    status: 'active',
    join_date: daysAgo(45),
    adherence_score: 79,
    injuries_limitations: [],
    coach_notes:
      'Newer client. Movement quality is solid on squat/deadlift. Bench needs work — shoulder mobility restriction. Adding band work.',
    tags: ['Onboarding'],
    current_program_id: 'p6',
    next_action: { type: 'update_workout', label: 'Add mobility block', due: 'Tomorrow' },
    last_activity: daysAgo(1),
    unread_count: 0,
    pending_check_in: false,
    workout_due_today: false,
    weekly_streak: 4,
  },
  {
    id: 'cl7',
    full_name: 'Aaliyah Johnson',
    avatar: 'AJ',
    age: 29,
    gender: 'F',
    goal: 'General Fitness',
    training_phase: 'Foundation',
    status: 'active',
    join_date: daysAgo(28),
    adherence_score: 82,
    injuries_limitations: [],
    coach_notes:
      'Brand new — 4 weeks in. Building confidence with barbell. Loves the structure. Sessions missed last week due to travel.',
    tags: ['New'],
    current_program_id: 'p7',
    next_action: { type: 'update_workout', label: 'Adjust for missed week', due: 'Tomorrow' },
    last_activity: daysAgo(2),
    unread_count: 0,
    pending_check_in: false,
    workout_due_today: true,
    weekly_streak: 3,
  },
  {
    id: 'cl8',
    full_name: 'Rafael Ortiz',
    avatar: 'RO',
    age: 33,
    gender: 'M',
    goal: 'Athletic Performance',
    training_phase: 'Peaking',
    status: 'active',
    join_date: daysAgo(240),
    adherence_score: 96,
    injuries_limitations: [],
    coach_notes:
      'Long-term client. Powerlifting meet in 3 weeks. Peaking nicely. Squat and bench looking strong.',
    tags: ['Priority', 'Competitor'],
    current_program_id: 'p8',
    next_action: { type: 'update_workout', label: 'Plan opener attempts', due: 'Today' },
    last_activity: daysAgo(0),
    unread_count: 0,
    pending_check_in: false,
    workout_due_today: true,
    weekly_streak: 14,
  },
  {
    id: 'cl9',
    full_name: 'Hana Park',
    avatar: 'HP',
    age: 24,
    gender: 'F',
    goal: 'Hypertrophy',
    training_phase: 'Volume Block',
    status: 'active',
    join_date: daysAgo(110),
    adherence_score: 89,
    injuries_limitations: [],
    coach_notes:
      'Excellent technique on all lifts. Adding volume slowly. Nutrition compliance is the bottleneck — refer to RD if needed.',
    tags: ['Growing'],
    current_program_id: 'p9',
    next_action: { type: 'review_check_in', label: 'Review check-in', due: 'Tomorrow' },
    last_activity: daysAgo(1),
    unread_count: 0,
    pending_check_in: true,
    workout_due_today: false,
    weekly_streak: 8,
  },
  {
    id: 'cl10',
    full_name: 'Lucas Moreau',
    avatar: 'LM',
    age: 41,
    gender: 'M',
    goal: 'Fat Loss',
    training_phase: 'Volume Block',
    status: 'paused',
    join_date: daysAgo(180),
    adherence_score: 64,
    injuries_limitations: ['Lower back — disc bulge (2023)'],
    coach_notes:
      'Paused 2 weeks ago — work travel. Restarting next Monday. Need to deload and reassess.',
    tags: ['Paused'],
    current_program_id: 'p10',
    next_action: { type: 'start_program', label: 'Restart program Monday', due: 'Monday' },
    last_activity: daysAgo(14),
    unread_count: 0,
    pending_check_in: false,
    workout_due_today: false,
    weekly_streak: 0,
  },
  {
    id: 'cl11',
    full_name: 'Isabella Costa',
    avatar: 'IC',
    age: 30,
    gender: 'F',
    goal: 'Recomposition',
    training_phase: 'Maintenance',
    status: 'active',
    join_date: daysAgo(300),
    adherence_score: 93,
    injuries_limitations: [],
    coach_notes:
      'Maintenance phase after a successful cut. Energy balanced. Sleep solid. Will reassess goals next month.',
    tags: ['Stable'],
    current_program_id: 'p11',
    next_action: { type: 'reply_message', label: 'Reply about deload week', due: 'Today' },
    last_activity: daysAgo(0),
    unread_count: 1,
    pending_check_in: false,
    workout_due_today: true,
    weekly_streak: 12,
  },
  {
    id: 'cl12',
    full_name: 'Noah Williams',
    avatar: 'NW',
    age: 22,
    gender: 'M',
    goal: 'Strength',
    training_phase: 'Foundation',
    status: 'completed',
    join_date: daysAgo(150),
    adherence_score: 87,
    injuries_limitations: [],
    coach_notes:
      'Completed 12-week strength foundation. Handed off to maintenance template. Could re-engage for next block in 6 weeks.',
    tags: ['Completed'],
    current_program_id: undefined,
    next_action: { type: 'start_program', label: 'Re-engage for next block', due: 'Aug 25' },
    last_activity: daysAgo(21),
    unread_count: 0,
    pending_check_in: false,
    workout_due_today: false,
    weekly_streak: 0,
  },
]

// ---------- Programs (one per client) ----------
export const programs: Program[] = clients.map((c, i) => ({
  id: `p${i + 1}`,
  client_id: c.id,
  title: `${c.goal} — ${c.training_phase}`,
  goal: c.goal,
  phase: c.training_phase,
  start_date: daysAgo(60 - i * 2),
  end_date: daysAgo(-30 + i * 2),
  weeks: 12,
  assigned_by: coach.id,
  workout_template_ids:
    c.id === 'cl10' || c.id === 'cl12' ? [] : [workoutTemplates[i % workoutTemplates.length].id, workoutTemplates[(i + 1) % workoutTemplates.length].id],
}))

// ---------- Check-ins (multiple per client, last 8 weeks) ----------
export const checkIns: CheckIn[] = (() => {
  const list: CheckIn[] = []
  clients.forEach((c) => {
    // Base weight per client
    const baseW = c.gender === 'M' ? 80 + Math.floor(Math.random() * 12) : 60 + Math.floor(Math.random() * 10)
    // Trend direction: fat loss → decreasing, hypertrophy → increasing, etc.
    const trendPerWeek =
      c.goal === 'Fat Loss' ? -0.4 : c.goal === 'Hypertrophy' ? 0.2 : c.goal === 'Recomposition' ? -0.15 : 0

    for (let w = 7; w >= 0; w--) {
      const date = new Date(today)
      date.setDate(date.getDate() - w * 7)
      // Only generate for active clients or those who have been active recently
      if (c.status === 'paused' && w < 2) continue
      if (c.status === 'completed' && w < 3) continue

      const weightDelta = trendPerWeek * (7 - w) + (Math.random() - 0.5) * 0.5
      const isPending = w === 0 && c.pending_check_in
      list.push({
        id: `ci-${c.id}-${w}`,
        client_id: c.id,
        date: date.toISOString(),
        body_weight: Number((baseW + weightDelta).toFixed(1)),
        waist: c.gender === 'M' ? Number((82 + weightDelta * 0.6).toFixed(1)) : Number((72 + weightDelta * 0.5).toFixed(1)),
        chest: c.gender === 'M' ? Number((102 + weightDelta * 0.3).toFixed(1)) : Number((92 + weightDelta * 0.2).toFixed(1)),
        arms: Number((36 + weightDelta * 0.1).toFixed(1)),
        thighs: Number((56 + weightDelta * 0.2).toFixed(1)),
        energy_score: Math.max(3, Math.min(10, Math.round(7 + (Math.random() - 0.4) * 4))),
        sleep_score: Math.max(3, Math.min(10, Math.round(7 + (Math.random() - 0.4) * 4))),
        mood_score: Math.max(4, Math.min(10, Math.round(7 + (Math.random() - 0.3) * 4))),
        adherence_percent: Math.max(40, Math.min(100, Math.round(c.adherence_score + (Math.random() - 0.4) * 15))),
        progress_photo_placeholder: w % 2 === 0,
        client_notes:
          w === 0
            ? 'Felt strong this week but sleep was rough Mon-Wed. Hungry for the next phase.'
            : `Week ${8 - w} complete. Energy ${5 + Math.floor(Math.random() * 4)}/10.`,
        coach_response: isPending
          ? undefined
          : 'Great work this week. Let\'s keep the protein up and prioritize sleep — even 30 min earlier helps.',
        status: isPending ? 'pending' : 'reviewed',
      })
    }
  })
  return list
})()

// ---------- Messages (recent conversations) ----------
export const messages: Message[] = (() => {
  const list: Message[] = []
  const conversations: { clientId: string; msgs: { from: 'coach' | 'client'; text: string; mins: number; read: boolean }[] }[] = [
    {
      clientId: 'cl1',
      msgs: [
        { from: 'client', text: 'Hit 102.5kg x 3 on squat today. Felt smooth!', mins: 220, read: true },
        { from: 'coach', text: 'That\'s a 5kg PR. Beautiful. Let\'s ride this into peak week.', mins: 210, read: true },
        { from: 'client', text: 'Should I keep the same tempo or speed up?', mins: 30, read: false },
      ],
    },
    {
      clientId: 'cl2',
      msgs: [
        { from: 'client', text: 'Quick check-in submitted. Sleep was 6h on average 😕', mins: 480, read: false },
        { from: 'client', text: 'But hits on bench and RDL were solid.', mins: 478, read: false },
      ],
    },
    {
      clientId: 'cl3',
      msgs: [
        { from: 'client', text: 'Energy has been low this week. Struggled with the conditioning block.', mins: 1440, read: true },
        { from: 'coach', text: 'Thanks for being honest. Let\'s swap the conditioning for 2 zone-2 walks this week and revisit sleep.', mins: 1380, read: true },
        { from: 'client', text: 'That sounds manageable. Thank you.', mins: 90, read: false },
      ],
    },
    {
      clientId: 'cl5',
      msgs: [
        { from: 'client', text: 'Should I wear a wrist brace for incline presses?', mins: 60, read: false },
        { from: 'client', text: 'It felt a bit tweaked after last session.', mins: 58, read: false },
        { from: 'client', text: 'Sorry, just being cautious!', mins: 55, read: false },
      ],
    },
    {
      clientId: 'cl11',
      msgs: [
        { from: 'coach', text: 'How\'s the deload feeling? Any niggles?', mins: 200, read: true },
        { from: 'client', text: 'Honestly feeling amazing. Shoulders feel fresh.', mins: 120, read: false },
      ],
    },
    {
      clientId: 'cl4',
      msgs: [
        { from: 'client', text: 'HYROX wall ball work — should I add a heavier set this week?', mins: 320, read: true },
        { from: 'coach', text: 'Yes. 1 set at 9kg, then back to 6kg for volume.', mins: 300, read: true },
      ],
    },
  ]

  conversations.forEach((conv) => {
    conv.msgs.forEach((m, i) => {
      const d = new Date(today)
      d.setMinutes(d.getMinutes() - m.mins)
      list.push({
        id: `msg-${conv.clientId}-${i}`,
        client_id: conv.clientId,
        sender_type: m.from,
        message_text: m.text,
        created_at: d.toISOString(),
        attachment_placeholder: false,
        read_status: m.read,
      })
    })
  })
  return list
})()

// ---------- Habit logs (last 7 days, per client) ----------
export const habitLogs: HabitLog[] = (() => {
  const list: HabitLog[] = []
  clients.forEach((c) => {
    if (c.status !== 'active') return
    for (let d = 6; d >= 0; d--) {
      const date = new Date(today)
      date.setDate(date.getDate() - d)
      list.push({
        id: `hl-${c.id}-${d}`,
        client_id: c.id,
        date: date.toISOString(),
        steps: 5000 + Math.floor(Math.random() * 7000),
        water: Number((1.8 + Math.random() * 1.4).toFixed(1)),
        protein: 130 + Math.floor(Math.random() * 70),
        sleep_hours: Number((6 + Math.random() * 2.5).toFixed(1)),
        workout_completed: Math.random() > 0.2,
      })
    }
  })
  return list
})()

// ---------- Saved replies ----------
export const savedReplies: SavedReply[] = [
  {
    id: 'sr1',
    title: 'Great check-in',
    body: 'Nice work this week — I can see the consistency paying off. Keep protein at 1.6g/lb and aim for 7h sleep. We\'ll push volume next week.',
    category: 'check_in',
  },
  {
    id: 'sr2',
    title: 'Form check',
    body: 'Send me a side-angle video of your next set. I want to see knee tracking and bar path. In the meantime, drop the weight 10% and focus on tempo.',
    category: 'form',
  },
  {
    id: 'sr3',
    title: 'Tough week check-in',
    body: 'Thanks for flagging this. Life happens — let\'s drop one accessory block this week and prioritize sleep. We\'ll pick back up next Monday.',
    category: 'motivation',
  },
  {
    id: 'sr4',
    title: 'Schedule change',
    body: 'No problem at all. Send me your new availability and I\'ll re-arrange the split. Try to keep at least 48h between lower body sessions.',
    category: 'logistics',
  },
  {
    id: 'sr5',
    title: 'Deload reminder',
    body: 'Next week is deload — drop working sets by 20% and remove one accessory per session. Sleep and eat normally. We\'ll test the week after.',
    category: 'check_in',
  },
]

// ---------- Today's tasks ----------
export const tasks: Task[] = [
  {
    id: 't1',
    client_id: 'cl1',
    type: 'update_workout',
    label: 'Finalize Elena\'s peak week — set openers',
    due: 'Today',
    priority: 'high',
    completed: false,
  },
  {
    id: 't2',
    client_id: 'cl2',
    type: 'review_check_in',
    label: 'Review Daichi\'s check-in (sleep dip)',
    due: 'Today',
    priority: 'high',
    completed: false,
  },
  {
    id: 't3',
    client_id: 'cl3',
    type: 'review_check_in',
    label: 'Address Priya\'s sleep & energy drop',
    due: 'Today',
    priority: 'high',
    completed: false,
  },
  {
    id: 't4',
    client_id: 'cl5',
    type: 'reply_message',
    label: 'Reply to Sofia about wrist brace',
    due: 'Today',
    priority: 'medium',
    completed: false,
  },
  {
    id: 't5',
    client_id: 'cl8',
    type: 'update_workout',
    label: 'Plan Rafael\'s openers for meet',
    due: 'Today',
    priority: 'high',
    completed: false,
  },
  {
    id: 't6',
    client_id: 'cl11',
    type: 'reply_message',
    label: 'Reply to Isabella about deload',
    due: 'Today',
    priority: 'medium',
    completed: false,
  },
  {
    id: 't7',
    client_id: 'cl4',
    type: 'update_workout',
    label: 'Add lateral accessory to Marcus\'s block',
    due: 'Tomorrow',
    priority: 'medium',
    completed: false,
  },
]

// ---------- Recent activity feed ----------
export const activityEvents: ActivityEvent[] = [
  {
    id: 'a1',
    client_id: 'cl1',
    type: 'workout_complete',
    label: 'completed Lower Body — Strength',
    timestamp: daysAgo(0),
  },
  {
    id: 'a2',
    client_id: 'cl2',
    type: 'check_in',
    label: 'submitted weekly check-in',
    timestamp: daysAgo(0),
  },
  {
    id: 'a3',
    client_id: 'cl3',
    type: 'adherence_drop',
    label: 'adherence dropped 9pts this week',
    timestamp: daysAgo(0),
  },
  {
    id: 'a4',
    client_id: 'cl5',
    type: 'message',
    label: 'sent 3 messages about wrist tweak',
    timestamp: daysAgo(0),
  },
  {
    id: 'a5',
    client_id: 'cl4',
    type: 'workout_complete',
    label: 'completed Conditioning — Engine Builder',
    timestamp: daysAgo(0),
  },
  {
    id: 'a6',
    client_id: 'cl9',
    type: 'check_in',
    label: 'submitted weekly check-in',
    timestamp: daysAgo(1),
  },
  {
    id: 'a7',
    client_id: 'cl8',
    type: 'workout_complete',
    label: 'PR\'d on deadlift — 220kg x 1',
    timestamp: daysAgo(1),
  },
  {
    id: 'a8',
    client_id: 'cl11',
    type: 'message',
    label: 'asked about deload week',
    timestamp: daysAgo(0),
  },
]
