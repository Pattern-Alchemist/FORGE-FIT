'use client'

/**
 * Forge — File upload helper
 *
 * Posts a file to /api/upload and returns the public URL.
 * Used for progress photos and message attachments.
 *
 * Storage: local /public/uploads/ (sandbox).
 * Production: swap to S3/R2 by changing /api/upload to stream to the cloud.
 */

export interface UploadResult {
  url: string
  filename: string
  size: number
  type: string
}

export async function uploadFile(file: File): Promise<UploadResult> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch('/api/upload', { method: 'POST', body: formData })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Upload failed' }))
    throw new Error(err.error || 'Upload failed')
  }
  return res.json()
}
