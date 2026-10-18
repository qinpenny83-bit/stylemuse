import { ChevronDown } from 'lucide-react'

export default function LoadMore({
  hasMore,
  remaining,
  onClick,
}: {
  hasMore: boolean
  remaining: number
  onClick: () => void
}) {
  if (!hasMore) return null
  return (
    <div className="mt-8 flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1.5 rounded-full border border-ink-900/15 bg-white px-6 py-2.5 text-[13.5px] text-ink-700 shadow-soft transition-all hover:border-rose-300 hover:text-rose-700 active:scale-[0.98]"
      >
        加载更多
        <span className="text-ink-400">（还有 {remaining} 个）</span>
        <ChevronDown className="h-4 w-4" />
      </button>
    </div>
  )
}
