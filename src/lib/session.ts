/**
 * Forge — Server-side session helpers
 *
 * Uses our custom JWT cookie session (forge-session.ts) instead of NextAuth.
 * This works reliably behind the preview proxy.
 */
import { getForgeSession, type ForgeSession } from '@/lib/forge-session'

export type AppSession = ForgeSession

export async function getSession(): Promise<AppSession | null> {
  return getForgeSession()
}

export async function requireCoachId(): Promise<string> {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')
  if (session.role !== 'coach' || !session.coachId) {
    throw new Error('Coach access required')
  }
  return session.coachId
}

export async function requireClientId(): Promise<string> {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')
  if (session.role !== 'client' || !session.clientId) {
    throw new Error('Client access required')
  }
  return session.clientId
}
