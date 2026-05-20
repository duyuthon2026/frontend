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
        'grid gap-4 rounded-lg border border-[#E2E0BD] bg-white p-4 shadow-[0_14px_34px_rgba(80,78,18,0.08)]',
        className,
      )}
    >
      <SectionHeading eyebrow={eyebrow} title={title} description={description} />
      {children}
    </section>
  )
}
