import { describe, it, expect } from 'vitest'
import { passwordResetEmail, welcomeEmail } from '@/lib/email/templates'

describe('Email templates', () => {
  describe('passwordResetEmail', () => {
    it('generates HTML with the reset URL', () => {
      const { html } = passwordResetEmail('https://example.com/?reset=abc123')
      expect(html).toContain('https://example.com/?reset=abc123')
      expect(html).toContain('Reset password')
      expect(html).toContain('Forge')
    })

    it('includes the user name when provided', () => {
      const { html } = passwordResetEmail('https://example.com', 'Elena')
      expect(html).toContain('Hi Elena')
    })

    it('uses generic greeting when no name', () => {
      const { html } = passwordResetEmail('https://example.com')
      expect(html).toContain('Hi there')
    })

    it('generates plain text version', () => {
      const { text } = passwordResetEmail('https://example.com/?reset=abc', 'John')
      expect(text).toContain('https://example.com/?reset=abc')
      expect(text).toContain('Hi John')
      expect(text).toContain('Forge')
    })

    it('mentions 1 hour expiry', () => {
      const { html, text } = passwordResetEmail('https://example.com')
      expect(html).toContain('1 hour')
      expect(text).toContain('1 hour')
    })
  })

  describe('welcomeEmail', () => {
    it('includes user and coach names', () => {
      const { html } = welcomeEmail('Elena', 'Marcus Vey')
      expect(html).toContain('Elena')
      expect(html).toContain('Marcus Vey')
    })

    it('lists key features', () => {
      const { html, text } = welcomeEmail('John', 'Coach')
      expect(html).toContain("today's workout")
      expect(html).toContain('check-in')
      expect(html).toContain('Message your coach')
      expect(text).toContain("today's workout")
    })

    it('includes plain text version', () => {
      const { text } = welcomeEmail('Elena', 'Marcus')
      expect(text).toContain('Elena')
      expect(text).toContain('Marcus')
      expect(text).toContain('Forge')
    })
  })
})
