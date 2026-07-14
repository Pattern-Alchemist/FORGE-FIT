/**
 * Forge — Simple session helper (bypasses NextAuth cookie issues in preview)
 *
 * Stores the session user ID + role in a JWT cookie.
 * Works reliably behind reverse proxies (Caddy/preview environments).
 */
import { jwtVerify, SignJWT } from 'jose'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'

const SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'forge-dev-secret-change-in-production'
)

const SESSION_COOKIE = 'forge-session'
const SESSION_MAX_AGE = 30 * 24 * 60 * 60 // 30 days

export interface ForgeSession {
  userId: string
  email: string
  role: 'coach' | 'client'
  coachId?: string | null
  clientId?: string | null
}

async function signToken(payload: ForgeSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(SECRET)
}

async function verifyToken(token: string): Promise<ForgeSession | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as unknown as ForgeSession
  } catch {
    return null
  }
}

/** Server-side: get the current session from the cookie */
export async function getForgeSession(): Promise<ForgeSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null
  return verifyToken(token)
}

/** Server-side: create a session by verifying credentials */
export async function createForgeSession(email: string, password: string): Promise<ForgeSession | null> {
  const user = await db.user.findUnique({
    where: { email: email.toLowerCase() },
    include: {
      coach: { select: { id: true, name: true } },
      client: { select: { id: true, fullName: true } },
    },
  })
  if (!user) return null

  const bcrypt = await import('bcryptjs')
  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) return null

  const session: ForgeSession = {
    userId: user.id,
    email: user.email,
    role: user.role as 'coach' | 'client',
    coachId: user.coachId,
    clientId: user.clientId,
  }

  const token = await signToken(session)
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false, // false so it works in both HTTP and HTTPS preview
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })

  return session
}

/** Server-side: destroy the session */
export async function destroyForgeSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

/** Client-side: check if session exists (calls /api/auth/me) */
export async function getClientSession(): Promise<ForgeSession | null> {
  try {
    const res = await fetch('/api/auth/me', { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json()
    return data.user ?? null
  } catch {
    return null
  }
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE
