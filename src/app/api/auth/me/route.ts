import { NextResponse } from 'next/server'
import { getForgeSession } from '@/lib/forge-session'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getForgeSession()
  if (!session) {
    return NextResponse.json({ user: null })
  }
  return NextResponse.json({ user: session })
}
