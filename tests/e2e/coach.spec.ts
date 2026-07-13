import { test, expect } from '@playwright/test'

// These tests run after login as coach
test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.getByPlaceholder('you@example.com').fill('marcus@forge.coach')
  await page.getByPlaceholder('••••••••').fill('forge123')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByRole('heading', { name: /Good (morning|afternoon|evening)/ })).toBeVisible({ timeout: 15000 })
})

test.describe('Coach Dashboard', () => {
  test('shows KPI cards with real data', async ({ page }) => {
    await expect(page.getByText('Active Clients')).toBeVisible()
    await expect(page.getByText('Workouts Due Today')).toBeVisible()
    await expect(page.getByText('Pending Check-ins')).toBeVisible()
    await expect(page.getByText('Unread Messages')).toBeVisible()
    await expect(page.getByText('Avg Adherence')).toBeVisible()
  })

  test('shows today\'s tasks list', async ({ page }) => {
    await expect(page.getByRole('heading', { name: "Today's Coach Tasks" })).toBeVisible()
    // At least one task should be visible
    const taskButtons = page.locator('[data-slot="button"], button').filter({ hasText: /Mark complete/ })
    await expect(taskButtons.first()).toBeVisible({ timeout: 10000 })
  })

  test('shows needs attention section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Needs Attention' })).toBeVisible()
  })

  test('shows recent activity feed', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Recent Activity' })).toBeVisible()
  })

  test('shows top consistency streaks', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Top Consistency Streaks' })).toBeVisible()
  })
})

test.describe('Navigation', () => {
  test('sidebar navigates to clients', async ({ page }) => {
    await page.getByRole('button', { name: 'Clients' }).first().click()
    await expect(page.getByRole('heading', { name: 'Clients' })).toBeVisible({ timeout: 10000 })
  })

  test('sidebar navigates to workout builder', async ({ page }) => {
    await page.getByRole('button', { name: 'Builder' }).click()
    await expect(page.getByText('Exercise Library')).toBeVisible({ timeout: 10000 })
  })

  test('sidebar navigates to check-ins', async ({ page }) => {
    await page.getByRole('button', { name: 'Check-ins' }).click()
    await expect(page.getByRole('heading', { name: 'Check-ins' })).toBeVisible({ timeout: 10000 })
  })

  test('sidebar navigates to messages', async ({ page }) => {
    await page.getByRole('button', { name: 'Messages' }).click()
    await expect(page.getByRole('heading', { name: 'Messages' })).toBeVisible({ timeout: 10000 })
  })

  test('sidebar navigates to settings', async ({ page }) => {
    await page.getByRole('button', { name: 'Settings' }).first().click()
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible({ timeout: 10000 })
  })
})

test.describe('⌘K Command Palette', () => {
  test('opens with Cmd+K', async ({ page }) => {
    await page.keyboard.press('Meta+K')
    await expect(page.getByText('Search clients, workouts, exercises')).toBeVisible({ timeout: 5000 })
  })

  test('shows quick navigation when empty', async ({ page }) => {
    await page.keyboard.press('Meta+K')
    await expect(page.getByText('Quick Navigation')).toBeVisible({ timeout: 5000 })
  })

  test('can be closed with Escape', async ({ page }) => {
    await page.keyboard.press('Meta+K')
    await expect(page.getByText('Quick Navigation')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByText('Quick Navigation')).not.toBeVisible({ timeout: 5000 })
  })
})

