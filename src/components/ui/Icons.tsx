import type { HTMLAttributes } from 'react'

type IconProps = HTMLAttributes<HTMLSpanElement> & {
  size?: number
  fill?: boolean
}

export const Icon = {
  Home: ({ size = 20, fill = false, className, ...props }: IconProps) => (
    <span
      className={`material-symbols-rounded select-none ${className || ''}`}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 500, 'GRAD' 0, 'opsz' 24`,
        display: 'inline-block',
        verticalAlign: 'middle',
      }}
      {...props}
    >
      home
    </span>
  ),

  Inventory: ({ size = 20, fill = false, className, ...props }: IconProps) => (
    <span
      className={`material-symbols-rounded select-none ${className || ''}`}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 500, 'GRAD' 0, 'opsz' 24`,
        display: 'inline-block',
        verticalAlign: 'middle',
      }}
      {...props}
    >
      inventory_2
    </span>
  ),

  Camera: ({ size = 20, fill = false, className, ...props }: IconProps) => (
    <span
      className={`material-symbols-rounded select-none ${className || ''}`}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 500, 'GRAD' 0, 'opsz' 24`,
        display: 'inline-block',
        verticalAlign: 'middle',
      }}
      {...props}
    >
      photo_camera
    </span>
  ),

  Recipes: ({ size = 20, fill = false, className, ...props }: IconProps) => (
    <span
      className={`material-symbols-rounded select-none ${className || ''}`}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 500, 'GRAD' 0, 'opsz' 24`,
        display: 'inline-block',
        verticalAlign: 'middle',
      }}
      {...props}
    >
      menu_book
    </span>
  ),

  User: ({ size = 20, fill = false, className, ...props }: IconProps) => (
    <span
      className={`material-symbols-rounded select-none ${className || ''}`}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 500, 'GRAD' 0, 'opsz' 24`,
        display: 'inline-block',
        verticalAlign: 'middle',
      }}
      {...props}
    >
      person
    </span>
  ),

  Bell: ({ size = 20, fill = false, className, ...props }: IconProps) => (
    <span
      className={`material-symbols-rounded select-none ${className || ''}`}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 500, 'GRAD' 0, 'opsz' 24`,
        display: 'inline-block',
        verticalAlign: 'middle',
      }}
      {...props}
    >
      notifications
    </span>
  ),

  Sun: ({ size = 20, fill = false, className, ...props }: IconProps) => (
    <span
      className={`material-symbols-rounded select-none ${className || ''}`}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 500, 'GRAD' 0, 'opsz' 24`,
        display: 'inline-block',
        verticalAlign: 'middle',
      }}
      {...props}
    >
      light_mode
    </span>
  ),

  Moon: ({ size = 20, fill = false, className, ...props }: IconProps) => (
    <span
      className={`material-symbols-rounded select-none ${className || ''}`}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 500, 'GRAD' 0, 'opsz' 24`,
        display: 'inline-block',
        verticalAlign: 'middle',
      }}
      {...props}
    >
      dark_mode
    </span>
  ),

  Trash: ({ size = 18, fill = false, className, ...props }: IconProps) => (
    <span
      className={`material-symbols-rounded select-none ${className || ''}`}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 500, 'GRAD' 0, 'opsz' 24`,
        display: 'inline-block',
        verticalAlign: 'middle',
      }}
      {...props}
    >
      delete
    </span>
  ),

  Edit: ({ size = 18, fill = false, className, ...props }: IconProps) => (
    <span
      className={`material-symbols-rounded select-none ${className || ''}`}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 500, 'GRAD' 0, 'opsz' 24`,
        display: 'inline-block',
        verticalAlign: 'middle',
      }}
      {...props}
    >
      edit
    </span>
  ),

  Plus: ({ size = 20, fill = false, className, ...props }: IconProps) => (
    <span
      className={`material-symbols-rounded select-none ${className || ''}`}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 500, 'GRAD' 0, 'opsz' 24`,
        display: 'inline-block',
        verticalAlign: 'middle',
      }}
      {...props}
    >
      add
    </span>
  ),

  AlertTriangle: ({ size = 18, fill = false, className, ...props }: IconProps) => (
    <span
      className={`material-symbols-rounded select-none ${className || ''}`}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 500, 'GRAD' 0, 'opsz' 24`,
        display: 'inline-block',
        verticalAlign: 'middle',
      }}
      {...props}
    >
      warning
    </span>
  ),

  Check: ({ size = 18, fill = false, className, ...props }: IconProps) => (
    <span
      className={`material-symbols-rounded select-none ${className || ''}`}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 500, 'GRAD' 0, 'opsz' 24`,
        display: 'inline-block',
        verticalAlign: 'middle',
      }}
      {...props}
    >
      check_circle
    </span>
  ),

  Sparkles: ({ size = 18, fill = false, className, ...props }: IconProps) => (
    <span
      className={`material-symbols-rounded select-none ${className || ''}`}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 500, 'GRAD' 0, 'opsz' 24`,
        display: 'inline-block',
        verticalAlign: 'middle',
      }}
      {...props}
    >
      auto_awesome
    </span>
  ),

  Calendar: ({ size = 18, fill = false, className, ...props }: IconProps) => (
    <span
      className={`material-symbols-rounded select-none ${className || ''}`}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 500, 'GRAD' 0, 'opsz' 24`,
        display: 'inline-block',
        verticalAlign: 'middle',
      }}
      {...props}
    >
      calendar_today
    </span>
  ),

  ChevronRight: ({ size = 20, fill = false, className, ...props }: IconProps) => (
    <span
      className={`material-symbols-rounded select-none ${className || ''}`}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 500, 'GRAD' 0, 'opsz' 24`,
        display: 'inline-block',
        verticalAlign: 'middle',
      }}
      {...props}
    >
      chevron_right
    </span>
  ),

  Search: ({ size = 20, fill = false, className, ...props }: IconProps) => (
    <span
      className={`material-symbols-rounded select-none ${className || ''}`}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 500, 'GRAD' 0, 'opsz' 24`,
        display: 'inline-block',
        verticalAlign: 'middle',
      }}
      {...props}
    >
      search
    </span>
  ),

  Filter: ({ size = 20, fill = false, className, ...props }: IconProps) => (
    <span
      className={`material-symbols-rounded select-none ${className || ''}`}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 500, 'GRAD' 0, 'opsz' 24`,
        display: 'inline-block',
        verticalAlign: 'middle',
      }}
      {...props}
    >
      filter_list
    </span>
  ),

  Bookmark: ({ size = 20, fill = false, className, ...props }: IconProps) => (
    <span
      className={`material-symbols-rounded select-none ${className || ''}`}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 500, 'GRAD' 0, 'opsz' 24`,
        display: 'inline-block',
        verticalAlign: 'middle',
      }}
      {...props}
    >
      bookmark
    </span>
  )
}

