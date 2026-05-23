import { describe, expect, it } from 'vitest'
import { type ApiError, type ApiFetch, apiJson, resolveApiUrl } from './apiClient'

describe('api client helpers', () => {
  it('resolves same-origin and external backend API URLs', () => {
    expect(resolveApiUrl('/api/inventory', '')).toBe('/api/inventory')
    expect(resolveApiUrl('/api/inventory', 'https://api.janban.example/')).toBe(
      'https://api.janban.example/api/inventory',
    )
  })

  it('keeps API calls out of SPA client routes', () => {
    expect(() => resolveApiUrl('/inventory')).toThrow('/api/')
  })

  it('rejects API paths that normalize outside the backend namespace', () => {
    expect(() => resolveApiUrl('/api/../admin')).toThrow('/api/')
    expect(() => resolveApiUrl('/api/%2e%2e/admin')).toThrow('/api/')
    expect(() => resolveApiUrl('/api/inventory#client-only')).toThrow('fragment')
  })

  it('requires external backend config to be an HTTP(S) origin', () => {
    expect(() => resolveApiUrl('/api/inventory', 'javascript:alert(1)')).toThrow('http')
    expect(() => resolveApiUrl('/api/inventory', 'https://api.janban.example/v1')).toThrow(
      'origin',
    )
    expect(() => resolveApiUrl('/api/inventory', 'https://api.janban.example?env=prod')).toThrow(
      'origin',
    )
  })

  it('adds JSON accept and bearer auth headers through the central client', async () => {
    const requests: Array<{ input: RequestInfo | URL; init?: RequestInit }> = []
    const fetchImpl: ApiFetch = (input, init) => {
      requests.push({ input, init })
      return Promise.resolve(
        new Response(JSON.stringify({ ok: true }), {
          headers: { 'content-type': 'application/json' },
        }),
      )
    }

    const data = await apiJson('/api/inventory', {
      authToken: 'token-123',
      baseUrl: 'https://api.janban.example',
      fetchImpl,
    })

    expect(data).toEqual({ ok: true })
    expect(requests).toHaveLength(1)

    const request = requests[0]
    if (!request) {
      throw new Error('Expected one API request')
    }

    const headers = new Headers(request.init?.headers)
    expect(request.input).toBe('https://api.janban.example/api/inventory')
    expect(headers.get('accept')).toBe('application/json')
    expect(headers.get('authorization')).toBe('Bearer token-123')
  })

  it('throws typed API errors with response status and body', async () => {
    const fetchImpl: ApiFetch = () => Promise.resolve(
      new Response('service unavailable', { status: 503 }),
    )

    await expect(apiJson('/api/inventory', { baseUrl: '', fetchImpl })).rejects.toMatchObject({
      body: 'service unavailable',
      status: 503,
      url: '/api/inventory',
    } satisfies Partial<ApiError>)
  })
})
