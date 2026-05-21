import type { PropsWithChildren } from 'react'
import { useEffect, useRef } from 'react'
import { motion, useDragControls, type PanInfo } from 'framer-motion'
import { cn } from '../../lib/cn'

type SwipeableBottomSheetProps = PropsWithChildren<{
  ariaLabel: string
  className?: string
  onClose: () => void
}>

const sheetTransition = {
  damping: 30,
  stiffness: 260,
  type: 'spring',
} as const

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export function SwipeableBottomSheet({
  ariaLabel,
  children,
  className,
  onClose,
}: SwipeableBottomSheetProps) {
  const dragControls = useDragControls()
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const onCloseRef = useRef(onClose)
  const sheetRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    const previousActiveElement = document.activeElement
    const previousOverflow = document.body.style.overflow

    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseRef.current()
        return
      }

      if (event.key !== 'Tab') return

      const focusableElements = getFocusableElements(sheetRef.current)
      if (focusableElements.length === 0) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
        return
      }

      if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)

      if (previousActiveElement instanceof HTMLElement) {
        previousActiveElement.focus()
      }
    }
  }, [])

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 96 || info.velocity.y > 720) {
      onCloseRef.current()
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => onCloseRef.current()}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        drag="y"
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.32 }}
        dragMomentum={false}
        dragPropagation={false}
        onDragEnd={handleDragEnd}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={sheetTransition}
        ref={sheetRef}
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[88svh] max-w-[520px] overflow-y-auto overscroll-contain rounded-t-3xl border-t border-[var(--color-border-default)] bg-[var(--color-bg-overlay)] p-6 pb-9 shadow-[0_-8px_32px_rgba(0,0,0,0.15)] backdrop-blur-md',
          className,
        )}
      >
        <div className="mb-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <span />
          <button
            type="button"
            onPointerDown={(event) => dragControls.start(event, { distanceThreshold: 8 })}
            className="h-11 min-w-44 cursor-grab touch-none rounded-full border-0 bg-transparent px-12 active:cursor-grabbing"
            aria-label={`${ariaLabel} 아래로 밀어 닫기`}
          >
            <span className="mx-auto block h-1.5 w-20 rounded-full bg-[var(--color-border-default)]" />
          </button>
          <button
            type="button"
            ref={closeButtonRef}
            onClick={onClose}
            className="justify-self-end rounded-full border border-[var(--color-border-default)] bg-[var(--color-bg-base)] px-3 py-1.5 text-[0.7rem] font-black text-[var(--color-content-muted)] transition-colors hover:border-[var(--color-border-brand)] hover:text-[var(--color-content-default)]"
            aria-label={`${ariaLabel} 닫기`}
          >
            닫기
          </button>
        </div>
        {children}
      </motion.div>
    </>
  )
}

function getFocusableElements(container: HTMLElement | null) {
  if (!container) return []

  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter(
    (element) => !element.hasAttribute('disabled') && element.tabIndex !== -1,
  )
}
