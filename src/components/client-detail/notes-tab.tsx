'use client'

import { Pencil, Plus, Mail, Phone, StickyNote } from 'lucide-react'
import type { Client } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'

export function ClientNotesTab({ client }: { client: Client }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 card-premium rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Coach Notes</h3>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5">
            <Pencil className="w-3 h-3" />
            Edit
          </Button>
        </div>
        <div className="bg-muted/30 rounded-lg p-4">
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{client.coach_notes}</p>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Textarea placeholder="Add a private note…" className="bg-muted/40 border-transparent resize-none" rows={3} />
        </div>
        <div className="flex justify-end mt-2">
          <Button size="sm">Save Note</Button>
        </div>
      </div>
      <div className="card-premium rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Tags</h3>
        <div className="flex flex-wrap gap-2 mb-5">
          {client.tags.map((t) => (
            <Badge key={t} variant="outline" className="bg-primary/5 border-primary/20 text-primary">{t}</Badge>
          ))}
          <button className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 px-2 py-1 rounded-md border border-dashed border-border/80">
            <Plus className="w-3 h-3" />
            Add tag
          </button>
        </div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Contact</h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="w-3.5 h-3.5" />
            <span className="text-foreground/80">{client.full_name.toLowerCase().replace(' ', '.')}@email.com</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="w-3.5 h-3.5" />
            <span className="text-foreground/80">+1 (555) 0{Math.floor(100 + client.id.charCodeAt(2) * 7 % 900)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
