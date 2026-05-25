const zoomKeys = new Set(['+', '=', '-', '_', '0'])
const zoomCodes = new Set(['Equal', 'Minus', 'Digit0', 'NumpadAdd', 'NumpadSubtract', 'Numpad0'])
const textSelectionAllowedSelector = [
  'input',
  'textarea',
  'select',
  '[contenteditable]',
  '[data-allow-text-selection="true"]',
  '.allow-text-selection',
].join(',')

let uninstallGlobalGuards: (() => void) | undefined

export function installInteractionGuards(targetDocument: Document = document): () => void {
  if (targetDocument === document && uninstallGlobalGuards) {
    return uninstallGlobalGuards
  }

  const listeners: Array<() => void> = []

  const addDocumentListener = <K extends keyof DocumentEventMap>(
    type: K,
    listener: (event: DocumentEventMap[K]) => void,
    options?: AddEventListenerOptions,
  ) => {
    targetDocument.addEventListener(type, listener as EventListener, options)
    listeners.push(() => targetDocument.removeEventListener(type, listener as EventListener, options))
  }

  const blockDefault = (event: Event) => {
    if (event.cancelable) {
      event.preventDefault()
    }
  }

  const handleWheel = (event: WheelEvent) => {
    if (event.ctrlKey || event.metaKey) {
      blockDefault(event)
    }
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!(event.ctrlKey || event.metaKey)) {
      return
    }

    if (zoomKeys.has(event.key) || zoomCodes.has(event.code)) {
      blockDefault(event)
    }
  }

  const handleSelectStart = (event: Event) => {
    const target = event.target
    if (target instanceof Element && target.closest(textSelectionAllowedSelector)) {
      return
    }

    blockDefault(event)
  }

  addDocumentListener('wheel', handleWheel, { passive: false })
  addDocumentListener('keydown', handleKeyDown)
  addDocumentListener('selectstart', handleSelectStart, { passive: false })
  addDocumentListener('gesturestart' as keyof DocumentEventMap, blockDefault as never, { passive: false })
  addDocumentListener('gesturechange' as keyof DocumentEventMap, blockDefault as never, { passive: false })
  addDocumentListener('gestureend' as keyof DocumentEventMap, blockDefault as never, { passive: false })

  const uninstall = () => {
    for (const removeListener of listeners.splice(0)) {
      removeListener()
    }

    if (targetDocument === document) {
      uninstallGlobalGuards = undefined
    }
  }

  if (targetDocument === document) {
    uninstallGlobalGuards = uninstall
  }

  return uninstall
}
