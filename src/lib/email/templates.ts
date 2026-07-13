/**
 * Forge — Email templates
 *
 * HTML email templates for transactional emails.
 * Inline-styled for email client compatibility.
 */

const baseStyles = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  max-width: 560px;
  margin: 0 auto;
  padding: 32px 24px;
  background: #ffffff;
  color: #1a1a1a;
`

const headerStyles = `
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 32px;
`

const logoStyles = `
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #E8593A;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  font-weight: 700;
`

const buttonStyles = `
  display: inline-block;
  background: #E8593A;
  color: white;
  text-decoration: none;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  margin: 16px 0;
`

export function passwordResetEmail(resetUrl: string, userName?: string): { html: string; text: string } {
  const html = `
<div style="${baseStyles}">
  <div style="${headerStyles}">
    <span style="${logoStyles}">F</span>
    <span style="font-size: 16px; font-weight: 600;">Forge</span>
  </div>
  <h1 style="font-size: 22px; font-weight: 600; margin: 0 0 16px;">Reset your password</h1>
  <p style="font-size: 15px; line-height: 1.6; color: #4a4a4a; margin: 0 0 16px;">
    Hi ${userName || 'there'},
  </p>
  <p style="font-size: 15px; line-height: 1.6; color: #4a4a4a; margin: 0 0 16px;">
    We received a request to reset your Forge password. Click the button below to set a new password:
  </p>
  <a href="${resetUrl}" style="${buttonStyles}">Reset password</a>
  <p style="font-size: 13px; line-height: 1.6; color: #888; margin: 16px 0 0;">
    Or copy this link: <br>
    <span style="word-break: break-all; color: #666;">${resetUrl}</span>
  </p>
  <p style="font-size: 13px; line-height: 1.6; color: #888; margin: 24px 0 0;">
    This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
  </p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">
  <p style="font-size: 12px; color: #aaa; margin: 0;">
    Forge — Coaching, refined.
  </p>
</div>
`
  const text = `
Forge — Reset your password

Hi ${userName || 'there'},

We received a request to reset your Forge password. Click the link below to set a new password:

${resetUrl}

This link expires in 1 hour. If you didn't request this, you can safely ignore this email.

— Forge
`
  return { html, text }
}

export function welcomeEmail(userName: string, coachName: string): { html: string; text: string } {
  const html = `
<div style="${baseStyles}">
  <div style="${headerStyles}">
    <span style="${logoStyles}">F</span>
    <span style="font-size: 16px; font-weight: 600;">Forge</span>
  </div>
  <h1 style="font-size: 22px; font-weight: 600; margin: 0 0 16px;">Welcome to Forge, ${userName}!</h1>
  <p style="font-size: 15px; line-height: 1.6; color: #4a4a4a; margin: 0 0 16px;">
    You're now connected with ${coachName}. Your coach will assign workouts and check in with you regularly.
  </p>
  <p style="font-size: 15px; line-height: 1.6; color: #4a4a4a; margin: 0 0 16px;">
    Here's what you can do:
  </p>
  <ul style="font-size: 15px; line-height: 1.8; color: #4a4a4a; padding-left: 20px;">
    <li>View your today's workout and log sets as you go</li>
    <li>Submit weekly check-ins (takes under 5 minutes)</li>
    <li>Message your coach anytime</li>
  </ul>
  <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}" style="${buttonStyles}">Open Forge</a>
  <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">
  <p style="font-size: 12px; color: #aaa; margin: 0;">
    Forge — Coaching, refined.
  </p>
</div>
`
  const text = `
Welcome to Forge, ${userName}!

You're now connected with ${coachName}. Your coach will assign workouts and check in with you regularly.

Here's what you can do:
- View your today's workout and log sets as you go
- Submit weekly check-ins (takes under 5 minutes)
- Message your coach anytime

Open Forge: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}

— Forge
`
  return { html, text }
}
