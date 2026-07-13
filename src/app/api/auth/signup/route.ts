import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { sendEmail } from '@/lib/email'
import { welcomeEmail } from '@/lib/email/templates'
import { rateLimit, getClientIP, setRateLimitHeaders } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(1, 'Name required').max(120),
  age: z.coerce.number().int().min(13).max(120),
  gender: z.enum(['M', 'F', 'NB']).default('NB'),
  goal: z.enum([
    'Hypertrophy',
    'Fat Loss',
    'Strength',
    'General Fitness',
    'Athletic Performance',
    'Recomposition',
  ]),
})

export async function POST(request: Request) {
  // Rate limit: 5 signups per hour per IP
  const ip = getClientIP(request)
  const limit = rateLimit(`signup:${ip}`, { windowMs: 60 * 60 * 1000, max: 5 })
  if (!limit.success) {
    const res = NextResponse.json(
      { error: 'Too many signups from this IP. Try again later.' },
      { status: 429 },
    )
    setRateLimitHeaders(res, limit)
    res.headers.set('Retry-After', String(Math.ceil((limit.resetTime - Date.now()) / 1000)))
    return res
  }

  try {
    const body = await request.json()
    const parsed = signupSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', fieldErrors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const { email, password, fullName, age, gender, goal } = parsed.data

    // Check if email already exists
    const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    // For demo: assign to the seeded coach (c1). In production, this would be
    // a coach selection step or a coach invite link.
    const coachId = 'c1'
    const coach = await db.coach.findUnique({ where: { id: coachId } })
    if (!coach) {
      return NextResponse.json({ error: 'No coach available' }, { status: 500 })
    }

    // Create the client record
    const avatar = fullName
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()

    const client = await db.client.create({
      data: {
        coachId,
        fullName,
        avatar,
        age,
        gender,
        goal,
        trainingPhase: 'Foundation',
        status: 'active',
        adherenceScore: 80,
        weeklyStreak: 0,
        injuries: '[]',
        coachNotes: `Self-signed up on ${new Date().toLocaleDateString()}.`,
        tags: JSON.stringify(['New']),
      },
    })

    // Create the auth user (client role)
    const passwordHash = await bcrypt.hash(password, 10)
    await db.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        role: 'client',
        clientId: client.id,
      },
    })

    // Send welcome email (logs to console in dev)
    const { html, text } = welcomeEmail(fullName, coach.name)
    await sendEmail({
      to: email.toLowerCase(),
      subject: `Welcome to Forge, ${fullName}!`,
      html,
      text,
    })

    return NextResponse.json({
      ok: true,
      message: 'Account created. You can now sign in.',
      clientId: client.id,
    })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
