import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { rateLimit, getClientIP, setRateLimitHeaders } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  // Rate limit: 10 attempts per hour per IP
  const ip = getClientIP(request)
  const limit = rateLimit(`reset-password:${ip}`, { windowMs: 60 * 60 * 1000, max: 10 })
  if (!limit.success) {
    const res = NextResponse.json(
      { error: 'Too many attempts. Try again later.' },
      { status: 429 },
    )
    setRateLimitHeaders(res, limit)
    res.headers.set('Retry-After', String(Math.ceil((limit.resetTime - Date.now()) / 1000)))
    return res
  }

  try {
    const { token, password } = await request.json()
    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password required' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const user = await db.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    await db.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    })

    const res = NextResponse.json({ ok: true, message: 'Password updated. You can now sign in.' })
    setRateLimitHeaders(res, limit)
    return res
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
