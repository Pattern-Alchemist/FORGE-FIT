// Domain types for the Forge coaching platform

export type Goal =
  | 'Hypertrophy'
  | 'Fat Loss'
  | 'Strength'
  | 'General Fitness'
  | 'Athletic Performance'
  | 'Recomposition'

export type TrainingPhase =
  | 'Foundation'
  | 'Volume Block'
  | 'Intensity Block'
  | 'Peaking'
  | 'Deload'
  | 'Maintenance'

export type ClientStatus = 'active' | 'paused' | 'completed'

export type BlockType =
  | 'warmup'
  | 'strength'
  | 'accessory'
  | 'conditioning'
  | 'cooldown'

export type SenderType = 'coach' | 'client'

export interface Coach {
  id: string
  name: string
  email: string
  avatar: string
  business_name: string
  accent_color: string
  subscription_plan: 'Solo' | 'Studio' | 'Performance'
  settings: {
    notifications: {
      new_check_ins: boolean
      unread_messages: boolean
      low_adherence: boolean
      weekly_summary: boolean
    }
    theme: 'light' | 'dark' | 'system'
  }
}

export interface Client {
  id: string
  full_name: string
  avatar: string
  age: number
  gender: 'M' | 'F' | 'NB'
  goal: Goal
  training_phase: TrainingPhase
  status: ClientStatus
  join_date: string // ISO
  adherence_score: number // 0-100
  injuries_limitations: string[]
  coach_notes: string
  tags: string[]
  // Derived/extra fields for richer UI
  current_program_id?: string
  next_action?: {
    type: 'review_check_in' | 'update_workout' | 'reply_message' | 'start_program'
    label: string
    due?: string
  }
  last_activity?: string
  unread_count?: number
  pending_check_in?: boolean
  workout_due_today?: boolean
  weekly_streak: number
}

export interface Program {
  id: string
  client_id: string
  title: string
  goal: Goal
  phase: TrainingPhase
  start_date: string
  end_date: string
  weeks: number
  assigned_by: string
  workout_template_ids: string[]
}

export interface Exercise {
  id: string
  name: string
  muscle_group: string
  equipment: string
  video_demo_placeholder: boolean
  video_url?: string // YouTube URL or MP4 path
  sets: number
  reps: string
  tempo: string
  rest_seconds: number
  rpe: number
  notes?: string
}

export interface WorkoutBlock {
  id: string
  block_type: BlockType
  exercises: Exercise[]
  notes?: string
}

export interface WorkoutTemplate {
  id: string
  title: string
  category: string
  duration: number // minutes
  blocks: WorkoutBlock[]
  assigned_to?: string[] // client ids
  created_at: string
}

export interface CheckIn {
  id: string
  client_id: string
  date: string
  body_weight: number // kg
  waist?: number // cm
  chest?: number // cm
  arms?: number // cm
  thighs?: number // cm
  energy_score: number // 1-10
  sleep_score: number // 1-10
  mood_score: number // 1-10
  adherence_percent: number
  progress_photo_placeholder: boolean
  client_notes: string
  coach_response?: string
  status: 'pending' | 'reviewed'
}

export interface Message {
  id: string
  client_id: string
  sender_type: SenderType
  message_text: string
  created_at: string
  attachment_placeholder: boolean
  read_status: boolean
}

export interface HabitLog {
  id: string
  client_id: string
  date: string
  steps: number
  water: number // liters
  protein: number // grams
  sleep_hours: number
  workout_completed: boolean
}

export interface SavedReply {
  id: string
  title: string
  body: string
  category: 'check_in' | 'motivation' | 'form' | 'logistics'
}

export interface Task {
  id: string
  client_id: string
  type: 'review_check_in' | 'update_workout' | 'reply_message' | 'start_program'
  label: string
  due: string
  priority: 'high' | 'medium' | 'low'
  completed: boolean
}

export interface ActivityEvent {
  id: string
  client_id: string
  type: 'check_in' | 'workout_complete' | 'message' | 'program_start' | 'adherence_drop'
  label: string
  timestamp: string
}

export type ScreenId =
  | 'dashboard'
  | 'clients'
  | 'client-detail'
  | 'workout-builder'
  | 'check-ins'
  | 'messages'
  | 'settings'

// ── New: Workout logging + PR tracking ──────────────────────────────────────
export interface SetLog {
  id: string
  workout_log_id: string
  exercise_name: string
  set_number: number
  reps: number
  weight: number // kg
  rpe?: number
  completed_at: string
}

export interface WorkoutLog {
  id: string
  client_id: string
  template_id?: string
  title: string
  duration_min: number
  completed_at: string
  total_sets: number
  total_reps: number
  estimated_volume: number
  notes?: string
  set_logs?: SetLog[]
}

export interface PersonalRecord {
  id: string
  client_id: string
  exercise_name: string
  weight: number
  reps: number
  estimated_1rm: number
  achieved_at: string
}

// ── New: Nutrition tracking ─────────────────────────────────────────────────
export interface MealEntry {
  id: string
  nutrition_log_id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  logged_at: string
}

export interface NutritionLog {
  id: string
  client_id: string
  date: string
  calorie_target: number
  protein_target: number
  carb_target: number
  fat_target: number
  calories: number
  protein: number
  carbs: number
  fat: number
  water: number
  meals?: MealEntry[]
  notes?: string
}
