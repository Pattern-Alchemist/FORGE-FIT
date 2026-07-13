import { describe, it, expect, vi, beforeEach } from 'vitest'
import { uploadFile } from '@/lib/upload'

describe('uploadFile', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('posts file as FormData and returns the URL', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        url: '/uploads/test.jpg',
        filename: 'test.jpg',
        size: 1024,
        type: 'image/jpeg',
      }),
    }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse))

    const file = new File(['test'], 'photo.jpg', { type: 'image/jpeg' })
    const result = await uploadFile(file)

    expect(fetch).toHaveBeenCalledWith('/api/upload', { method: 'POST', body: expect.any(FormData) })
    expect(result.url).toBe('/uploads/test.jpg')
    expect(result.filename).toBe('test.jpg')
  })

  it('throws on non-OK response', async () => {
    const mockResponse = {
      ok: false,
      json: async () => ({ error: 'File too large' }),
    }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse))

    const file = new File(['test'], 'photo.jpg', { type: 'image/jpeg' })
    await expect(uploadFile(file)).rejects.toThrow('File too large')
  })

  it('throws default error if response.json() fails', async () => {
    const mockResponse = {
      ok: false,
      json: async () => { throw new Error('parse error') },
    }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse))

    const file = new File(['test'], 'photo.jpg', { type: 'image/jpeg' })
    await expect(uploadFile(file)).rejects.toThrow('Upload failed')
  })
})
