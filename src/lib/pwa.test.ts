import { afterEach, describe, expect, it, vi } from 'vitest'
import { getAppServiceWorkerReadiness, registerAppServiceWorker } from './pwa'

describe('app service worker helpers', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('does not create an unhandled rejected ready promise when unsupported', () => {
    vi.stubGlobal('navigator', {})

    const registration = registerAppServiceWorker()
    const readiness = getAppServiceWorkerReadiness()

    expect(registration.supported).toBe(false)
    expect(readiness.supported).toBe(false)
    expect('ready' in registration).toBe(false)
    expect('ready' in readiness).toBe(false)
  })
})
