import { cn } from '../../lib/cn'
import { MaterialIcon } from './MaterialIcon'

type IngredientIconProps = {
  className?: string
  name: string
  size?: 'sm' | 'md'
}

type IngredientIconConfig = {
  icon: string
  keywords: string[]
  tone: string
}

const iconConfigs: IngredientIconConfig[] = [
  {
    icon: 'egg_alt',
    keywords: ['egg', '계란', '달걀', '메추리알'],
    tone: 'bg-amber-100 text-amber-700 dark:bg-amber-300/20 dark:text-amber-200',
  },
  {
    icon: 'local_drink',
    keywords: ['milk', 'cheese', 'yogurt', '우유', '치즈', '요거트', '요구르트', '버터', '크림'],
    tone: 'bg-sky-100 text-sky-700 dark:bg-sky-300/20 dark:text-sky-200',
  },
  {
    icon: 'set_meal',
    keywords: ['fish', 'salmon', 'shrimp', 'tuna', '생선', '연어', '참치', '새우', '멸치', '오징어'],
    tone: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-300/20 dark:text-cyan-200',
  },
  {
    icon: 'restaurant',
    keywords: ['meat', 'beef', 'pork', 'chicken', '고기', '소고기', '돼지', '삼겹살', '닭', '닭고기', '햄', '베이컨'],
    tone: 'bg-rose-100 text-rose-700 dark:bg-rose-300/20 dark:text-rose-200',
  },
  {
    icon: 'rice_bowl',
    keywords: ['rice', 'grain', '쌀', '밥', '현미', '잡곡', '퀴노아'],
    tone: 'bg-stone-100 text-stone-700 dark:bg-stone-300/20 dark:text-stone-200',
  },
  {
    icon: 'ramen_dining',
    keywords: ['noodle', 'pasta', '면', '라면', '국수', '파스타', '우동', '소면'],
    tone: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-300/20 dark:text-yellow-200',
  },
  {
    icon: 'bakery_dining',
    keywords: ['bread', 'toast', 'bagel', '빵', '식빵', '토스트', '베이글', '또띠아'],
    tone: 'bg-orange-100 text-orange-700 dark:bg-orange-300/20 dark:text-orange-200',
  },
  {
    icon: 'eco',
    keywords: [
      'vegetable',
      'greens',
      'leaf',
      '채소',
      '야채',
      '상추',
      '깻잎',
      '시금치',
      '부추',
      '브로콜리',
      '오이',
      '호박',
      '가지',
      '양파',
      '대파',
      '마늘',
      '버섯',
      '콩나물',
      '숙주',
    ],
    tone: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-300/20 dark:text-emerald-200',
  },
  {
    icon: 'nutrition',
    keywords: ['fruit', 'apple', 'banana', 'berry', '과일', '사과', '바나나', '딸기', '블루베리', '토마토', '레몬', '귤'],
    tone: 'bg-lime-100 text-lime-700 dark:bg-lime-300/20 dark:text-lime-200',
  },
  {
    icon: 'soup_kitchen',
    keywords: ['sauce', 'paste', 'oil', '소스', '양념', '간장', '고추장', '된장', '식초', '오일', '참기름', '올리브유'],
    tone: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-300/20 dark:text-fuchsia-200',
  },
  {
    icon: 'ac_unit',
    keywords: ['frozen', 'ice', '냉동', '얼음'],
    tone: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-300/20 dark:text-indigo-200',
  },
]

const fallbackIcon = {
  icon: 'restaurant',
  tone: 'bg-[var(--color-surface-brand-soft)] text-[var(--color-content-brand)]',
}

export function IngredientIcon({ className, name, size = 'sm' }: IngredientIconProps) {
  const config = findIngredientIconConfig(name)
  const boxSize = size === 'md' ? 'h-8 w-8' : 'h-5 w-5'
  const iconSize = size === 'md' ? 19 : 14

  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full',
        boxSize,
        config.tone,
        className,
      )}
      title={name}
    >
      <MaterialIcon name={config.icon} size={iconSize} aria-hidden="true" />
    </span>
  )
}

function findIngredientIconConfig(name: string): { icon: string; tone: string } {
  const normalized = name.trim().toLowerCase()
  const config = iconConfigs.find((candidate) => (
    candidate.keywords.some((keyword) => normalized.includes(keyword.toLowerCase()))
  ))

  return config ?? fallbackIcon
}
