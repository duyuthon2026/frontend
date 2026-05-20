import { cn } from '../../lib/cn'

type StatusPillProps = {
  label: string
  status: string
}

export function StatusPill({ label, status }: StatusPillProps) {
  const tone =
    status === 'ready' || status === 'active'
      ? 'border-[var(--color-primary)] bg-[var(--color-surface-brand-soft)] text-[var(--color-content-brand)]'
      : status === 'checking'
        ? 'border-[var(--color-border-brand)] bg-[var(--color-surface-warning-soft)] text-[var(--color-warning)]'
        : status === 'blocked' || status === 'error' || status === 'unsupported'
          ? 'border-[var(--color-error)] bg-[var(--color-surface-danger-soft)] text-[var(--color-error)]'
          : 'border-[var(--color-border-default)] bg-[var(--color-bg-base)] text-[var(--color-content-muted)]'

  return (
    <div
      className={cn(
        'flex min-h-[42px] items-center justify-between rounded-xl border px-3.5 py-2 text-[0.82rem] font-semibold',
        tone,
      )}
    >
      <span>{label}</span>
      <strong className="text-[0.68rem] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-current opacity-80">
        {status}
      </strong>
    </div>
  )
}
