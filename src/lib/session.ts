/**
 * Forge — Server-side session helpers
 *
 * Use getServerSession() in route handlers and server actions to get the
 * current user. Returns null if not authenticated.
 */
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export type AppSession = {
  user: {
    id: string
    email: string
    name?: string | null
    image?: string | null
    role: 'coach' | 'client'
    coachId?: string | null
    clientId?: string | null
    profileId?: string | null
  }
}

export async function getSession(): Promise<AppSession | null> {
  const session = await getServerSession(authOptions)
  return session as AppSession | null
}

/**
 * Returns the coachId for the current session (coach role only).
 * Throws if unauthenticated or not a coach.
 */
export async function requireCoachId(): Promise<string> {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')
  if (session.user.role !== 'coach' || !session.user.coachId) {
    throw new Error('Coach access required')
  }
  return session.user.coachId
}

/**
 * Returns the clientId for the current session (client role only).
 * Throws if the user is not a client.
 */
export async function requireClientId(): Promise<string> {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')
  if (session.user.role !== 'client' || !session.user.clientId) {
    throw new Error('Client access required')
  }
  return session.user.clientId
}
