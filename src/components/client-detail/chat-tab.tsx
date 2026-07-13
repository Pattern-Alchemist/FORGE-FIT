'use client'

import * as React from 'react'
import { MessageSquare, Plus, Send } from 'lucide-react'
import { useMessages, useSavedReplies, useSendMessage } from '@/lib/hooks'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { EmptyState } from '@/components/shared'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import type { SavedReply } from '@/lib/types'

export function ClientChatTab({ clientId }: { clientId: string }) {
  const { data: messages = [] } = useMessages(clientId)
  const { data: savedReplies = [] } = useSavedReplies()
  const sendMessage = useSendMessage()
  const [input, setInput] = React.useState('')
  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length])

  const handleSend = () => {
    if (!input.trim()) return
    sendMessage.mutate({ clientId, messageText: input.trim() })
    setInput('')
  }

  const sorted = [...messages].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  return (
    <div className="card-premium rounded-xl overflow-hidden flex flex-col" style={{ height: '600px' }}>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-3">
        {sorted.length === 0 ? (
          <EmptyState icon={MessageSquare} title="No messages yet" description="Start the conversation." />
        ) : (
          sorted.map((m, i) => {
            const isCoach = m.sender_type === 'coach'
            const prev = sorted[i - 1]
            const showAvatar = !prev || prev.sender_type !== m.sender_type
            return (
              <div key={m.id} className={cn('flex gap-2.5', isCoach && 'flex-row-reverse')}>
                <div className="w-7 shrink-0">
                  {showAvatar && (
                    <div className={cn(
                      'w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-semibold',
                      isCoach ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground',
                    )}>
                      {isCoach ? 'MV' : clientId.slice(-2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className={cn('max-w-[75%] flex flex-col', isCoach && 'items-end')}>
                  <div
                    className={cn(
                      'px-3.5 py-2 rounded-2xl text-sm leading-relaxed',
                      isCoach
                        ? 'bg-primary text-primary-foreground rounded-tr-sm'
                        : 'bg-muted text-foreground rounded-tl-sm',
                    )}
                  >
                    {m.message_text}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 px-1">
                    {format(new Date(m.created_at), 'p')}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Saved replies */}
      <div className="px-4 lg:px-6 py-2 border-t border-border/60 bg-muted/30">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold self-center shrink-0">Saved:</span>
          {savedReplies.slice(0, 4).map((sr: SavedReply) => (
            <button
              key={sr.id}
              onClick={() => setInput(sr.body)}
              className="shrink-0 text-[11px] px-2.5 py-1 rounded-md bg-card border border-border/60 text-foreground hover:border-primary/30 hover:text-primary transition-colors tap-smooth"
            >
              {sr.title}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-3 lg:p-4 border-t border-border/60 flex items-center gap-2">
        <button className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0">
          <Plus className="w-4 h-4" />
        </button>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          placeholder="Type a message…"
          rows={1}
          className="resize-none bg-muted/40 border-transparent min-h-[40px] max-h-32"
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!input.trim() || sendMessage.isPending}
          className="shrink-0 h-9 w-9 rounded-lg"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
