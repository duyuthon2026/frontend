import type { PropsWithChildren, ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { SectionHeading } from './SectionHeading'

type PanelProps = PropsWithChildren<{
  className?: string
  description?: ReactNode
  eyebrow: string
  id?: string
  title: string
}>

export function Panel({
  children,
  className,
  description,
  eyebrow,
  id,
  title,
}: PanelProps) {
  return (
    <section
      id={id}
      className={cn(
        'grid gap-4 rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-overlay)] p-5 shadow-[var(--shadow-glass)] backdrop-blur-md transition-all duration-300',
        className,
      )}
    >
      <SectionHeading eyebrow={eyebrow} title={title} description={description} />
      <div className="grid gap-3">{children}</div>
    </section>
  )
}
