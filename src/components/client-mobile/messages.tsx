'use client'

import * as React from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, CheckCheck, Paperclip } from 'lucide-react'
import { useClientMessages, useClientCoach, useClientSendMessage, useMarkMessagesRead } from '@/lib/hooks'
import { useRealtimeChat } from '@/lib/realtime/use-realtime-chat'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { format, isToday, isYesterday } from 'date-fns'

export function ClientMessages() {
  const queryClient = useQueryClient()
  const { data: messages = [], isLoading } = useClientMessages()
  const { data: coach } = useClientCoach()
  const sendMessage = useClientSendMessage()
  const markRead = useMarkMessagesRead()
  const [input, setInput] = React.useState('')
  const scrollRef = React.useRef<HTMLDivElement>(null)

  // Real-time: invalidate messages query when a new message arrives via socket
  const { isConnected, isTyping, lastMessage } = useRealtimeChat(null) // null = use session's clientId
  React.useEffect(() => {
    if (lastMessage) {
      queryClient.invalidateQueries({ queryKey: ['client-messages'] })
    }
  }, [lastMessage, queryClient])

  // Mark messages from coach as read when the chat is opened
  React.useEffect(() => {
    const unread = messages.filter((m) => m.sender_type === 'coach' && !m.read_status)
    if (unread.length > 0) {
      markRead.mutate()
    }
  }, [messages.length])

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length])

  const handleSend = () => {
    if (!input.trim()) return
    sendMessage.mutate(
      { messageText: input.trim() },
      { onSuccess: () => setInput('') },
    )
  }

  const sorted = [...messages].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  const formatTime = (d: string) => {
    const date = new Date(d)
    if (isToday(date)) return format(date, 'p')
    if (isYesterday(date)) return 'Yesterday'
    return format(date, 'MMM d')
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem-4rem)]">
      {/* Chat header */}
      <div className="flex items-center gap-3 p-3 border-b border-border/60 bg-card">
        <Avatar className="w-10 h-10 rounded-xl">
          <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-xs font-semibold rounded-xl">
            {coach?.avatar ?? coach?.name?.split(' ').map((p) => p[0]).join('') ?? '?'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-foreground">{coach?.name ?? 'Your Coach'}</div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-success pulse-soft" />
            {coach?.businessName ?? 'Forge Performance'}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/10">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={cn('flex', i % 2 === 0 ? 'justify-start' : 'justify-end')}>
                <Skeleton className={cn('h-12 rounded-2xl', i % 2 === 0 ? 'w-48' : 'w-32')} />
              </div>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
              <Send className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No messages yet</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">Say hi to your coach or ask a question about your training.</p>
          </div>
        ) : (
          <>
            {sorted.length > 0 && (
              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-border/60" />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                  {format(new Date(sorted[0].created_at), 'MMMM d')}
                </span>
                <div className="flex-1 h-px bg-border/60" />
              </div>
            )}
            <AnimatePresence initial={false}>
              {sorted.map((m, i) => {
                const isCoach = m.sender_type === 'coach'
                const prev = sorted[i - 1]
                const showAvatar = !prev || prev.sender_type !== m.sender_type
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={cn('flex gap-2', isCoach ? 'flex-row-reverse' : 'justify-end')}
                  >
                    {/* For client view: coach messages on right, client messages on left */}
                  </motion.div>
                )
              })}
            </AnimatePresence>
            {/* Actually render messages with correct alignment: client messages on right (user's own), coach on left */}
            {sorted.map((m, i) => {
              const isCoach = m.sender_type === 'coach'
              const prev = sorted[i - 1]
              const next = sorted[i + 1]
              const isFirstInGroup = !prev || prev.sender_type !== m.sender_type
              const isLastInGroup = !next || next.sender_type !== m.sender_type
              return (
                <div key={m.id} className={cn('flex gap-2', isCoach ? 'justify-start' : 'justify-end')}>
                  {isCoach && (
                    <div className="w-7 shrink-0">
                      {isLastInGroup && (
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-[10px] font-semibold flex items-center justify-center">
                          {coach?.avatar ?? 'MV'}
                        </div>
                      )}
                    </div>
                  )}
                  <div className={cn('max-w-[75%] flex flex-col', isCoach ? 'items-start' : 'items-end')}>
                    <div
                      className={cn(
                        'px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed',
                        isCoach
                          ? 'bg-card text-foreground border border-border/60 rounded-tl-sm shadow-sm'
                          : 'bg-primary text-primary-foreground rounded-tr-sm',
                        !isFirstInGroup && (isCoach ? 'rounded-tl-2xl' : 'rounded-tr-2xl'),
                      )}
                    >
                      {m.message_text}
                    </div>
                    {isLastInGroup && (
                      <div className={cn('flex items-center gap-1 text-[10px] text-muted-foreground mt-1 px-1', isCoach ? '' : 'flex-row-reverse')}>
                        <span>{formatTime(m.created_at)}</span>
                        {!isCoach && <CheckCheck className="w-3 h-3 text-primary" />}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border/60 bg-card flex items-end gap-2" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
        <button className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0">
          <Paperclip className="w-4 h-4" />
        </button>
        <div className="flex-1 relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Message your coach…"
            rows={1}
            className="w-full resize-none bg-muted/40 rounded-xl px-3 py-2.5 text-sm outline-none focus:bg-card focus:ring-2 focus:ring-primary/20 transition-all min-h-[40px] max-h-32"
          />
        </div>
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!input.trim() || sendMessage.isPending}
          className="shrink-0 h-10 w-10 rounded-xl"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
