import { test, expect } from '@playwright/test'

// These tests run after login as client
test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.getByPlaceholder('you@example.com').fill('elena@client.forge.coach')
  await page.getByPlaceholder('••••••••').fill('client123')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByText(/Good (morning|afternoon|evening)/)).toBeVisible({ timeout: 15000 })
})

test.describe('Client Mobile App', () => {
  test('shows home screen with today\'s workout', async ({ page }) => {
    await expect(page.getByText("Today's Workout")).toBeVisible()
    await expect(page.getByText('Start Workout')).toBeVisible()
  })

  test('shows stats row', async ({ page }) => {
    await expect(page.getByText('Adherence')).toBeVisible()
    await expect(page.getByText('Streak')).toBeVisible()
  })

  test('shows quick actions', async ({ page }) => {
    await expect(page.getByText('Submit weekly check-in')).toBeVisible()
    await expect(page.getByText('Message your coach')).toBeVisible()
  })

  test('bottom nav has 4 tabs', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Home' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Workout' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Check-in' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Messages' })).toBeVisible()
  })

  test('navigates to workout tab', async ({ page }) => {
    await page.getByRole('button', { name: 'Workout' }).click()
    await expect(page.getByText('Your Workouts')).toBeVisible({ timeout: 10000 })
  })

  test('navigates to check-in tab', async ({ page }) => {
    await page.getByRole('button', { name: 'Check-in' }).click()
    await expect(page.getByText('Weekly Check-in')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Body Metrics')).toBeVisible()
    await expect(page.getByText("How's this week?")).toBeVisible()
  })

  test('check-in form has sliders', async ({ page }) => {
    await page.getByRole('button', { name: 'Check-in' }).click()
    await expect(page.getByText('Weekly Check-in')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Energy')).toBeVisible()
    await expect(page.getByText('Sleep Quality')).toBeVisible()
    await expect(page.getByText('Mood')).toBeVisible()
  })

  test('navigates to messages tab', async ({ page }) => {
    await page.getByRole('button', { name: 'Messages' }).click()
    // Should see chat input or coach name
    await expect(page.getByPlaceholder('Message your coach…')).toBeVisible({ timeout: 10000 })
  })

  test('exit button signs out', async ({ page }) => {
    await page.getByRole('button', { name: 'Exit' }).click()
    await expect(page.getByText('Welcome back')).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Client workout flow', () => {
  test('can start a workout from home', async ({ page }) => {
    await page.getByText('Start Workout').click()
    // Should see exercise list or workout logger
    await expect(page.getByText(/Complete Workout/)).toBeVisible({ timeout: 10000 })
  })

  test('can toggle a set in the workout logger', async ({ page }) => {
    await page.getByText('Start Workout').click()
    await expect(page.getByText(/Complete Workout/)).toBeVisible({ timeout: 10000 })
    // Click the first set button
    const firstSet = page.getByText('Set 1').first()
    await firstSet.click()
    // The button should now show completed state (check mark)
    await expect(page.locator('[data-state="checked"], .bg-success').first()).toBeVisible({ timeout: 5000 })
  })
})
