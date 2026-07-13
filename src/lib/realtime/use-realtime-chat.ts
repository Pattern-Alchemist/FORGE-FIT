'use client'

/**
 * Forge — Real-time messaging hook
 *
 * Connects to the Socket.io chat service and provides:
 *   - useRealtimeMessages(clientId) → { isConnected, isTyping, lastEvent }
 *   - broadcastMessage(clientId, message) → POST to chat service
 *   - emitTyping(clientId, isTyping, senderType) → socket emit
 *
 * Connection URL: /?XTransformPort=3003 (Caddy forwards to port 3003)
 */
import { useEffect, useState, useCallback, useRef } from 'react'
import { io, type Socket } from 'socket.io-client'
import { useSession } from 'next-auth/react'

export interface RealtimeMessage {
  id: string
  clientId: string
  senderType: 'coach' | 'client'
  messageText: string
  createdAt: string
}

export function useRealtimeChat(clientId: string | null) {
  const { data: session } = useSession()
  const [isConnected, setIsConnected] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [lastMessage, setLastMessage] = useState<RealtimeMessage | null>(null)
  const socketRef = useRef<Socket | null>(null)

  // Resolve the effective clientId: either the one passed in, or the session's
  const effectiveClientId = clientId ?? (session?.user?.role === 'client' ? session.user.clientId : null)

  useEffect(() => {
    if (!session?.user) return

    const socket = io('/?XTransformPort=3003', {
      transports: ['websocket', 'polling'],
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      setIsConnected(true)
      socket.emit('identify', {
        userId: session.user.id,
        role: session.user.role,
        coachId: session.user.coachId,
        clientId: session.user.clientId,
      })
      if (effectiveClientId) {
        socket.emit('join-conversation', effectiveClientId)
      }
    })

    socket.on('disconnect', () => setIsConnected(false))

    socket.on('new-message', (msg: RealtimeMessage) => {
      // Only surface messages for the active conversation
      if (!effectiveClientId || msg.clientId === effectiveClientId) {
        setLastMessage(msg)
      }
    })

    socket.on('typing', (data: { clientId: string; isTyping: boolean; senderType: string }) => {
      if (effectiveClientId && data.clientId === effectiveClientId && data.senderType !== session.user.role) {
        setIsTyping(data.isTyping)
        if (data.isTyping) {
          setTimeout(() => setIsTyping(false), 3000)
        }
      }
    })

    return () => {
      if (effectiveClientId) socket.emit('leave-conversation', effectiveClientId)
      socket.disconnect()
    }
  }, [session, effectiveClientId])

  const emitTyping = useCallback((isTyping: boolean, senderType: 'coach' | 'client') => {
    if (clientId && socketRef.current?.connected) {
      socketRef.current.emit('typing', { clientId, isTyping, senderType })
    }
  }, [clientId])

  return { isConnected, isTyping, lastMessage, emitTyping }
}

/**
 * Broadcast a new message to the chat service via HTTP.
 * Called by server actions after they persist the message to the DB.
 * The chat service then emits to all connected clients in the conversation room.
 */
export async function broadcastMessage(
  clientId: string,
  coachId: string | null | undefined,
  message: RealtimeMessage,
) {
  try {
    await fetch('/?XTransformPort=3003/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, coachId, message }),
    })
  } catch (e) {
    // Silent fail — the message is already persisted; realtime is a bonus
    console.warn('[realtime] broadcast failed:', e)
  }
}
