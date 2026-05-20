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
    <div className="grid gap-[7px]">
      <p className="m-0 text-[0.76rem] font-extrabold uppercase tracking-normal text-[#7B7A22]">
        {eyebrow}
      </p>
      <h2 className="m-0 text-[1.2rem] font-extrabold leading-tight tracking-normal text-[#272719]">
        {title}
      </h2>
      {description && (
        <div className="grid gap-1 text-[0.92rem] leading-[1.45] text-[#68684C] [&_p]:m-0">
          {description}
        </div>
      )}
    </div>
  )
}
