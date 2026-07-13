import { NextResponse } from 'next/server'
import { getTasks } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(await getTasks())
}
