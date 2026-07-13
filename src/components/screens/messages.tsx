'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Send,
  Plus,
  Paperclip,
  Smile,
  Bookmark,
  ChevronLeft,
  Phone,
  Video,
  MoreVertical,
  CheckCheck,
} from 'lucide-react'
import { useStore } from '@/lib/store'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns'
import type { SavedReply } from '@/lib/types'

export function Messages() {
  const clients = useStore((s) => s.clients)
  const allMessages = useStore((s) => s.messages)
  const savedReplies = useStore((s) => s.savedReplies)
  const sendMessage = useStore((s) => s.sendMessage)
  const selectedConversationId = useStore((s) => s.selectedConversationId)
  const openConversation = useStore((s) => s.openConversation)

  const [search, setSearch] = React.useState('')
  const [input, setInput] = React.useState('')
  const [activeReplyCat, setActiveReplyCat] = React.useState<SavedReply['category'] | 'all'>('all')
  const scrollRef = React.useRef<HTMLDivElement>(null)

  // Build conversation list with last message
  const conversations = clients
    .map((c) => {
      const msgs = allMessages
        .filter((m) => m.client_id === c.id)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      const last = msgs[msgs.length - 1]
      const unread = msgs.filter((m) => !m.read_status && m.sender_type === 'client').length
      return { client: c, last, unread, msgs }
    })
    .filter((conv) => conv.msgs.length > 0)
    .sort((a, b) => new Date(b.last?.created_at || 0).getTime() - new Date(a.last?.created_at || 0).getTime())
    .filter((conv) => !search || conv.client.full_name.toLowerCase().includes(search.toLowerCase()))

  // Default to first conversation with unread, or first overall
  const activeId = selectedConversationId && conversations.find((c) => c.client.id === selectedConversationId)
    ? selectedConversationId
    : conversations[0]?.client.id ?? null

  const activeConv = conversations.find((c) => c.client.id === activeId)

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [activeId, activeConv?.msgs.length])

  const handleSend = () => {
    if (!input.trim() || !activeId) return
    sendMessage(activeId, input.trim())
    setInput('')
  }

  const filteredReplies = activeReplyCat === 'all'
    ? savedReplies
    : savedReplies.filter((sr) => sr.category === activeReplyCat)

  const formatTimestamp = (d: string) => {
    const date = new Date(d)
    if (isToday(date)) return format(date, 'p')
    if (isYesterday(date)) return 'Yesterday'
    return format(date, 'MMM d')
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] lg:h-[calc(100vh-4rem)] flex">
      {/* Conversation list */}
      <aside className={cn(
        'w-full lg:w-[320px] lg:shrink-0 border-r border-border/60 bg-card flex-col',
        activeId && 'hidden lg:flex',
      )}>
        <div className="p-4 border-b border-border/60">
          <h1 className="text-display text-xl text-foreground mb-3">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations…"
              className="pl-9 h-9 text-xs bg-muted/50 border-transparent focus:border-border"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">No conversations yet.</p>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.client.id}
                onClick={() => openConversation(conv.client.id)}
                className={cn(
                  'w-full flex items-center gap-3 p-3 border-b border-border/40 text-left transition-colors tap-smooth',
                  activeId === conv.client.id ? 'bg-primary/5' : 'hover:bg-muted/40',
                )}
              >
                <Avatar className="w-10 h-10 rounded-lg shrink-0">
                  <AvatarFallback className="bg-muted text-foreground text-xs font-semibold rounded-lg">
                    {conv.client.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="text-sm font-medium text-foreground truncate">{conv.client.full_name}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0">{formatTimestamp(conv.last!.created_at)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn(
                      'text-xs truncate',
                      conv.unread > 0 ? 'text-foreground font-medium' : 'text-muted-foreground',
                    )}>
                      {conv.last!.sender_type === 'coach' && 'You: '}
                      {conv.last!.message_text}
                    </span>
                    {conv.unread > 0 && (
                      <span className="shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Chat panel */}
      <section className={cn(
        'flex-1 flex flex-col bg-background min-w-0',
        !activeId && 'hidden lg:flex',
      )}>
        {!activeConv ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Send className="w-7 h-7 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Your inbox</h3>
            <p className="text-xs text-muted-foreground max-w-xs">Select a conversation to start chatting with a client.</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 p-3 lg:p-4 border-b border-border/60 bg-card">
              <button
                onClick={() => openConversation('')}
                className="lg:hidden w-9 h-9 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <Avatar className="w-9 h-9 rounded-lg">
                <AvatarFallback className="bg-muted text-foreground text-xs font-semibold rounded-lg">
                  {activeConv.client.avatar}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground">{activeConv.client.full_name}</div>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-success pulse-soft" />
                  Active · {activeConv.client.goal}
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                <button className="w-9 h-9 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                  <Phone className="w-4 h-4" />
                </button>
                <button className="w-9 h-9 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                  <Video className="w-4 h-4" />
                </button>
                <button className="w-9 h-9 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-3 bg-muted/10">
              {/* Date divider */}
              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-border/60" />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                  {format(new Date(activeConv.msgs[0]?.created_at || new Date()), 'MMMM d')}
                </span>
                <div className="flex-1 h-px bg-border/60" />
              </div>
              <AnimatePresence initial={false}>
                {activeConv.msgs.map((m, i) => {
                  const isCoach = m.sender_type === 'coach'
                  const prev = activeConv.msgs[i - 1]
                  const showAvatar = !prev || prev.sender_type !== m.sender_type
                  return (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={cn('flex gap-2.5', isCoach && 'flex-row-reverse')}
                    >
                      <div className="w-7 shrink-0">
                        {showAvatar && (
                          <div className={cn(
                            'w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-semibold',
                            isCoach ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground',
                          )}>
                            {isCoach ? 'MV' : activeConv.client.avatar}
                          </div>
                        )}
                      </div>
                      <div className={cn('max-w-[75%] flex flex-col', isCoach && 'items-end')}>
                        <div
                          className={cn(
                            'px-3.5 py-2 rounded-2xl text-sm leading-relaxed',
                            isCoach
                              ? 'bg-primary text-primary-foreground rounded-tr-sm'
                              : 'bg-card text-foreground rounded-tl-sm border border-border/60 shadow-sm',
                          )}
                        >
                          {m.message_text}
                        </div>
                        <div className={cn('flex items-center gap-1 text-[10px] text-muted-foreground mt-1 px-1', isCoach && 'flex-row-reverse')}>
                          <span>{format(new Date(m.created_at), 'p')}</span>
                          {isCoach && <CheckCheck className="w-3 h-3 text-primary" />}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>

            {/* Saved replies strip */}
            <div className="px-4 lg:px-6 py-2 border-t border-border/60 bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Bookmark className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Saved Replies</span>
                <div className="ml-auto flex gap-1">
                  {(['all', 'check_in', 'motivation', 'form', 'logistics'] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => setActiveReplyCat(c)}
                      className={cn(
                        'text-[10px] px-2 py-0.5 rounded transition-colors capitalize',
                        activeReplyCat === c ? 'bg-primary text-primary-foreground' : 'bg-muted/60 text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {c.replace('_', '-')}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
                {filteredReplies.map((sr) => (
                  <button
                    key={sr.id}
                    onClick={() => setInput(sr.body)}
                    className="shrink-0 text-[11px] px-2.5 py-1 rounded-md bg-muted/60 border border-border/60 text-foreground hover:border-primary/30 hover:text-primary transition-colors tap-smooth"
                  >
                    {sr.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-3 lg:p-4 border-t border-border/60 bg-card flex items-end gap-2">
              <button className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0">
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
                  placeholder="Type a message…"
                  rows={1}
                  className="w-full resize-none bg-muted/40 rounded-xl px-3 py-2.5 text-sm outline-none focus:bg-card focus:ring-2 focus:ring-primary/20 transition-all min-h-[40px] max-h-32"
                />
                <button className="absolute right-2 bottom-2 w-7 h-7 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground">
                  <Smile className="w-4 h-4" />
                </button>
              </div>
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!input.trim()}
                className="shrink-0 h-10 w-10 rounded-xl"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
