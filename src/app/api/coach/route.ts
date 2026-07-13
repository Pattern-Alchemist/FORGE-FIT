import { NextResponse } from 'next/server'
import { getCoach } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export async function GET() {
  const coach = await getCoach()
  return NextResponse.json(coach)
}
