'use client'

import * as React from 'react'
import { useSession } from 'next-auth/react'
import { Suspense } from 'react'
import { useUIStore } from '@/lib/store'
import { AppShell } from '@/components/app-shell'
import { LoginScreen } from '@/components/auth/login-screen'
import { ClientMobileApp } from '@/components/client-mobile/app'
import { Dashboard } from '@/components/screens/dashboard'
import { Clients } from '@/components/screens/clients'
import { ClientDetail } from '@/components/screens/client-detail'
import { WorkoutBuilder } from '@/components/screens/workout-builder'
import { CheckIns } from '@/components/screens/check-ins'
import { Messages } from '@/components/screens/messages'
import { Settings } from '@/components/screens/settings'
import { Flame } from 'lucide-react'

export default function Home() {
  const { data: session, status } = useSession()

  // Loading state — show minimal splash while NextAuth resolves session
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Flame className="w-6 h-6 text-primary-foreground animate-pulse" />
            </div>
            <div className="absolute -inset-2 rounded-xl bg-primary/20 blur-lg -z-10" />
          </div>
          <p className="text-xs text-muted-foreground">Loading Forge…</p>
        </div>
      </div>
    )
  }

  // Unauthenticated → login screen
  if (!session || !session.user) {
    return <LoginScreen />
  }

  // Client role → client mobile app
  if (session.user.role === 'client') {
    return <ClientMobileApp />
  }

  // Coach role → coach dashboard (existing app)
  return <CoachApp />
}

function CoachApp() {
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
