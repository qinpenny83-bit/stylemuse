import { Link } from 'react-router-dom'
import { Sparkles, ArrowRight } from 'lucide-react'
import { TRENDS } from '../data/trends'
import { OUTFIT_DESIGNS } from '../data/outfits'
import { MAKEUP_DESIGNS } from '../data/makeup'
import { HAIR_DESIGNS } from '../data/hair'
import type { Trend } from '../types'
import GlossaryTip from '../components/GlossaryTip'

const CATEGORY_LABEL: Record<Trend['category'], string> = { outfit: '穿搭', makeup: '妆容', hair: '发型' }
const CATEGORY_LINK: Record<Trend['category'], string> = { outfit: '/outfits', makeup: '/makeup', hair: '/hair' }
const CATEGORY_DESC: Record<Trend['category'], string> = {
  outfit: '来自品牌秀场、时装杂志与街拍的流行穿搭风潮',
  makeup: '美妆杂志与社交媒体的 2025-2026 热门妆容趋势',
  hair: '从秀场发型到人气发色，当下最受关注的发型趋势',
}

function usedCount(trendId: string): number {
  return (
    OUTFIT_DESIGNS.filter((o) => o.trend === trendId).length +
    MAKEUP_DESIGNS.filter((m) => m.trend === trendId).length +
    HAIR_DESIGNS.filter((h) => h.trend === trendId).length
  )
}

function TrendCard({ t }: { t: Trend }) {
  const count = usedCount(t.id)
  return (
    <div className="card group flex flex-col p-5 transition-all hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-lift">
      <div className="flex items-start justify-between gap-2">
        <p className="font-display text-[17px] font-semibold text-ink-900">
          {t.name}
          <span className="ml-2 text-[12px] font-normal text-ink-400">{t.enName}</span>
          <GlossaryTip term={t.name} className="ml-1.5" />
        </p>
        <span className="shrink-0 rounded-full bg-gradient-to-r from-rose-500 to-gold-400 px-2 py-0.5 text-[11px] font-medium text-white">
          {CATEGORY_LABEL[t.category]}
        </span>
      </div>
      <p className="mt-1 text-[12px] text-ink-400">出处：{t.source}</p>
      <p className="mt-2 text-[13px] leading-relaxed text-ink-700">{t.summary}</p>
      <div className="mt-3 rounded-lg bg-cream-100/70 px-3 py-2 text-[12.5px] leading-relaxed text-ink-700">
        <span className="font-medium text-ink-800">普通人日常化：</span>
        {t.dailyTip}
      </div>
      <div className="mt-auto flex items-center justify-between pt-4">
        <span className="text-[12px] text-ink-400">
          {count > 0 ? `本站收录 ${count} 套相关方案` : '灵感参考趋势'}
        </span>
        {count > 0 && (
          <Link
            to={CATEGORY_LINK[t.category]}
            className="inline-flex items-center gap-1 text-[12.5px] font-medium text-rose-600 transition-colors hover:text-rose-500"
          >
            去查看 <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </div>
  )
}

export default function Trends() {
  const categories: Trend['category'][] = ['outfit', 'makeup', 'hair']
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 max-w-2xl">
        <div className="mb-3 flex items-center gap-3">
          <span className="h-px w-9 bg-rose-500/70" />
          <p className="eyebrow text-rose-600">Trend Board · N°05</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-[30px] font-semibold text-ink-900 md:text-[38px]">
            潮流<em className="italic text-rose-600">风向标</em>
          </h1>
          <span className="pill-rose">共 {TRENDS.length} 个潮流</span>
        </div>
        <p className="mt-3 text-[14.5px] leading-relaxed text-ink-500">
          2025-2026 全球时尚风潮速览：全部来自品牌秀场、时装杂志（Vogue / Harper's Bazaar / Elle 等）与社交媒体趋势报道。
          每个潮流都附「普通人如何日常化」的落地建议，帮你把杂志大片变成自己的穿搭。
        </p>
      </div>

      {categories.map((cat) => {
        const items = TRENDS.filter((t) => t.category === cat)
        return (
          <section key={cat} className="mb-10">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-gold-400 shadow-soft">
                <Sparkles className="h-4 w-4 text-white" />
              </span>
              <div>
                <h2 className="font-display text-[20px] font-semibold text-ink-900">{CATEGORY_LABEL[cat]}趋势</h2>
                <p className="text-[12.5px] text-ink-500">{CATEGORY_DESC[cat]} · {items.length} 个</p>
              </div>
              <span className="ml-auto hidden h-px flex-1 bg-gradient-to-r from-cream-300 to-transparent sm:block" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((t) => (
                <TrendCard key={t.id} t={t} />
              ))}
            </div>
          </section>
        )
      })}

      <div className="card flex flex-col items-start gap-2 bg-gradient-to-r from-rose-100/70 to-gold-300/40 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-[17px] font-semibold text-ink-900">看完潮流，不知道怎么落地？</p>
          <p className="mt-1 text-[13px] text-ink-600">到三个设计室按「潮流」筛选，直接查看每个趋势对应的完整妆容 / 发型 / 穿搭方案。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(['/makeup', '/hair', '/outfits'] as const).map((to) => (
            <Link key={to} to={to} className="rounded-full bg-ink-900 px-4 py-2 text-[13px] text-cream-100 transition-colors hover:bg-ink-700">
              {to === '/makeup' ? '去妆容设计室' : to === '/hair' ? '去发型设计室' : '去穿搭设计室'}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
