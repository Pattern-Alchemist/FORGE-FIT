import type { BlockType } from '@/lib/types'

export const BLOCK_TYPES: { type: BlockType; label: string; color: string }[] = [
  { type: 'warmup', label: 'Warm-up', color: 'bg-chart-4/15 text-chart-4 border-chart-4/20' },
  { type: 'strength', label: 'Strength', color: 'bg-primary/15 text-primary border-primary/20' },
  { type: 'accessory', label: 'Accessory', color: 'bg-chart-2/15 text-chart-2 border-chart-2/20' },
  { type: 'conditioning', label: 'Conditioning', color: 'bg-chart-5/15 text-chart-5 border-chart-5/20' },
  { type: 'cooldown', label: 'Cooldown', color: 'bg-chart-3/15 text-chart-3 border-chart-3/20' },
]

export const BLOCK_ICONS: Record<BlockType, string> = {
  warmup: '🔥',
  strength: '💪',
  accessory: '🔩',
  conditioning: '⚡',
  cooldown: '🧘',
}
