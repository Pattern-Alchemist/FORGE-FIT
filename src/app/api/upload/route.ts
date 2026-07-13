import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { randomUUID } from 'crypto'
import { getSession } from '@/lib/session'
import { rateLimit, getClientIP, setRateLimitHeaders } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads')
const MAX_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function POST(request: Request) {
  // Rate limit: 30 uploads per hour per IP
  const ip = getClientIP(request)
  const limit = rateLimit(`upload:${ip}`, { windowMs: 60 * 60 * 1000, max: 30 })
  if (!limit.success) {
    const res = NextResponse.json(
      { error: 'Too many uploads. Try again later.' },
      { status: 429 },
    )
    setRateLimitHeaders(res, limit)
    res.headers.set('Retry-After', String(Math.ceil((limit.resetTime - Date.now()) / 1000)))
    return res
  }

  try {
    // Auth check — both coaches and clients can upload
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPEG, PNG, WebP, GIF allowed' }, { status: 400 })
    }

    // Ensure upload dir exists
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true })
    }

    // Save with a unique name
    const ext = file.name.split('.').pop() || 'jpg'
    const filename = `${randomUUID()}.${ext}`
    const filepath = join(UPLOAD_DIR, filename)
    const bytes = await file.arrayBuffer()
    await writeFile(filepath, new Uint8Array(bytes))

    // Return the public URL
    return NextResponse.json({
      url: `/uploads/${filename}`,
      filename,
      size: file.size,
      type: file.type,
    })
  } catch (e) {
    console.error('[upload] error:', e)
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
