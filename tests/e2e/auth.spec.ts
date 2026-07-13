import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('shows login screen when unauthenticated', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Forge')).toBeVisible()
    await expect(page.getByText('Welcome back')).toBeVisible()
    await expect(page.getByPlaceholder('you@example.com')).toBeVisible()
  })

  test('login as coach redirects to dashboard', async ({ page }) => {
    await page.goto('/')
    // Fill in coach credentials
    await page.getByPlaceholder('you@example.com').fill('marcus@forge.coach')
    await page.getByPlaceholder('••••••••').fill('forge123')
    await page.getByRole('button', { name: 'Sign in' }).click()
    // Should see the dashboard greeting
    await expect(page.getByRole('heading', { name: /Good (morning|afternoon|evening)/ })).toBeVisible({ timeout: 15000 })
  })

  test('login as client redirects to client mobile app', async ({ page }) => {
    await page.goto('/')
    await page.getByPlaceholder('you@example.com').fill('elena@client.forge.coach')
    await page.getByPlaceholder('••••••••').fill('client123')
    await page.getByRole('button', { name: 'Sign in' }).click()
    // Should see the client home screen
    await expect(page.getByText(/Good (morning|afternoon|evening)/)).toBeVisible({ timeout: 15000 })
    await expect(page.getByText("Today's Workout")).toBeVisible()
  })

  test('demo account quick-fill buttons work', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Coach' }).click()
    await expect(page.getByPlaceholder('you@example.com')).toHaveValue('marcus@forge.coach')
    await expect(page.getByPlaceholder('••••••••')).toHaveValue('forge123')
  })

  test('invalid credentials show error', async ({ page }) => {
    await page.goto('/')
    await page.getByPlaceholder('you@example.com').fill('wrong@example.com')
    await page.getByPlaceholder('••••••••').fill('wrongpassword')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByText('Invalid email or password')).toBeVisible({ timeout: 10000 })
  })

  test('signup mode shows additional fields', async ({ page }) => {
    await page.goto('/')
    await page.getByText('Sign up as client').click()
    await expect(page.getByText('Create your account')).toBeVisible()
    await expect(page.getByPlaceholder('Alex Athlete')).toBeVisible()
    await expect(page.getByPlaceholder('28')).toBeVisible()
  })

  test('forgot password mode shows email-only form', async ({ page }) => {
    await page.goto('/')
    await page.getByText('Forgot password?').click()
    await expect(page.getByText('Reset your password')).toBeVisible()
    await expect(page.getByPlaceholder('you@example.com')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Send reset link' })).toBeVisible()
  })
})
