'use client'

/**
 * Forge — UI-only Zustand store
 *
 * Production architecture: this store holds ONLY transient UI state.
 * Persistent domain data lives in the DB and is accessed via React Query
 * hooks (see src/lib/hooks). Mutations go through server actions.
 *
 * What lives here:
 *   - Navigation state (mirrored to URL search params, see url-state.ts)
 *   - Workout builder draft (transient editing state before save)
 *   - Filter/sort preferences on list screens
 *
 * What does NOT live here anymore:
 *   - Clients, programs, templates, check-ins, messages, etc.
 *     (use useClients(), useClient(id), useCheckIns(id), etc.)
 *   - Task completion (use toggleTaskAction server action)
 *   - Send message (use sendMessageAction server action)
 */
import { create } from 'zustand'
import type { WorkoutBlock } from '@/lib/types'

// Helper: read URL search params synchronously (client-only).
// On SSR or first paint before hydration, returns null.
function readUrlState() {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  const screen = params.get('screen')
  const client = params.get('client')
  const conversation = params.get('conversation')
  const tab = params.get('tab')
  return { screen, client, conversation, tab }
}

type Screen = 'dashboard' | 'clients' | 'client-detail' | 'workout-builder' | 'check-ins' | 'messages' | 'settings'
type Tab = 'overview' | 'workouts' | 'check-ins' | 'progress' | 'notes' | 'chat'

const VALID_SCREENS: Screen[] = ['dashboard', 'clients', 'client-detail', 'workout-builder', 'check-ins', 'messages', 'settings']
const VALID_TABS: Tab[] = ['overview', 'workouts', 'check-ins', 'progress', 'notes', 'chat']

// Initialize from URL on first client render so deep-links work
function getInitialScreen(): Screen {
  const url = readUrlState()
  if (url?.screen && VALID_SCREENS.includes(url.screen as Screen)) return url.screen as Screen
  return 'dashboard'
}
function getInitialClientId(): string | null {
  return readUrlState()?.client ?? null
}
function getInitialConversationId(): string | null {
  return readUrlState()?.conversation ?? null
}
function getInitialTab(): Tab {
  const url = readUrlState()
  if (url?.tab && VALID_TABS.includes(url.tab as Tab)) return url.tab as Tab
  return 'overview'
}

interface UIState {
  // ── Navigation (mirrored to URL) ────────────────────────────────────────
  screen: Screen
  selectedClientId: string | null
  selectedConversationId: string | null
  clientDetailTab: Tab
  setScreen: (s: Screen) => void
  openClient: (clientId: string, tab?: Tab) => void
  openConversation: (clientId: string | null) => void
  setClientDetailTab: (t: Tab) => void

  // ── Workout builder draft (transient) ───────────────────────────────────
  builderTemplateId: string | null
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

  // ── List screen filters (transient) ─────────────────────────────────────
  clientsSearch: string
  clientsStatusFilter: 'all' | 'active' | 'paused' | 'completed'
  clientsGoalFilter: string | 'all'
  clientsSortBy: 'recent' | 'name' | 'adherence'
  setClientsSearch: (s: string) => void
  setClientsStatusFilter: (f: UIState['clientsStatusFilter']) => void
  setClientsGoalFilter: (g: string | 'all') => void
  setClientsSortBy: (s: UIState['clientsSortBy']) => void
}

export const useUIStore = create<UIState>((set) => ({
  // Navigation — initialized from URL on client
  screen: getInitialScreen(),
  selectedClientId: getInitialClientId(),
  selectedConversationId: getInitialConversationId(),
  clientDetailTab: getInitialTab(),
  setScreen: (s) => set({ screen: s }),
  openClient: (clientId, tab) =>
    set({ screen: 'client-detail', selectedClientId: clientId, clientDetailTab: tab ?? 'overview' }),
  openConversation: (clientId) =>
    set({ screen: 'messages', selectedConversationId: clientId }),
  setClientDetailTab: (t) => set({ clientDetailTab: t }),

  // Builder
  builderTemplateId: null,
  builderDraftBlocks: [],
  builderTitle: 'Untitled Workout',
  builderCategory: 'Strength',
  setBuilder: (templateId) => {
    set({
      builderTemplateId: templateId,
      builderDraftBlocks: [],
      builderTitle: 'Untitled Workout',
      builderCategory: 'Strength',
    })
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

  // List filters
  clientsSearch: '',
  clientsStatusFilter: 'all',
  clientsGoalFilter: 'all',
  clientsSortBy: 'recent',
  setClientsSearch: (s) => set({ clientsSearch: s }),
  setClientsStatusFilter: (f) => set({ clientsStatusFilter: f }),
  setClientsGoalFilter: (g) => set({ clientsGoalFilter: g }),
  setClientsSortBy: (s) => set({ clientsSortBy: s }),
}))
