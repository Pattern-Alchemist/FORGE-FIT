'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, MessageSquare, Pencil } from 'lucide-react'
import { useUIStore } from '@/lib/store'
import { useClient, useCheckIns, useMessages, useClientProgram } from '@/lib/hooks'
import { StatusTag, GoalTag, PhaseTag, AdherenceRing, EmptyState } from '@/components/shared'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { ClientOverviewTab } from '@/components/client-detail/overview-tab'
import { ClientWorkoutsTab } from '@/components/client-detail/workouts-tab'
import { ClientCheckInsTab } from '@/components/client-detail/checkins-tab'
import { ClientProgressTab } from '@/components/client-detail/progress-tab'
import { ClientNotesTab } from '@/components/client-detail/notes-tab'
import { ClientChatTab } from '@/components/client-detail/chat-tab'
import { Dumbbell } from 'lucide-react'
import { differenceInWeeks } from 'date-fns'

type Tab = 'overview' | 'workouts' | 'check-ins' | 'progress' | 'notes' | 'chat'

export function ClientDetail() {
  const selectedId = useUIStore((s) => s.selectedClientId)
  const tab = useUIStore((s) => s.clientDetailTab)
  const setTab = useUIStore((s) => s.setClientDetailTab)
  const setScreen = useUIStore((s) => s.setScreen)
  const openConversation = useUIStore((s) => s.openConversation)

  const { data: client, isLoading } = useClient(selectedId)
  const { data: checkIns = [] } = useCheckIns(selectedId)
  const { data: messages = [] } = useMessages(selectedId)
  const { data: program } = useClientProgram(selectedId)

  if (isLoading) {
    return (
      <div className="px-4 lg:px-8 py-8 max-w-[1400px] mx-auto">
        <Skeleton className="h-4 w-24 mb-5" />
        <div className="flex gap-5 mb-6">
          <Skeleton className="w-20 h-20 rounded-2xl" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-3 w-72" />
            <Skeleton className="h-3 w-56" />
          </div>
        </div>
        <Skeleton className="h-10 w-full mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!client) {
    return (
      <div className="px-4 lg:px-8 py-8 max-w-[1400px] mx-auto">
        <EmptyState
          icon={Dumbbell}
          title="No client selected"
          description="Pick a client from the list to see their full operating view."
          action={<Button onClick={() => setScreen('clients')}>Go to Clients</Button>}
        />
      </div>
    )
  }

  const unread = messages.filter((m) => !m.read_status && m.sender_type === 'client').length
  const pendingCi = checkIns.filter((ci) => ci.status === 'pending').length
  const weeksSinceJoin = differenceInWeeks(new Date(), new Date(client.join_date))

  return (
    <div className="pb-20 lg:pb-0">
      {/* Hero */}
      <div className="surface-gradient border-b border-border/60">
        <div className="px-4 lg:px-8 py-5 lg:py-7 max-w-[1400px] mx-auto">
          <div className="flex items-center justify-between gap-3 mb-5">
            <button
              onClick={() => setScreen('clients')}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors tap-smooth"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Clients</span>
            </button>
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="sm" className="gap-1.5 h-8" onClick={() => openConversation(client.id)}>
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Message</span>
                {unread > 0 && (
                  <span className="ml-1 text-[10px] bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 font-bold">
                    {unread}
                  </span>
                )}
              </Button>
              <Button size="sm" className="gap-1.5 h-8">
                <Pencil className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
            </div>
          </div>

          {/* Hero content */}
          <div className="flex flex-col lg:flex-row lg:items-start gap-5 lg:gap-8">
            <div className="flex items-start gap-4 lg:gap-5 flex-1 min-w-0">
              <Avatar className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl shrink-0 ring-2 ring-background shadow-sm">
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-lg lg:text-xl font-semibold rounded-2xl">
                  {client.avatar}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h1 className="text-display text-xl lg:text-2xl text-foreground">{client.full_name}</h1>
                  <StatusTag status={client.status} />
                </div>
                <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground mb-3">
                  <span>{client.age}y · {client.gender === 'M' ? 'Male' : client.gender === 'F' ? 'Female' : 'Non-binary'}</span>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                  <span>Client {weeksSinceJoin}w</span>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                  <GoalTag goal={client.goal} />
                  <PhaseTag phase={client.training_phase} />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {client.tags.map((t) => (
                    <Badge key={t} variant="outline" className="bg-primary/5 border-primary/20 text-primary text-[10px] font-medium">
                      {t}
                    </Badge>
                  ))}
                </div>
                {client.injuries_limitations.length > 0 && (
                  <div className="mt-3 inline-flex items-start gap-1.5 text-xs text-warning-foreground bg-warning/10 border border-warning/20 rounded-md px-2 py-1.5">
                    <span className="font-medium">⚠ Injuries:</span>
                    <span>{client.injuries_limitations.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Adherence + Next Action */}
            <div className="grid grid-cols-2 lg:flex lg:flex-col gap-3 lg:gap-4 lg:w-[260px]">
              <div className="card-premium rounded-xl p-4 flex items-center gap-3">
                <AdherenceRing score={client.adherence_score} size={52} stroke={5} />
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Adherence</div>
                  <div className="text-lg font-semibold tabular-nums text-foreground">{client.adherence_score}%</div>
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    {client.weekly_streak}w streak
                  </div>
                </div>
              </div>
              {client.next_action && (
                <button
                  onClick={() => {
                    if (client.next_action?.type === 'reply_message') openConversation(client.id)
                    else if (client.next_action?.type === 'update_workout') setScreen('workout-builder')
                  }}
                  className="card-premium rounded-xl p-4 text-left hover:border-primary/30 transition-colors tap-smooth"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
                      <MessageSquare className="w-3.5 h-3.5 text-primary-foreground" />
                    </div>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Next Action</span>
                  </div>
                  <div className="text-xs font-medium text-foreground leading-snug mb-1">{client.next_action.label}</div>
                  <div className="text-[11px] text-primary font-medium">Due {client.next_action.due}</div>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 lg:px-8 py-5 lg:py-7 max-w-[1400px] mx-auto">
        <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
          <TabsList className="bg-muted/60 h-10 p-1 rounded-lg overflow-x-auto scrollbar-none">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="workouts" className="text-xs">Workouts</TabsTrigger>
            <TabsTrigger value="check-ins" className="text-xs">
              Check-ins
              {pendingCi > 0 && (
                <span className="ml-1.5 text-[9px] bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 font-bold">
                  {pendingCi}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="progress" className="text-xs">Progress</TabsTrigger>
            <TabsTrigger value="notes" className="text-xs">Notes</TabsTrigger>
            <TabsTrigger value="chat" className="text-xs">
              Chat
              {unread > 0 && (
                <span className="ml-1.5 text-[9px] bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 font-bold">
                  {unread}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-5"><ClientOverviewTab client={client} program={program} checkIns={checkIns} /></TabsContent>
          <TabsContent value="workouts" className="mt-5"><ClientWorkoutsTab clientId={client.id} /></TabsContent>
          <TabsContent value="check-ins" className="mt-5"><ClientCheckInsTab clientId={client.id} /></TabsContent>
          <TabsContent value="progress" className="mt-5"><ClientProgressTab checkIns={checkIns} /></TabsContent>
          <TabsContent value="notes" className="mt-5"><ClientNotesTab client={client} /></TabsContent>
          <TabsContent value="chat" className="mt-5"><ClientChatTab clientId={client.id} /></TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
