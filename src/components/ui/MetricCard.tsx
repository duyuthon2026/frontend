import { cn } from '../../lib/cn'
import { Icon } from './Icons'

type MetricCardProps = {
  helper: string
  label: string
  tone?: 'ready' | 'warning' | 'normal'
  value: string
}

export function MetricCard({ helper, label, tone = 'normal', value }: MetricCardProps) {
  const isWarning = tone === 'warning'
  const isReady = tone === 'ready'

  return (
    <article
      className={cn(
        'relative overflow-hidden flex flex-col justify-between min-h-[96px] rounded-2xl border p-4 transition-all duration-300 shadow-[var(--shadow-glass)] hover:-translate-y-1 hover:shadow-[var(--shadow-premium)]',
        isWarning
          ? 'border-[var(--color-warning)]/40 bg-gradient-to-br from-[var(--color-bg-overlay)] to-[var(--color-surface-warning-soft)]'
          : isReady
            ? 'border-[var(--color-border-brand)] bg-gradient-to-br from-[var(--color-bg-overlay)] to-[var(--color-surface-brand-soft)]'
            : 'border-[var(--color-border-default)] bg-[var(--color-bg-overlay)]'
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[0.76rem] font-bold text-[var(--color-content-muted)]">{label}</span>
        <div
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-full border',
            isWarning
              ? 'border-[var(--color-warning)]/40 bg-[var(--color-bg-base)] text-[var(--color-warning)]'
              : isReady
                ? 'border-[var(--color-border-brand)] bg-[var(--color-bg-base)] text-[var(--color-primary)]'
                : 'border-[var(--color-border-default)] bg-[var(--color-bg-base)] text-[var(--color-content-muted)]'
          )}
        >
          {isWarning ? (
            <Icon.AlertTriangle size={14} />
          ) : isReady ? (
            <Icon.Sparkles size={14} />
          ) : (
            <Icon.Inventory size={14} />
          )}
        </div>
      </div>
      <div className="mt-2.5 flex flex-col">
        <strong className="text-[1.35rem] font-extrabold leading-none tracking-tight text-[var(--color-content-default)]">
          {value}
        </strong>
        <span className="mt-1 text-[0.72rem] font-semibold text-[var(--color-content-muted)]">
          {helper}
        </span>
      </div>
      {/* Subtle Background Glow decor */}
      <div
        className={cn(
          'absolute -right-6 -bottom-6 h-12 w-12 rounded-full blur-xl opacity-20',
          isWarning ? 'bg-[var(--color-warning)]' : isReady ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border-strong)]'
        )}
      />
    </article>
  )
}
