'use client'

/**
 * Forge — Client mobile app
 *
 * The consumer-facing experience for clients. Designed mobile-first:
 *   - Single column, max-width 480px (centered on desktop)
 *   - Bottom nav with 4 tabs (Home, Workout, Check-in, Messages)
 *   - 44px+ tap targets
 *   - One primary CTA per screen
 *   - Thumb-friendly layout
 *
 * The coach console and client app share the same DB and design system,
 * but the client app is intentionally simpler — it surfaces only what
 * the client needs right now.
 */
import * as React from 'react'
import { useTheme } from 'next-themes'
import { Home, Dumbbell, ClipboardCheck, MessageSquare, Flame, Sun, Moon, TrendingUp, Apple } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { ClientHome } from './home'
import { ClientWorkout } from './workout'
import { ClientCheckIn } from './check-in-form'
import { ClientMessages } from './messages'
import { ClientProgress } from './progress'
import { ClientNutrition } from './nutrition'

export type Tab = 'home' | 'workout' | 'progress' | 'nutrition' | 'check-in' | 'messages'

export function ClientMobileApp() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [tab, setTab] = React.useState<Tab>('home')
  const [activeWorkoutId, setActiveWorkoutId] = React.useState<string | null>(null)
  React.useEffect(() => setMounted(true), [])

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'workout', label: 'Workout', icon: Dumbbell },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'nutrition', label: 'Food', icon: Apple },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
  ]

  const startWorkout = (templateId: string) => {
    setActiveWorkoutId(templateId)
    setTab('workout')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-[480px] mx-auto relative">
      {/* Top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 h-14 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Flame className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="text-[15px] font-semibold tracking-tight">Forge</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted tap-smooth"
            aria-label="Toggle theme"
          >
            {mounted && theme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
          </button>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted tap-smooth text-xs font-medium"
            aria-label="Sign out"
          >
            Exit
          </button>
        </div>
      </header>

      {/* Screen content */}
      <main className="flex-1 pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab + (activeWorkoutId ?? '')}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            {tab === 'home' && <ClientHome onStartWorkout={startWorkout} onNavigate={setTab} />}
            {tab === 'workout' && (
              <ClientWorkout
                templateId={activeWorkoutId}
                onClearActive={() => setActiveWorkoutId(null)}
                onNavigate={setTab}
              />
            )}
            {tab === 'progress' && <ClientProgress onNavigate={setTab} />}
            {tab === 'nutrition' && <ClientNutrition onNavigate={setTab} />}
            {tab === 'check-in' && <ClientCheckIn onNavigate={setTab} />}
            {tab === 'messages' && <ClientMessages />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom nav */}
      <nav
        className="fixed bottom-0 inset-x-0 max-w-[480px] mx-auto z-40 bg-background/95 backdrop-blur-xl border-t border-border/60"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="grid grid-cols-5 h-16">
          {tabs.map((t) => {
            const Icon = t.icon
            const active = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => {
                  if (t.id === 'workout' && !activeWorkoutId) {
                    // No active workout — just go to workout list view
                  }
                  setTab(t.id)
                }}
                className={cn(
                  'relative flex flex-col items-center justify-center gap-0.5 tap-smooth min-h-[44px]',
                  active ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                <Icon className="w-[22px] h-[22px]" strokeWidth={active ? 2.5 : 2} />
                <span className="text-[10px] font-medium tracking-tight">{t.label}</span>
                {active && <span className="absolute top-0 w-8 h-0.5 rounded-full bg-primary" />}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
