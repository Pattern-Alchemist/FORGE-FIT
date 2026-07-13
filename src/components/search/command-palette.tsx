'use client'

import * as React from 'react'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Users, Dumbbell, Search, ArrowRight, Clock } from 'lucide-react'
import { useUIStore } from '@/lib/store'
import type { Client, WorkoutTemplate } from '@/lib/types'

interface SearchResults {
  clients: Array<{ id: string; fullName: string; avatar: string; goal: string; trainingPhase: string; status: string }>
  templates: Array<{ id: string; title: string; category: string; duration: number }>
  exercises: Array<{ id: string; name: string; muscleGroup: string; equipment: string }>
}

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [query, setQuery] = React.useState('')
  const [results, setResults] = React.useState<SearchResults>({ clients: [], templates: [], exercises: [] })
  const [loading, setLoading] = React.useState(false)
  const openClient = useUIStore((s) => s.openClient)
  const setBuilder = useUIStore((s) => s.setBuilder)
  const setScreen = useUIStore((s) => s.setScreen)

  // Debounced search
  React.useEffect(() => {
    if (!query.trim()) {
      setResults({ clients: [], templates: [], exercises: [] })
      return
    }
    setLoading(true)
    const id = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        if (res.ok) setResults(await res.json())
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }, 200)
    return () => clearTimeout(id)
  }, [query])

  const hasResults = results.clients.length > 0 || results.templates.length > 0 || results.exercises.length > 0

  const handleSelectClient = (clientId: string) => {
    openClient(clientId)
    onOpenChange(false)
  }
  const handleSelectTemplate = (templateId: string) => {
    setBuilder(templateId)
    setScreen('workout-builder')
    onOpenChange(false)
  }
  const handleNavigate = (screen: 'dashboard' | 'clients' | 'workout-builder' | 'check-ins' | 'messages' | 'settings') => {
    setScreen(screen)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden max-w-xl gap-0">
        <Command shouldFilter={false} className="rounded-lg">
          <div className="flex items-center border-b border-border/60 px-3">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder="Search clients, workouts, exercises…"
              className="flex-1 h-11 border-none focus:ring-0"
            />
            <kbd className="text-[10px] font-medium text-muted-foreground bg-muted rounded px-1.5 py-0.5">ESC</kbd>
          </div>
          <CommandList className="max-h-[400px] overflow-y-auto">
            {loading && <div className="py-6 text-center text-xs text-muted-foreground">Searching…</div>}
            {!loading && query && !hasResults && <CommandEmpty>No results found.</CommandEmpty>}
            {!query && (
              <CommandGroup heading="Quick Navigation">
                <CommandItem onSelect={() => handleNavigate('dashboard')} className="cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Search className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span className="flex-1">Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                </CommandItem>
                <CommandItem onSelect={() => handleNavigate('clients')} className="cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span className="flex-1">Clients</span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                </CommandItem>
                <CommandItem onSelect={() => handleNavigate('workout-builder')} className="cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Dumbbell className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span className="flex-1">Workout Builder</span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                </CommandItem>
              </CommandGroup>
            )}
            {results.clients.length > 0 && (
              <CommandGroup heading="Clients">
                {results.clients.map((c) => (
                  <CommandItem key={c.id} onSelect={() => handleSelectClient(c.id)} className="cursor-pointer">
                    <Avatar className="w-7 h-7 rounded-md shrink-0">
                      <AvatarFallback className="bg-muted text-foreground text-[10px] font-semibold rounded-md">
                        {c.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">{c.fullName}</div>
                      <div className="text-[10px] text-muted-foreground">{c.goal} · {c.trainingPhase}</div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {results.templates.length > 0 && (
              <>
                {results.clients.length > 0 && <CommandSeparator />}
                <CommandGroup heading="Workout Templates">
                  {results.templates.map((t) => (
                    <CommandItem key={t.id} onSelect={() => handleSelectTemplate(t.id)} className="cursor-pointer">
                      <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                        <Dumbbell className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">{t.title}</div>
                        <div className="text-[10px] text-muted-foreground">{t.category} · {t.duration} min</div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
            {results.exercises.length > 0 && (
              <>
                {(results.clients.length > 0 || results.templates.length > 0) && <CommandSeparator />}
                <CommandGroup heading="Exercises">
                  {results.exercises.map((e) => (
                    <CommandItem key={e.id} onSelect={() => { setScreen('workout-builder'); onOpenChange(false) }} className="cursor-pointer">
                      <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center shrink-0">
                        <Dumbbell className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">{e.name}</div>
                        <div className="text-[10px] text-muted-foreground">{e.muscleGroup} · {e.equipment}</div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
