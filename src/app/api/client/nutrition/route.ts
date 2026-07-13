import { NextResponse } from 'next/server'
import { getMyNutritionLog, getMyNutritionHistory } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') ?? undefined
    const history = searchParams.get('history')
    if (history) {
      return NextResponse.json(await getMyNutritionHistory(Number(history)))
    }
    return NextResponse.json(await getMyNutritionLog(date))
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 })
  }
}
