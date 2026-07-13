import { NextResponse } from 'next/server'
import { getClientProgram } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const clientId = searchParams.get('clientId')
  if (!clientId) return NextResponse.json({ error: 'clientId required' }, { status: 400 })
  return NextResponse.json(await getClientProgram(clientId))
}
