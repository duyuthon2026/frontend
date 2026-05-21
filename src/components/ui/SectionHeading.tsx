import type { ReactNode } from 'react'

type SectionHeadingProps = {
  description?: ReactNode
  eyebrow: string
  title: string
}

export function SectionHeading({
  description,
  eyebrow,
  title,
}: SectionHeadingProps) {
  return (
    <div className="grid gap-1">
      <p className="m-0 text-[0.72rem] font-extrabold uppercase tracking-widest text-[var(--color-secondary)] dark:text-[var(--color-tertiary)]">
        {eyebrow}
      </p>
      <h2 className="m-0 text-[1.15rem] font-extrabold leading-tight tracking-tight text-[var(--color-content-default)]">
        {title}
      </h2>
      {description && (
        <div className="mt-0.5 grid gap-1 text-[0.88rem] leading-[1.45] text-[var(--color-content-muted)] [&_p]:m-0">
          {description}
        </div>
      )}
    </div>
  )
}
