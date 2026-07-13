// One-shot: convert src/lib/data.ts to a JSON fixture for the seed script.
// Run with: `bun run scripts/build-seed-fixture.ts`
import { writeFileSync } from 'fs'

// Re-export the data using a tsx-style import via bun's native TS support
// @ts-expect-error — bun resolves .ts imports at runtime; tsc complains but bun doesn't
const data = await import('../src/lib/data.ts')

const fixture = {
  coach: data.coach,
  clients: data.clients,
  programs: data.programs,
  workoutTemplates: data.workoutTemplates,
  exercises: data.exercises,
  checkIns: data.checkIns,
  messages: data.messages,
  habitLogs: data.habitLogs,
  savedReplies: data.savedReplies,
  tasks: data.tasks,
  activityEvents: data.activityEvents,
}

writeFileSync('scripts/seed-data.json', JSON.stringify(fixture, null, 2))
console.log(`✓ Wrote scripts/seed-data.json (${Object.keys(fixture).length} top-level keys)`)
console.log(`  - clients: ${fixture.clients.length}`)
console.log(`  - templates: ${fixture.workoutTemplates.length}`)
console.log(`  - checkIns: ${fixture.checkIns.length}`)
console.log(`  - messages: ${fixture.messages.length}`)
