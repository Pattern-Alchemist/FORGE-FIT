'use client'

import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import type { ScreenId, Client, WorkoutTemplate, WorkoutBlock, CheckIn, Message, Task } from './types'
import {
  coach as seedCoach,
  clients as seedClients,
  programs as seedPrograms,
  workoutTemplates as seedTemplates,
  exercises as seedExercises,
  checkIns as seedCheckIns,
  messages as seedMessages,
  habitLogs as seedHabitLogs,
  savedReplies as seedSavedReplies,
  tasks as seedTasks,
  activityEvents as seedActivityEvents,
} from './data'

interface AppState {
  // Navigation
  screen: ScreenId
  selectedClientId: string | null
  selectedConversationId: string | null
  setScreen: (s: ScreenId) => void
  openClient: (clientId: string) => void
  openConversation: (clientId: string) => void

  // Data
  coach: typeof seedCoach
  clients: Client[]
  programs: typeof seedPrograms
  templates: WorkoutTemplate[]
  exercises: typeof seedExercises
  checkIns: CheckIn[]
  messages: Message[]
  habitLogs: typeof seedHabitLogs
  savedReplies: typeof seedSavedReplies
  tasks: Task[]
  activityEvents: typeof seedActivityEvents

  // Workout builder state
  builderWorkout: WorkoutTemplate | null
  builderDraftBlocks: WorkoutBlock[]
  builderTitle: string
  builderCategory: string
  setBuilder: (templateId: string | null) => void
  addBlock: (block: WorkoutBlock) => void
  moveBlock: (from: number, to: number) => void
  removeBlock: (blockId: string) => void
  updateBlock: (blockId: string, patch: Partial<WorkoutBlock>) => void
  setBuilderTitle: (t: string) => void
  setBuilderCategory: (c: string) => void
  saveTemplate: () => void

  // Task completion
  toggleTask: (taskId: string) => void

  // Send message (local)
  sendMessage: (clientId: string, text: string) => void

  // Theme
  theme: 'light' | 'dark' | 'system'
  setTheme: (t: 'light' | 'dark' | 'system') => void
}

export const useStore = create<AppState>((set, get) => ({
  // Navigation
  screen: 'dashboard',
  selectedClientId: null,
  selectedConversationId: null,
  setScreen: (s) => set({ screen: s }),
  openClient: (clientId) => set({ screen: 'client-detail', selectedClientId: clientId }),
  openConversation: (clientId) =>
    set({ screen: 'messages', selectedConversationId: clientId }),

  // Data (seeded)
  coach: seedCoach,
  clients: seedClients,
  programs: seedPrograms,
  templates: seedTemplates,
  exercises: seedExercises,
  checkIns: seedCheckIns,
  messages: seedMessages,
  habitLogs: seedHabitLogs,
  savedReplies: seedSavedReplies,
  tasks: seedTasks,
  activityEvents: seedActivityEvents,

  // Workout builder
  builderWorkout: null,
  builderDraftBlocks: [],
  builderTitle: 'Untitled Workout',
  builderCategory: 'Strength',
  setBuilder: (templateId) => {
    if (!templateId) {
      set({
        builderWorkout: null,
        builderDraftBlocks: [],
        builderTitle: 'Untitled Workout',
        builderCategory: 'Strength',
      })
      return
    }
    const t = get().templates.find((x) => x.id === templateId)
    if (t) {
      set({
        builderWorkout: t,
        builderDraftBlocks: t.blocks.map((b) => ({ ...b, exercises: [...b.exercises] })),
        builderTitle: t.title,
        builderCategory: t.category,
      })
    }
  },
  addBlock: (block) => set((s) => ({ builderDraftBlocks: [...s.builderDraftBlocks, block] })),
  moveBlock: (from, to) =>
    set((s) => {
      const next = [...s.builderDraftBlocks]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return { builderDraftBlocks: next }
    }),
  removeBlock: (blockId) =>
    set((s) => ({ builderDraftBlocks: s.builderDraftBlocks.filter((b) => b.id !== blockId) })),
  updateBlock: (blockId, patch) =>
    set((s) => ({
      builderDraftBlocks: s.builderDraftBlocks.map((b) =>
        b.id === blockId ? { ...b, ...patch } : b,
      ),
    })),
  setBuilderTitle: (t) => set({ builderTitle: t }),
  setBuilderCategory: (c) => set({ builderCategory: c }),
  saveTemplate: () => {
    const s = get()
    const newTemplate: WorkoutTemplate = {
      id: `wt-${Date.now()}`,
      title: s.builderTitle || 'Untitled Workout',
      category: s.builderCategory,
      duration: 60,
      blocks: s.builderDraftBlocks,
      created_at: new Date().toISOString(),
    }
    set({ templates: [newTemplate, ...s.templates] })
  },

  toggleTask: (taskId) =>
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t,
      ),
    })),

  sendMessage: (clientId, text) =>
    set((s) => ({
      messages: [
        ...s.messages,
        {
          id: `msg-${Date.now()}`,
          client_id: clientId,
          sender_type: 'coach',
          message_text: text,
          created_at: new Date().toISOString(),
          attachment_placeholder: false,
          read_status: true,
        },
      ],
    })),

  theme: 'system',
  setTheme: (t) => set({ theme: t }),
}))

// Selector helpers — use useShallow for array-returning selectors to prevent infinite loops
export const useClient = (clientId: string | null) =>
  useStore((s) => (clientId ? s.clients.find((c) => c.id === clientId) ?? null : null))

export const useClientCheckIns = (clientId: string | null) =>
  useStore(
    useShallow((s) =>
      clientId ? s.checkIns.filter((ci) => ci.client_id === clientId) : [],
    ),
  )

export const useClientMessages = (clientId: string | null) =>
  useStore(
    useShallow((s) =>
      clientId ? s.messages.filter((m) => m.client_id === clientId) : [],
    ),
  )

export const useClientProgram = (clientId: string | null) =>
  useStore((s) => {
    if (!clientId) return null
    return s.programs.find((p) => p.client_id === clientId) ?? null
  })
