import { NextResponse } from 'next/server'
import { getClients, getClient } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (id) {
    return NextResponse.json(await getClient(id))
  }
  return NextResponse.json(await getClients())
}
