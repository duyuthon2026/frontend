import { sanitizeQuantityAmount } from '../../lib/quantity'
import { cn } from '../../lib/cn'

type QuantityInputProps = {
  amount: string
  className?: string
  id?: string
  label: string
  onAmountChange: (amount: string) => void
  placeholder?: string
  unit: string
}

export function QuantityInput({
  amount,
  className,
  id,
  label,
  onAmountChange,
  placeholder = '1',
  unit,
}: QuantityInputProps) {
  return (
    <label
      className={cn(
        'grid min-w-0 gap-1.5 text-[0.76rem] font-extrabold text-[var(--color-content-muted)]',
        className,
      )}
    >
      {label}
      <div className="relative min-w-0">
        <input
          id={id}
          inputMode="decimal"
          pattern="[0-9]*[.]?[0-9]*"
          placeholder={placeholder}
          value={amount}
          onChange={(event) => onAmountChange(sanitizeQuantityAmount(event.target.value))}
          className="min-h-10 w-full min-w-0 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-base)] px-4 pr-14 font-normal text-[var(--color-content-default)] transition-colors placeholder-[var(--color-content-subtle)] focus:border-[var(--color-primary)] focus:outline-none"
        />
        <span className="pointer-events-none absolute inset-y-1.5 right-1.5 grid min-w-10 place-items-center rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-overlay)] px-2 text-[0.72rem] font-black text-[var(--color-content-muted)]">
          {unit}
        </span>
      </div>
    </label>
  )
}
