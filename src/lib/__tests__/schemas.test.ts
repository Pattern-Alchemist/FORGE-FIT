import { describe, it, expect } from 'vitest'
import {
  clientSchemaInput,
  workoutTemplateSchemaInput,
  messageSchemaInput,
  checkInSchemaInput,
  checkInReviewSchema,
  savedReplySchemaInput,
  taskToggleSchema,
  assignTemplateSchema,
  goalSchema,
  trainingPhaseSchema,
  clientStatusSchema,
  blockTypeSchema,
} from '@/lib/schemas'

describe('Zod schemas', () => {
  describe('goalSchema', () => {
    it('accepts valid goals', () => {
      expect(goalSchema.safeParse('Hypertrophy').success).toBe(true)
      expect(goalSchema.safeParse('Fat Loss').success).toBe(true)
      expect(goalSchema.safeParse('Strength').success).toBe(true)
      expect(goalSchema.safeParse('General Fitness').success).toBe(true)
      expect(goalSchema.safeParse('Athletic Performance').success).toBe(true)
      expect(goalSchema.safeParse('Recomposition').success).toBe(true)
    })

    it('rejects invalid goals', () => {
      expect(goalSchema.safeParse('Weight Loss').success).toBe(false)
      expect(goalSchema.safeParse('').success).toBe(false)
      expect(goalSchema.safeParse(123).success).toBe(false)
    })
  })

  describe('trainingPhaseSchema', () => {
    it('accepts valid phases', () => {
      expect(trainingPhaseSchema.safeParse('Foundation').success).toBe(true)
      expect(trainingPhaseSchema.safeParse('Volume Block').success).toBe(true)
      expect(trainingPhaseSchema.safeParse('Intensity Block').success).toBe(true)
      expect(trainingPhaseSchema.safeParse('Peaking').success).toBe(true)
      expect(trainingPhaseSchema.safeParse('Deload').success).toBe(true)
      expect(trainingPhaseSchema.safeParse('Maintenance').success).toBe(true)
    })

    it('rejects invalid phases', () => {
      expect(trainingPhaseSchema.safeParse('Bulk').success).toBe(false)
      expect(trainingPhaseSchema.safeParse('Cut').success).toBe(false)
    })
  })

  describe('clientStatusSchema', () => {
    it('accepts valid statuses', () => {
      expect(clientStatusSchema.safeParse('active').success).toBe(true)
      expect(clientStatusSchema.safeParse('paused').success).toBe(true)
      expect(clientStatusSchema.safeParse('completed').success).toBe(true)
    })

    it('rejects invalid statuses', () => {
      expect(clientStatusSchema.safeParse('inactive').success).toBe(false)
      expect(clientStatusSchema.safeParse('Active').success).toBe(false) // case-sensitive
    })
  })

  describe('blockTypeSchema', () => {
    it('accepts valid block types', () => {
      expect(blockTypeSchema.safeParse('warmup').success).toBe(true)
      expect(blockTypeSchema.safeParse('strength').success).toBe(true)
      expect(blockTypeSchema.safeParse('accessory').success).toBe(true)
      expect(blockTypeSchema.safeParse('conditioning').success).toBe(true)
      expect(blockTypeSchema.safeParse('cooldown').success).toBe(true)
    })

    it('rejects invalid block types', () => {
      expect(blockTypeSchema.safeParse('cardio').success).toBe(false)
      expect(blockTypeSchema.safeParse('main').success).toBe(false)
    })
  })

  describe('clientSchemaInput', () => {
    const validClient = {
      fullName: 'John Doe',
      age: 30,
      goal: 'Strength' as const,
      trainingPhase: 'Volume Block' as const,
    }

    it('accepts a valid client', () => {
      const result = clientSchemaInput.safeParse(validClient)
      expect(result.success).toBe(true)
    })

    it('applies defaults for optional fields', () => {
      const result = clientSchemaInput.safeParse(validClient)
      if (result.success) {
        expect(result.data.status).toBe('active')
        expect(result.data.gender).toBe('NB')
        expect(result.data.adherenceScore).toBe(80)
        expect(result.data.weeklyStreak).toBe(0)
        expect(result.data.injuries).toEqual([])
        expect(result.data.tags).toEqual([])
      }
    })

    it('rejects empty name', () => {
      expect(clientSchemaInput.safeParse({ ...validClient, fullName: '' }).success).toBe(false)
    })

    it('rejects name too long', () => {
      expect(clientSchemaInput.safeParse({ ...validClient, fullName: 'x'.repeat(121) }).success).toBe(false)
    })

    it('rejects age below 13', () => {
      expect(clientSchemaInput.safeParse({ ...validClient, age: 12 }).success).toBe(false)
    })

    it('rejects age above 120', () => {
      expect(clientSchemaInput.safeParse({ ...validClient, age: 121 }).success).toBe(false)
    })

    it('rejects adherence below 0', () => {
      expect(clientSchemaInput.safeParse({ ...validClient, adherenceScore: -1 }).success).toBe(false)
    })

    it('rejects adherence above 100', () => {
      expect(clientSchemaInput.safeParse({ ...validClient, adherenceScore: 101 }).success).toBe(false)
    })
  })

  describe('messageSchemaInput', () => {
    it('accepts a valid message', () => {
      const result = messageSchemaInput.safeParse({
        clientId: 'cl1',
        messageText: 'Hello coach!',
      })
      expect(result.success).toBe(true)
    })

    it('rejects empty message', () => {
      expect(messageSchemaInput.safeParse({ clientId: 'cl1', messageText: '' }).success).toBe(false)
    })

    it('rejects message over 4000 chars', () => {
      expect(
        messageSchemaInput.safeParse({ clientId: 'cl1', messageText: 'x'.repeat(4001) }).success,
      ).toBe(false)
    })

    it('rejects missing clientId', () => {
      expect(messageSchemaInput.safeParse({ messageText: 'hi' }).success).toBe(false)
    })
  })

  describe('checkInSchemaInput', () => {
    const validCheckIn = {
      clientId: 'cl1',
      date: '2026-07-13',
      bodyWeight: 80.5,
      energyScore: 7,
      sleepScore: 8,
      moodScore: 6,
      adherencePercent: 85,
    }

    it('accepts a valid check-in', () => {
      const result = checkInSchemaInput.safeParse(validCheckIn)
      expect(result.success).toBe(true)
    })

    it('coerces date string to Date', () => {
      const result = checkInSchemaInput.safeParse(validCheckIn)
      if (result.success) {
        expect(result.data.date).toBeInstanceOf(Date)
      }
    })

    it('rejects body weight below 30', () => {
      expect(checkInSchemaInput.safeParse({ ...validCheckIn, bodyWeight: 29 }).success).toBe(false)
    })

    it('rejects body weight above 300', () => {
      expect(checkInSchemaInput.safeParse({ ...validCheckIn, bodyWeight: 301 }).success).toBe(false)
    })

    it('rejects energy score below 1', () => {
      expect(checkInSchemaInput.safeParse({ ...validCheckIn, energyScore: 0 }).success).toBe(false)
    })

    it('rejects energy score above 10', () => {
      expect(checkInSchemaInput.safeParse({ ...validCheckIn, energyScore: 11 }).success).toBe(false)
    })
  })

  describe('checkInReviewSchema', () => {
    it('accepts a valid review', () => {
      const result = checkInReviewSchema.safeParse({
        checkInId: 'ci1',
        coachResponse: 'Great work!',
        status: 'reviewed',
      })
      expect(result.success).toBe(true)
    })

    it('rejects empty response', () => {
      expect(
        checkInReviewSchema.safeParse({ checkInId: 'ci1', coachResponse: '', status: 'reviewed' }).success,
      ).toBe(false)
    })

    it('rejects status other than reviewed', () => {
      expect(
        checkInReviewSchema.safeParse({ checkInId: 'ci1', coachResponse: 'ok', status: 'pending' }).success,
      ).toBe(false)
    })
  })

  describe('workoutTemplateSchemaInput', () => {
    it('accepts a valid template', () => {
      const result = workoutTemplateSchemaInput.safeParse({
        title: 'Lower Body Strength',
        category: 'Strength',
        duration: 60,
        blocks: [],
      })
      expect(result.success).toBe(true)
    })

    it('rejects empty title', () => {
      expect(workoutTemplateSchemaInput.safeParse({ title: '', category: 'Strength' }).success).toBe(false)
    })

    it('rejects duration below 5 min', () => {
      expect(
        workoutTemplateSchemaInput.safeParse({ title: 'T', category: 'C', duration: 4 }).success,
      ).toBe(false)
    })

    it('rejects duration above 300 min', () => {
      expect(
        workoutTemplateSchemaInput.safeParse({ title: 'T', category: 'C', duration: 301 }).success,
      ).toBe(false)
    })
  })

  describe('savedReplySchemaInput', () => {
    it('accepts a valid reply', () => {
      const result = savedReplySchemaInput.safeParse({
        title: 'Great check-in',
        body: 'Nice work!',
      })
      expect(result.success).toBe(true)
    })

    it('defaults category to check_in', () => {
      const result = savedReplySchemaInput.safeParse({ title: 'T', body: 'B' })
      if (result.success) expect(result.data.category).toBe('check_in')
    })

    it('rejects invalid category', () => {
      expect(
        savedReplySchemaInput.safeParse({ title: 'T', body: 'B', category: 'invalid' }).success,
      ).toBe(false)
    })
  })

  describe('taskToggleSchema', () => {
    it('accepts valid toggle', () => {
      expect(taskToggleSchema.safeParse({ taskId: 't1', completed: true }).success).toBe(true)
      expect(taskToggleSchema.safeParse({ taskId: 't1', completed: false }).success).toBe(true)
    })

    it('rejects missing taskId', () => {
      expect(taskToggleSchema.safeParse({ completed: true }).success).toBe(false)
    })
  })

  describe('assignTemplateSchema', () => {
    it('accepts valid assignment', () => {
      expect(
        assignTemplateSchema.safeParse({ templateId: 'wt1', clientIds: ['cl1'] }).success,
      ).toBe(true)
    })

    it('rejects empty clientIds', () => {
      expect(
        assignTemplateSchema.safeParse({ templateId: 'wt1', clientIds: [] }).success,
      ).toBe(false)
    })
  })
})
