import { NextResponse } from 'next/server'
import { createForgeSession } from '@/lib/forge-session'
import { rateLimit, getClientIP } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  // Rate limit: 10 attempts per 15 minutes
  const ip = getClientIP(request)
  const limit = rateLimit(`login:${ip}`, { windowMs: 15 * 60 * 1000, max: 10 })
  if (!limit.success) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 })
  }

  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const session = await createForgeSession(email, password)
    if (!session) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    return NextResponse.json({ user: session })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
