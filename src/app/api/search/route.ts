import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireCoachId } from '@/lib/session'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const coachId = await requireCoachId()
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.trim().toLowerCase()

    if (!q || q.length < 1) {
      return NextResponse.json({ clients: [], templates: [], exercises: [] })
    }

    // Search clients by name
    const clients = await db.client.findMany({
      where: {
        coachId,
        OR: [
          { fullName: { contains: q } },
          { goal: { contains: q } },
          { trainingPhase: { contains: q } },
        ],
      },
      take: 5,
      select: {
        id: true,
        fullName: true,
        avatar: true,
        goal: true,
        trainingPhase: true,
        status: true,
      },
    })

    // Search workout templates by title/category
    const templates = await db.workoutTemplate.findMany({
      where: {
        coachId,
        OR: [
          { title: { contains: q } },
          { category: { contains: q } },
        ],
      },
      take: 5,
      select: { id: true, title: true, category: true, duration: true },
    })

    // Search exercise library by name/muscle group
    const exercises = await db.exerciseLibrary.findMany({
      where: {
        coachId,
        OR: [
          { name: { contains: q } },
          { muscleGroup: { contains: q } },
          { equipment: { contains: q } },
        ],
      },
      take: 5,
      select: { id: true, name: true, muscleGroup: true, equipment: true },
    })

    return NextResponse.json({ clients, templates, exercises })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 })
  }
}
