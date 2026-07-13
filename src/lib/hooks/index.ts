'use client'

/**
 * Forge — React Query hooks for server data
 *
 * Single entry point for all data reads. Each hook wires React Query caching
 * to the API fetchers in src/lib/api-client, which hit our /api/* routes.
 *
 * Mutations use server actions directly (see src/lib/actions) and call
 * queryClient.invalidateQueries() to refresh.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import {
  toggleTaskAction,
  sendMessageAction,
  reviewCheckInAction,
  saveWorkoutTemplateAction,
  assignTemplateAction,
} from '@/lib/actions'
import type {
  AssignTemplateInput,
  MessageInput,
  TaskToggle,
  CheckInReview,
  WorkoutTemplateInput,
} from '@/lib/schemas'

// Query keys
export const qk = {
  coach: ['coach'] as const,
  clients: ['clients'] as const,
  client: (id: string) => ['client', id] as const,
  clientProgram: (id: string) => ['client-program', id] as const,
  templates: ['templates'] as const,
  template: (id: string) => ['template', id] as const,
  exerciseLibrary: ['exercise-library'] as const,
  checkIns: (clientId: string) => ['check-ins', clientId] as const,
  messages: (clientId: string) => ['messages', clientId] as const,
  savedReplies: ['saved-replies'] as const,
  tasks: ['tasks'] as const,
  activity: ['activity'] as const,
  dashboardStats: ['dashboard-stats'] as const,
}

// ────────────────────────────────────────────────────────────────────────────
// Read hooks
// ────────────────────────────────────────────────────────────────────────────
export function useCoach() {
  return useQuery({ queryKey: qk.coach, queryFn: api.coach })
}

export function useClients() {
  return useQuery({ queryKey: qk.clients, queryFn: api.clients })
}

export function useClient(clientId: string | null) {
  return useQuery({
    queryKey: clientId ? qk.client(clientId) : ['client', 'none'],
    queryFn: () => (clientId ? api.client(clientId) : Promise.resolve(null)),
    enabled: !!clientId,
  })
}

export function useClientProgram(clientId: string | null) {
  return useQuery({
    queryKey: clientId ? qk.clientProgram(clientId) : ['client-program', 'none'],
    queryFn: () => (clientId ? api.program(clientId) : Promise.resolve(null)),
    enabled: !!clientId,
  })
}

export function useWorkoutTemplates() {
  return useQuery({ queryKey: qk.templates, queryFn: api.templates })
}

export function useWorkoutTemplate(templateId: string | null) {
  return useQuery({
    queryKey: templateId ? qk.template(templateId) : ['template', 'none'],
    queryFn: () => (templateId ? api.template(templateId) : Promise.resolve(null)),
    enabled: !!templateId,
  })
}

export function useExerciseLibrary() {
  return useQuery({ queryKey: qk.exerciseLibrary, queryFn: api.exercises })
}

export function useCheckIns(clientId: string | null) {
  return useQuery({
    queryKey: clientId ? qk.checkIns(clientId) : ['check-ins', 'none'],
    queryFn: () => (clientId ? api.checkIns(clientId) : Promise.resolve([])),
    enabled: !!clientId,
  })
}

export function useMessages(clientId: string | null) {
  return useQuery({
    queryKey: clientId ? qk.messages(clientId) : ['messages', 'none'],
    queryFn: () => (clientId ? api.messages(clientId) : Promise.resolve([])),
    enabled: !!clientId,
  })
}

export function useSavedReplies() {
  return useQuery({ queryKey: qk.savedReplies, queryFn: api.savedReplies })
}

export function useTasks() {
  return useQuery({ queryKey: qk.tasks, queryFn: api.tasks })
}

export function useActivityEvents() {
  return useQuery({ queryKey: qk.activity, queryFn: api.activity })
}

export function useDashboardStats() {
  return useQuery({ queryKey: qk.dashboardStats, queryFn: api.stats })
}

// ────────────────────────────────────────────────────────────────────────────
// Mutation hooks
// ────────────────────────────────────────────────────────────────────────────
export function useToggleTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: TaskToggle) => toggleTaskAction(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.tasks })
    },
  })
}

export function useSendMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: MessageInput) => sendMessageAction(input),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: qk.messages(vars.clientId) })
    },
  })
}

export function useReviewCheckIn() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CheckInReview) => reviewCheckInAction(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['check-ins'] })
    },
  })
}

export function useSaveWorkoutTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: WorkoutTemplateInput & { id?: string }) => saveWorkoutTemplateAction(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.templates })
    },
  })
}

export function useAssignTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: AssignTemplateInput) => assignTemplateAction(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.templates })
      qc.invalidateQueries({ queryKey: ['client-program'] })
    },
  })
}

// ────────────────────────────────────────────────────────────────────────────
// Client-side hooks (for the client mobile app)
// ────────────────────────────────────────────────────────────────────────────
import {
  clientSendMessageAction,
  submitCheckInAction,
  logWorkoutCompletionAction,
  markMessagesReadAction,
} from '@/lib/actions'
import type { CheckInInput } from '@/lib/schemas'

export const clientQk = {
  home: ['client-home'] as const,
  workouts: ['client-workouts'] as const,
  checkIns: ['client-check-ins'] as const,
  messages: ['client-messages'] as const,
  coach: ['client-coach'] as const,
  profile: ['client-profile'] as const,
}

export function useClientHomeStats() {
  return useQuery({
    queryKey: clientQk.home,
    queryFn: () => api.clientHome(),
  })
}

export function useClientWorkouts() {
  return useQuery({ queryKey: clientQk.workouts, queryFn: api.clientWorkouts })
}

export function useClientCheckIns() {
  return useQuery({ queryKey: clientQk.checkIns, queryFn: api.clientCheckIns })
}

export function useClientMessages() {
  return useQuery({ queryKey: clientQk.messages, queryFn: api.clientMessages })
}

export function useClientCoach() {
  return useQuery({ queryKey: clientQk.coach, queryFn: api.clientCoach })
}

export function useClientProfile() {
  return useQuery({ queryKey: clientQk.profile, queryFn: api.clientProfile })
}

// Client mutations
export function useClientSendMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: { messageText: string }) => clientSendMessageAction({ clientId: '', ...input }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: clientQk.messages })
    },
  })
}

export function useSubmitCheckIn() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CheckInInput) => submitCheckInAction(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: clientQk.checkIns })
      qc.invalidateQueries({ queryKey: clientQk.home })
    },
  })
}

export function useLogWorkout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: { workoutTemplateId: string; durationMin: number }) =>
      logWorkoutCompletionAction(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: clientQk.home })
      qc.invalidateQueries({ queryKey: clientQk.workouts })
    },
  })
}

export function useMarkMessagesRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => markMessagesReadAction(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: clientQk.messages })
      qc.invalidateQueries({ queryKey: clientQk.home })
    },
  })
}

// ────────────────────────────────────────────────────────────────────────────
// Workout logs + PRs + Nutrition (client mobile app)
// ────────────────────────────────────────────────────────────────────────────
import {
  logWorkoutWithSetsAction,
  logMealAction,
  deleteMealAction,
} from '@/lib/actions'

export const clientQkExt = {
  workoutLogs: ['client-workout-logs'] as const,
  prs: ['client-prs'] as const,
  nutrition: ['client-nutrition'] as const,
  nutritionHistory: ['client-nutrition-history'] as const,
}

export function useClientWorkoutLogs() {
  return useQuery({ queryKey: clientQkExt.workoutLogs, queryFn: api.clientWorkoutLogs })
}

export function useClientPRs() {
  return useQuery({ queryKey: clientQkExt.prs, queryFn: api.clientPRs })
}

export function useClientNutrition(date?: string) {
  return useQuery({
    queryKey: [...clientQkExt.nutrition, date ?? 'today'],
    queryFn: () => api.clientNutrition(date),
  })
}

export function useClientNutritionHistory(days = 7) {
  return useQuery({
    queryKey: [...clientQkExt.nutritionHistory, days],
    queryFn: () => api.clientNutritionHistory(days),
  })
}

export function useLogWorkoutWithSets() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      templateId: string | null
      title: string
      durationMin: number
      setLogs: { exerciseName: string; setNumber: number; reps: number; weight: number; rpe?: number }[]
    }) => logWorkoutWithSetsAction(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: clientQkExt.workoutLogs })
      qc.invalidateQueries({ queryKey: clientQkExt.prs })
      qc.invalidateQueries({ queryKey: clientQk.home })
    },
  })
}

export function useLogMeal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: { name: string; calories: number; protein: number; carbs: number; fat: number }) =>
      logMealAction(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: clientQkExt.nutrition })
    },
  })
}

export function useDeleteMeal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: { mealId: string }) => deleteMealAction(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: clientQkExt.nutrition })
    },
  })
}