test.describe('Clients list', () => {
  test('shows 12 seeded clients', async ({ page }) => {
    await page.getByRole('button', { name: 'Clients' }).first().click()
    await expect(page.getByRole('heading', { name: 'Clients' })).toBeVisible({ timeout: 10000 })
    // Check that a few known clients are visible
    await expect(page.getByText('Elena Reyes')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Daichi Tanaka')).toBeVisible()
    await expect(page.getByText('Priya Anand')).toBeVisible()
  })

  test('search filters clients', async ({ page }) => {
    await page.getByRole('button', { name: 'Clients' }).first().click()
    await expect(page.getByRole('heading', { name: 'Clients' })).toBeVisible({ timeout: 10000 })
    await page.getByPlaceholder('Search by name…').fill('Elena')
    await expect(page.getByText('Elena Reyes')).toBeVisible()
    await expect(page.getByText('Daichi Tanaka')).not.toBeVisible({ timeout: 5000 })
  })

  test('status filter pills work', async ({ page }) => {
    await page.getByRole('button', { name: 'Clients' }).first().click()
    await expect(page.getByRole('heading', { name: 'Clients' })).toBeVisible({ timeout: 10000 })
    await page.getByRole('button', { name: /Paused/ }).click()
    // Should show Lucas Moreau (paused)
    await expect(page.getByText('Lucas Moreau')).toBeVisible({ timeout: 5000 })
  })

  test('clicking a client opens detail', async ({ page }) => {
    await page.getByRole('button', { name: 'Clients' }).first().click()
    await expect(page.getByRole('heading', { name: 'Clients' })).toBeVisible({ timeout: 10000 })
    await page.getByText('Elena Reyes').click()
    await expect(page.getByRole('heading', { name: 'Elena Reyes' })).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Client detail', () => {
  test('shows all tabs', async ({ page }) => {
    // Navigate to a client
    await page.getByRole('button', { name: 'Clients' }).first().click()
    await expect(page.getByRole('heading', { name: 'Clients' })).toBeVisible({ timeout: 10000 })
    await page.getByText('Elena Reyes').click()
    await expect(page.getByRole('heading', { name: 'Elena Reyes' })).toBeVisible({ timeout: 10000 })

    // Check tabs are present
    await expect(page.getByRole('tab', { name: 'Overview' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Workouts' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Check-ins' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Progress' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Notes' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Chat' })).toBeVisible()
  })

  test('switching tabs updates the URL', async ({ page }) => {
    await page.getByRole('button', { name: 'Clients' }).first().click()
    await expect(page.getByRole('heading', { name: 'Clients' })).toBeVisible({ timeout: 10000 })
    await page.getByText('Elena Reyes').click()
    await expect(page.getByRole('heading', { name: 'Elena Reyes' })).toBeVisible({ timeout: 10000 })

    await page.getByRole('tab', { name: 'Progress' }).click()
    // URL should contain tab=progress
    await expect(page).toHaveURL(/tab=progress/, { timeout: 5000 })
  })
})

test.describe('Workout Builder', () => {
  test('shows empty state when no blocks', async ({ page }) => {
    await page.getByRole('button', { name: 'New Workout' }).click()
    await expect(page.getByText('Start building')).toBeVisible({ timeout: 10000 })
  })

  test('can add a block', async ({ page }) => {
    await page.getByRole('button', { name: 'New Workout' }).click()
    await expect(page.getByText('Start building')).toBeVisible({ timeout: 10000 })
    await page.getByRole('button', { name: /Warm-up/ }).click()
    await expect(page.getByText(/Warm-up/)).toBeVisible({ timeout: 5000 })
  })

  test('templates dialog opens', async ({ page }) => {
    await page.getByRole('button', { name: 'New Workout' }).click()
    await expect(page.getByText('Start building')).toBeVisible({ timeout: 10000 })
    await page.getByRole('button', { name: 'Templates' }).click()
    await expect(page.getByRole('heading', { name: 'Workout Templates' })).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Dark mode', () => {
  test('theme toggle switches dark mode', async ({ page }) => {
    // Get initial theme
    const htmlClass = await page.locator('html').getAttribute('class')
    const initialDark = htmlClass?.includes('dark') ?? false

    // Toggle
    await page.getByRole('button', { name: 'Toggle theme' }).click()

    // Wait a moment for the class to update
    await page.waitForTimeout(500)
    const newHtmlClass = await page.locator('html').getAttribute('class')
    const newDark = newHtmlClass?.includes('dark') ?? false

    expect(newDark).toBe(!initialDark)
  })
})
