import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomBytes } from 'crypto'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { email: email.toLowerCase() } })
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

    // In production, send an email here. In dev, log it + return it (demo only).
    const resetUrl = `/?reset=${token}`
    console.log(`\n📧 [Password Reset]\n  Email: ${user.email}\n  Reset URL: ${resetUrl}\n`)
    return NextResponse.json({
      ok: true,
      message: 'If that email exists, a reset link has been sent.',
      // Demo only: return the token so the UI can redirect
      _devResetUrl: resetUrl,
    })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
