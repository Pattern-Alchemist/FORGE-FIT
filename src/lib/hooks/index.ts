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
