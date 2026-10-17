/* 空状态 / 提示条 */
import { Inbox } from 'lucide-react'

export function EmptyState({
  icon,
  title,
  desc,
  action,
}: {
  icon?: React.ReactNode
  title: string
  desc?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-cream-300 bg-cream-100/50 px-6 py-14 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-100 to-gold-300/50 text-rose-600">
        {icon ?? <Inbox className="h-8 w-8" strokeWidth={1.4} />}
      </div>
      <p className="text-[15px] font-medium text-ink-700">{title}</p>
      {desc && <p className="max-w-sm text-[13px] text-ink-500">{desc}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export function Notice({
  tone = 'info',
  children,
}: {
  tone?: 'info' | 'warn' | 'success'
  children: React.ReactNode
}) {
  const tones = {
    info: 'bg-slateblue-500/10 border-slateblue-500/25 text-ink-700',
    warn: 'bg-gold-400/15 border-gold-500/30 text-ink-700',
    success: 'bg-olive-500/10 border-olive-500/30 text-ink-700',
  } as const
  return (
    <div className={`rounded-xl border px-4 py-3 text-[13px] leading-relaxed ${tones[tone]}`}>
      {children}
    </div>
  )
}
