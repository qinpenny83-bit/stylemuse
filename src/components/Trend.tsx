import { Sparkles } from 'lucide-react'
import { getTrend } from '../data/trends'
import GlossaryTip from './GlossaryTip'

/** 卡片上的趋势徽章：强调「当下流行」 */
export function TrendBadge({ trendId }: { trendId?: string }) {
  const t = getTrend(trendId)
  if (!t) return null
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-rose-500 to-gold-400 px-2 py-0.5 text-[11px] font-medium text-white">
      <Sparkles className="h-3 w-3" />
      {t.name}
    </span>
  )
}

/** 详情弹窗中的趋势区块：出处、定义、方案体现、日常化建议 */
export function TrendInfoBlock({
  trendId,
  trendNote,
  inspiration,
}: {
  trendId?: string
  trendNote?: string
  inspiration?: string
}) {
  const t = getTrend(trendId)
  if (!t) return null
  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-rose-200/70 bg-gradient-to-br from-rose-100 via-white to-gold-300/50 p-4">
      <p className="flex items-center gap-1.5 text-[13px] font-semibold text-rose-700">
        <Sparkles className="h-4 w-4 shrink-0" />
        当下潮流 · {t.name}
        <span className="text-[12px] font-normal text-ink-400">({t.enName})</span>
        <GlossaryTip term={t.name} />
      </p>
      <p className="mt-1 text-[12px] text-ink-400">出处：{t.source}</p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-ink-800">{t.summary}</p>
      {trendNote && (
        <div className="mt-2.5 rounded-lg bg-white/80 px-3 py-2 text-[12.5px] leading-relaxed text-ink-700">
          <span className="font-medium text-ink-800">这套方案怎么用：</span>
          {trendNote}
        </div>
      )}
      <p className="mt-2.5 text-[12.5px] leading-relaxed text-ink-600">
        <span className="font-medium text-ink-800">普通人日常化：</span>
        {t.dailyTip}
      </p>
      {inspiration && (
        <p className="mt-2 text-[12px] text-ink-400">灵感参考：{inspiration}</p>
      )}
    </div>
  )
}

/** 收集某类设计中实际用到的趋势 id（去重保序） */
export function usedTrendIds<T extends { trend?: string }>(designs: T[]): string[] {
  return [...new Set(designs.flatMap((d) => (d.trend ? [d.trend] : [])))]
}
