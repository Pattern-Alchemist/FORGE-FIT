'use client'

/**
 * Forge — URL state synchronization
 *
 * The store self-hydrates from URL on first client render (see store.ts).
 * This hook handles two-way sync after mount:
 *   - URL → store: when user hits back/forward
 *   - Store → URL: when user navigates within the app
 *
 * Why search params instead of App Router paths like /clients/[id]?
 * The sandbox preview only exposes the `/` route. Using search params keeps
 * the app sandbox-compatible while remaining production-grade — migrating to
 * real routes later is a 1:1 mapping (e.g. `?screen=client-detail&client=cl1`
 * → `/clients/cl1`).
 */

import { useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useUIStore } from '@/lib/store'

const VALID_SCREENS = ['dashboard', 'clients', 'client-detail', 'workout-builder', 'check-ins', 'messages', 'settings'] as const
const VALID_TABS = ['overview', 'workouts', 'check-ins', 'progress', 'notes', 'chat'] as const

export function useUrlStateSync() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const screen = useUIStore((s) => s.screen)
  const selectedClientId = useUIStore((s) => s.selectedClientId)
  const selectedConversationId = useUIStore((s) => s.selectedConversationId)
  const clientDetailTab = useUIStore((s) => s.clientDetailTab)
  const setScreen = useUIStore((s) => s.setScreen)
  const openClient = useUIStore((s) => s.openClient)
  const openConversation = useUIStore((s) => s.openConversation)
  const setClientDetailTab = useUIStore((s) => s.setClientDetailTab)

  // URL → store: when user navigates back/forward (searchParams change)
  useEffect(() => {
    const urlScreen = searchParams.get('screen') as typeof VALID_SCREENS[number] | null
    const urlClient = searchParams.get('client')
    const urlConv = searchParams.get('conversation')
    const urlTab = searchParams.get('tab') as typeof VALID_TABS[number] | null

    const effectiveScreen = urlScreen && VALID_SCREENS.includes(urlScreen) ? urlScreen : 'dashboard'
    if (effectiveScreen !== screen) {
      setScreen(effectiveScreen)
    }
    if (effectiveScreen === 'client-detail' && urlClient && urlClient !== selectedClientId) {
      openClient(urlClient, urlTab && VALID_TABS.includes(urlTab) ? urlTab : 'overview')
    } else if (effectiveScreen === 'messages' && urlConv && urlConv !== selectedConversationId) {
      openConversation(urlConv)
    }
    if (urlTab && VALID_TABS.includes(urlTab) && urlTab !== clientDetailTab) {
      setClientDetailTab(urlTab)
    }
  }, [searchParams])

  // Store → URL: when user navigates within the app
  useEffect(() => {
    const params = new URLSearchParams()
    if (screen !== 'dashboard') params.set('screen', screen)
    if (screen === 'client-detail' && selectedClientId) {
      params.set('client', selectedClientId)
      if (clientDetailTab !== 'overview') params.set('tab', clientDetailTab)
    }
    if (screen === 'messages' && selectedConversationId) {
      params.set('conversation', selectedConversationId)
    }
    const qs = params.toString()
    const newUrl = qs ? `${pathname}?${qs}` : pathname
    const currentUrl = window.location.pathname + (window.location.search || '')
    if (currentUrl !== newUrl) {
      router.replace(newUrl, { scroll: false })
    }
  }, [screen, selectedClientId, selectedConversationId, clientDetailTab, pathname, router])
}
