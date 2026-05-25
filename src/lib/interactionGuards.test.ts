import { afterEach, describe, expect, it } from 'vitest'
import { installInteractionGuards } from './interactionGuards'

let cleanup: (() => void) | undefined

afterEach(() => {
  cleanup?.()
  cleanup = undefined
  document.body.innerHTML = ''
})

describe('installInteractionGuards', () => {
  it('blocks browser zoom gestures from wheel and keyboard shortcuts', () => {
    cleanup = installInteractionGuards()

    const pinchWheel = new WheelEvent('wheel', { cancelable: true, ctrlKey: true })
    const normalWheel = new WheelEvent('wheel', { cancelable: true })
    const zoomInShortcut = new KeyboardEvent('keydown', {
      cancelable: true,
      code: 'Equal',
      key: '=',
      metaKey: true,
    })
    const regularShortcut = new KeyboardEvent('keydown', {
      cancelable: true,
      code: 'KeyK',
      key: 'k',
      metaKey: true,
    })

    expect(document.dispatchEvent(pinchWheel)).toBe(false)
    expect(document.dispatchEvent(normalWheel)).toBe(true)
    expect(document.dispatchEvent(zoomInShortcut)).toBe(false)
    expect(document.dispatchEvent(regularShortcut)).toBe(true)
  })

  it('blocks accidental text selection while preserving editable fields', () => {
    cleanup = installInteractionGuards()

    const label = document.createElement('span')
    const input = document.createElement('input')
    const selectableText = document.createElement('p')
    selectableText.dataset.allowTextSelection = 'true'
    document.body.append(label, input, selectableText)

    expect(label.dispatchEvent(new Event('selectstart', { bubbles: true, cancelable: true }))).toBe(false)
    expect(input.dispatchEvent(new Event('selectstart', { bubbles: true, cancelable: true }))).toBe(true)
    expect(selectableText.dispatchEvent(new Event('selectstart', { bubbles: true, cancelable: true }))).toBe(true)
  })

  it('removes guards on cleanup', () => {
    cleanup = installInteractionGuards()
    cleanup()
    cleanup = undefined

    const pinchWheel = new WheelEvent('wheel', { cancelable: true, ctrlKey: true })

    expect(document.dispatchEvent(pinchWheel)).toBe(true)
  })
})
