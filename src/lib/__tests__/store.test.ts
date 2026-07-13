import { describe, it, expect, beforeEach } from 'vitest'
import { useUIStore } from '@/lib/store'

// Reset the store between tests
beforeEach(() => {
  useUIStore.setState({
    screen: 'dashboard',
    selectedClientId: null,
    selectedConversationId: null,
    clientDetailTab: 'overview',
    builderTemplateId: null,
    builderDraftBlocks: [],
    builderTitle: 'Untitled Workout',
    builderCategory: 'Strength',
    clientsSearch: '',
    clientsStatusFilter: 'all',
    clientsGoalFilter: 'all',
    clientsSortBy: 'recent',
  })
})

describe('UI Store', () => {
  describe('navigation', () => {
    it('starts on dashboard', () => {
      expect(useUIStore.getState().screen).toBe('dashboard')
    })

    it('setScreen changes the screen', () => {
      useUIStore.getState().setScreen('clients')
      expect(useUIStore.getState().screen).toBe('clients')
    })

    it('openClient sets screen, clientId, and tab', () => {
      useUIStore.getState().openClient('cl1', 'progress')
      const state = useUIStore.getState()
      expect(state.screen).toBe('client-detail')
      expect(state.selectedClientId).toBe('cl1')
      expect(state.clientDetailTab).toBe('progress')
    })

    it('openClient defaults tab to overview', () => {
      useUIStore.getState().openClient('cl2')
      expect(useUIStore.getState().clientDetailTab).toBe('overview')
    })

    it('openConversation sets screen and conversationId', () => {
      useUIStore.getState().openConversation('cl3')
      const state = useUIStore.getState()
      expect(state.screen).toBe('messages')
      expect(state.selectedConversationId).toBe('cl3')
    })

    it('setClientDetailTab changes the tab', () => {
      useUIStore.getState().setClientDetailTab('notes')
      expect(useUIStore.getState().clientDetailTab).toBe('notes')
    })
  })

  describe('workout builder', () => {
    it('starts with empty draft blocks', () => {
      expect(useUIStore.getState().builderDraftBlocks).toEqual([])
    })

    it('setBuilder resets the builder state', () => {
      useUIStore.setState({ builderDraftBlocks: [{ id: 'b1', block_type: 'warmup', exercises: [] }] })
      useUIStore.getState().setBuilder('wt1')
      expect(useUIStore.getState().builderTemplateId).toBe('wt1')
      expect(useUIStore.getState().builderDraftBlocks).toEqual([])
      expect(useUIStore.getState().builderTitle).toBe('Untitled Workout')
    })

    it('setBuilder(null) clears everything', () => {
      useUIStore.setState({ builderTemplateId: 'wt1', builderTitle: 'Custom' })
      useUIStore.getState().setBuilder(null)
      expect(useUIStore.getState().builderTemplateId).toBeNull()
      expect(useUIStore.getState().builderTitle).toBe('Untitled Workout')
    })

    it('addBlock appends a block', () => {
      const block = { id: 'b1', block_type: 'warmup' as const, exercises: [] }
      useUIStore.getState().addBlock(block)
      expect(useUIStore.getState().builderDraftBlocks).toHaveLength(1)
      expect(useUIStore.getState().builderDraftBlocks[0].id).toBe('b1')
    })

    it('removeBlock removes by id', () => {
      useUIStore.setState({
        builderDraftBlocks: [
          { id: 'b1', block_type: 'warmup' as const, exercises: [] },
          { id: 'b2', block_type: 'strength' as const, exercises: [] },
        ],
      })
      useUIStore.getState().removeBlock('b1')
      expect(useUIStore.getState().builderDraftBlocks).toHaveLength(1)
      expect(useUIStore.getState().builderDraftBlocks[0].id).toBe('b2')
    })

    it('moveBlock reorders blocks', () => {
      useUIStore.setState({
        builderDraftBlocks: [
          { id: 'b1', block_type: 'warmup' as const, exercises: [] },
          { id: 'b2', block_type: 'strength' as const, exercises: [] },
          { id: 'b3', block_type: 'cooldown' as const, exercises: [] },
        ],
      })
      useUIStore.getState().moveBlock(0, 2)
      const blocks = useUIStore.getState().builderDraftBlocks
      expect(blocks.map((b) => b.id)).toEqual(['b2', 'b3', 'b1'])
    })

    it('updateBlock patches a block by id', () => {
      useUIStore.setState({
        builderDraftBlocks: [
          { id: 'b1', block_type: 'warmup' as const, exercises: [], notes: undefined },
        ],
      })
      useUIStore.getState().updateBlock('b1', { notes: 'New notes' })
      expect(useUIStore.getState().builderDraftBlocks[0].notes).toBe('New notes')
    })

    it('setBuilderTitle and setBuilderCategory work', () => {
      useUIStore.getState().setBuilderTitle('Leg Day')
      useUIStore.getState().setBuilderCategory('Lower Body')
      expect(useUIStore.getState().builderTitle).toBe('Leg Day')
      expect(useUIStore.getState().builderCategory).toBe('Lower Body')
    })
  })

  describe('list filters', () => {
    it('starts with default filters', () => {
      const s = useUIStore.getState()
      expect(s.clientsSearch).toBe('')
      expect(s.clientsStatusFilter).toBe('all')
      expect(s.clientsGoalFilter).toBe('all')
      expect(s.clientsSortBy).toBe('recent')
    })

    it('setClientsSearch updates search', () => {
      useUIStore.getState().setClientsSearch('elena')
      expect(useUIStore.getState().clientsSearch).toBe('elena')
    })

    it('setClientsStatusFilter updates filter', () => {
      useUIStore.getState().setClientsStatusFilter('active')
      expect(useUIStore.getState().clientsStatusFilter).toBe('active')
    })

    it('setClientsGoalFilter updates filter', () => {
      useUIStore.getState().setClientsGoalFilter('Strength')
      expect(useUIStore.getState().clientsGoalFilter).toBe('Strength')
    })

    it('setClientsSortBy updates sort', () => {
      useUIStore.getState().setClientsSortBy('name')
      expect(useUIStore.getState().clientsSortBy).toBe('name')
    })
  })
})
