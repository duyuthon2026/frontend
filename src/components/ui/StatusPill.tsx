import { cn } from '../../lib/cn'

type StatusPillProps = {
  label: string
  status: string
}

export function StatusPill({ label, status }: StatusPillProps) {
  const tone =
    status === 'ready' || status === 'active'
      ? 'border-[#BDBB40] bg-[#F4F8DF]'
      : status === 'checking'
        ? 'border-[#D8D67A] bg-[#FBF9DF]'
        : status === 'blocked' || status === 'error' || status === 'unsupported'
          ? 'border-[#F2B8A0] bg-[#FFF0E8]'
          : 'border-[#E2E0BD] bg-[#FAFAF1]'

  return (
    <div
      className={cn(
        'flex min-h-[42px] items-center justify-between rounded-lg border px-3 py-2.5 text-[0.82rem] text-[#68684C]',
        tone,
      )}
    >
      <span>{label}</span>
      <strong className="text-[0.72rem] uppercase text-[#272719]">{status}</strong>
    </div>
  )
}
