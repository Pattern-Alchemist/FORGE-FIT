/**
 * Forge — API fetchers (client-side)
 *
 * Thin wrappers around fetch() that hit our /api/* routes. Used by React Query.
 * Centralized here so endpoint paths live in one place.
 */

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${res.statusText}`)
  }
  return res.json() as Promise<T>
}

import type {
  Coach,
  Client,
  Program,
  WorkoutTemplate,
  Exercise,
  CheckIn,
  Message,
  SavedReply,
  Task,
  ActivityEvent,
} from '@/lib/types'

export const api = {
  coach: () => fetchJson<Coach | null>('/api/coach'),
  clients: () => fetchJson<Client[]>('/api/clients'),
  client: (id: string) => fetchJson<Client | null>(`/api/clients?id=${encodeURIComponent(id)}`),
  program: (clientId: string) => fetchJson<Program | null>(`/api/program?clientId=${encodeURIComponent(clientId)}`),
  templates: () => fetchJson<WorkoutTemplate[]>('/api/templates'),
  template: (id: string) => fetchJson<WorkoutTemplate | null>(`/api/templates?id=${encodeURIComponent(id)}`),
  exercises: () => fetchJson<Exercise[]>('/api/exercises'),
  checkIns: (clientId: string) => fetchJson<CheckIn[]>(`/api/check-ins?clientId=${encodeURIComponent(clientId)}`),
  messages: (clientId: string) => fetchJson<Message[]>(`/api/messages?clientId=${encodeURIComponent(clientId)}`),
  savedReplies: () => fetchJson<SavedReply[]>('/api/saved-replies'),
  tasks: () => fetchJson<Task[]>('/api/tasks'),
  activity: () => fetchJson<ActivityEvent[]>('/api/activity'),
  stats: () =>
    fetchJson<{
      activeClients: number
      workoutsDueToday: number
      pendingCheckIns: number
      unreadMessages: number
      avgAdherence: number
    }>('/api/stats'),

  // Client-side endpoints (scoped to the logged-in client)
  clientHome: () =>
    fetchJson<{
      adherenceScore: number
      weeklyStreak: number
      unreadMessages: number
      workoutDueToday: boolean
      nextActionLabel: string | null
      nextActionDue: string | null
    }>('/api/client/home'),
  clientWorkouts: () => fetchJson<WorkoutTemplate[]>('/api/client/workouts'),
  clientCheckIns: () => fetchJson<CheckIn[]>('/api/client/checkins'),
  clientMessages: () => fetchJson<Message[]>('/api/client/messages'),
  clientCoach: () =>
    fetchJson<{ id: string; name: string; avatar: string; businessName: string } | null>(
      '/api/client/coach',
    ),
  clientProfile: () => fetchJson<Client | null>('/api/client/profile'),
}
