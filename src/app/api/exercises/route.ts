import { NextResponse } from 'next/server'
import { getExerciseLibrary } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(await getExerciseLibrary())
}
