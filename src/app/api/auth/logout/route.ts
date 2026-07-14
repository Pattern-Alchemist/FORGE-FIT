import { NextResponse } from 'next/server'
import { destroyForgeSession } from '@/lib/forge-session'

export const dynamic = 'force-dynamic'

export async function POST() {
  await destroyForgeSession()
  return NextResponse.json({ ok: true })
}
