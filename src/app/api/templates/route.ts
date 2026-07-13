import { NextResponse } from 'next/server'
import { getWorkoutTemplates, getWorkoutTemplate } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (id) {
    return NextResponse.json(await getWorkoutTemplate(id))
  }
  return NextResponse.json(await getWorkoutTemplates())
}
