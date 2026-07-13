/**
 * Forge — Email service
 *
 * Uses Resend for transactional emails (password reset, welcome, etc.).
 *
 * Setup:
 *   1. Sign up at https://resend.com
 *   2. Get your API key from https://resend.com/api-keys
 *   3. Add to .env: RESEND_API_KEY=re_xxx
 *   4. (Optional) Set FROM_EMAIL=forge@yourdomain.com (must be a verified domain)
 *
 * In dev without a key, emails are logged to the console instead of sent.
 */
import { Resend } from 'resend'

const apiKey = process.env.RESEND_API_KEY
const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev'

// Lazily initialize — only creates the client if a key is present
let client: Resend | null = null
function getClient(): Resend | null {
  if (!apiKey) return null
  if (!client) client = new Resend(apiKey)
  return client
}

export interface SendEmailParams {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  const c = getClient()
  if (!c) {
    // Dev mode — log to console instead of sending
    console.log('\n📧 [Email — Dev Mode]')
    console.log(`  To: ${to}`)
    console.log(`  Subject: ${subject}`)
    console.log(`  ---`)
    console.log(text || html.replace(/<[^>]*>/g, ''))
    console.log(`  ---\n`)
    return { ok: true, mode: 'dev', message: 'Email logged to console (no RESEND_API_KEY set)' }
  }

  try {
    const { data, error } = await c.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    })
    if (error) {
      console.error('[email] Resend error:', error)
      return { ok: false, error: error.message }
    }
    return { ok: true, mode: 'production', id: data?.id }
  } catch (e) {
    console.error('[email] Send failed:', e)
    return { ok: false, error: (e as Error).message }
  }
}

export const isEmailConfigured = () => !!apiKey
