import type { HTMLAttributes } from 'react'

export type IconProps = HTMLAttributes<HTMLSpanElement> & {
  size?: number
  fill?: boolean
}

type MaterialIconProps = IconProps & {
  name: string
}

export function MaterialIcon({
  name,
  size = 20,
  fill = false,
  className,
  style,
  ...props
}: MaterialIconProps) {
  return (
    <span
      aria-hidden={props['aria-hidden'] ?? true}
      className={`material-symbols-rounded select-none ${className || ''}`}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 500, 'GRAD' 0, 'opsz' 24`,
        display: 'inline-block',
        verticalAlign: 'middle',
        ...style,
      }}
      {...props}
    >
      {name}
    </span>
  )
}
