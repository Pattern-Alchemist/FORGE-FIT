import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomBytes } from 'crypto'
import { sendEmail } from '@/lib/email'
import { passwordResetEmail } from '@/lib/email/templates'
import { rateLimit, getClientIP, setRateLimitHeaders } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  // Rate limit: 5 requests per hour per IP (prevents email enumeration)
  const ip = getClientIP(request)
  const limit = rateLimit(`forgot-password:${ip}`, { windowMs: 60 * 60 * 1000, max: 5 })
  if (!limit.success) {
    const res = NextResponse.json(
      { error: 'Too many requests. Try again later.' },
      { status: 429 },
    )
    setRateLimitHeaders(res, limit)
    res.headers.set('Retry-After', String(Math.ceil((limit.resetTime - Date.now()) / 1000)))
    return res
  }

  try {
    const { email } = await request.json()
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        coach: { select: { name: true } },
        client: { select: { fullName: true } },
      },
    })

    // Always return success — don't leak whether the email exists
    if (!user) {
      return NextResponse.json({ ok: true, message: 'If that email exists, a reset link has been sent.' })
    }

    // Generate a token valid for 1 hour
    const token = randomBytes(32).toString('hex')
    const expiry = new Date(Date.now() + 60 * 60 * 1000)
    await db.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpiry: expiry },
    })

    // Build the reset URL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const resetUrl = `${baseUrl}/?reset=${token}`

    // Send the email (logs to console in dev if no RESEND_API_KEY)
    const userName = user.role === 'coach' ? user.coach?.name : user.client?.fullName
    const { html, text } = passwordResetEmail(resetUrl, userName ?? undefined)
    const emailResult = await sendEmail({
      to: user.email,
      subject: 'Reset your Forge password',
      html,
      text,
    })

    const res = NextResponse.json({
      ok: true,
      message: 'If that email exists, a reset link has been sent.',
      ...(emailResult.mode === 'dev' ? { _devResetUrl: resetUrl } : {}),
    })
    setRateLimitHeaders(res, limit)
    return res
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
