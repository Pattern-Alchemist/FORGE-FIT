'use client'

import { Suspense } from 'react'
import { useUIStore } from '@/lib/store'
import { AppShell } from '@/components/app-shell'
import { Dashboard } from '@/components/screens/dashboard'
import { Clients } from '@/components/screens/clients'
import { ClientDetail } from '@/components/screens/client-detail'
import { WorkoutBuilder } from '@/components/screens/workout-builder'
import { CheckIns } from '@/components/screens/check-ins'
import { Messages } from '@/components/screens/messages'
import { Settings } from '@/components/screens/settings'

export default function Home() {
  const screen = useUIStore((s) => s.screen)

  return (
    <AppShell>
      <Suspense fallback={null}>
        {screen === 'dashboard' && <Dashboard />}
        {screen === 'clients' && <Clients />}
        {screen === 'client-detail' && <ClientDetail />}
        {screen === 'workout-builder' && <WorkoutBuilder />}
        {screen === 'check-ins' && <CheckIns />}
        {screen === 'messages' && <Messages />}
        {screen === 'settings' && <Settings />}
      </Suspense>
    </AppShell>
  )
}
