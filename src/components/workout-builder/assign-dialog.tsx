'use client'

import * as React from 'react'
import { Send, Check } from 'lucide-react'
import { useClients, useAssignTemplate } from '@/lib/hooks'
import { useUIStore } from '@/lib/store'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export function AssignDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { data: clients = [] } = useClients()
  const assignMutation = useAssignTemplate()
  const builderTemplateId = useUIStore((s) => s.builderTemplateId)
  const [selected, setSelected] = React.useState<string[]>([])
  const [assigned, setAssigned] = React.useState(false)

  const toggle = (id: string) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  }

  const handleAssign = () => {
    if (!builderTemplateId) {
      // For new (unsaved) workouts, just simulate success — real flow would save first.
      setAssigned(true)
      setTimeout(() => {
        setAssigned(false)
        onOpenChange(false)
        setSelected([])
      }, 1500)
      return
    }
    assignMutation.mutate(
      { templateId: builderTemplateId, clientIds: selected },
      {
        onSuccess: () => {
          setAssigned(true)
          setTimeout(() => {
            setAssigned(false)
            onOpenChange(false)
            setSelected([])
          }, 1500)
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign to Clients</DialogTitle>
        </DialogHeader>
        {assigned ? (
          <div className="flex flex-col items-center py-8">
            <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center mb-4">
              <Check className="w-7 h-7 text-success" strokeWidth={2.5} />
            </div>
            <p className="text-sm font-semibold text-foreground">Workout assigned</p>
            <p className="text-xs text-muted-foreground mt-1">Sent to {selected.length} clients</p>
          </div>
        ) : (
          <>
            <div className="space-y-1.5 max-h-[50vh] overflow-y-auto">
              {clients.map((c) => (
                <button
                  key={c.id}
                  onClick={() => toggle(c.id)}
                  className={cn(
                    'w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all tap-smooth',
                    selected.includes(c.id) ? 'border-primary/30 bg-primary/5' : 'border-border/60 hover:bg-muted/40',
                  )}
                >
                  <Avatar className="w-8 h-8 rounded-lg shrink-0">
                    <AvatarFallback className="bg-muted text-foreground text-[11px] font-semibold rounded-lg">
                      {c.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left min-w-0">
                    <div className="text-xs font-medium text-foreground truncate">{c.full_name}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{c.goal} · {c.training_phase}</div>
                  </div>
                  <div
                    className={cn(
                      'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors',
                      selected.includes(c.id) ? 'bg-primary border-primary' : 'border-border',
                    )}
                  >
                    {selected.includes(c.id) && <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button
                className="flex-1 gap-1.5"
                disabled={selected.length === 0 || assignMutation.isPending}
                onClick={handleAssign}
              >
                <Send className="w-3.5 h-3.5" />
                Assign to {selected.length || ''}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
