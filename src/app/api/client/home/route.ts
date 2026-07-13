import { NextResponse } from 'next/server'
import { getClientHomeStats } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const stats = await getClientHomeStats()
    if (!stats) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(stats)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 })
  }
}
