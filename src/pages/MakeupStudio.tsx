import { useMemo, useState } from 'react'
import { Palette as PaletteIcon, Clock, BarChart3, Gauge, Layers } from 'lucide-react'
import { MAKEUP_DESIGNS } from '../data/makeup'
import { getTrend } from '../data/trends'
import type { MakeupDesign } from '../types'
import SmartImage from '../components/SmartImage'
import FavoriteButton from '../components/FavoriteButton'
import DetailModal from '../components/DetailModal'
import { EmptyState, Notice } from '../components/Feedback'
import { ColorDots } from '../components/Palette'
import { TrendBadge, TrendInfoBlock, usedTrendIds } from '../components/Trend'

const TYPES = [...new Set(MAKEUP_DESIGNS.map((m) => m.type))]
const TREND_IDS = usedTrendIds(MAKEUP_DESIGNS)

function Detail({ m }: { m: MakeupDesign }) {
  return (
    <div>
      <SmartImage image={m.image} ratio="aspect-[16/9]" className="rounded-t-2xl" eager />
      <div className="p-6">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <p className="eyebrow text-rose-600">{m.type} · {m.mood}</p>
          <FavoriteButton type="makeup" refId={m.id} name={m.name} className="px-3 py-1.5 text-[12px]" />
        </div>
        <h2 className="font-display text-[24px] font-semibold text-ink-900">{m.name}</h2>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-600">{m.description}</p>

        <div className="mt-4 flex flex-wrap gap-3 text-[12.5px] text-ink-500">
          <span className="inline-flex items-center gap-1 rounded-full bg-cream-100 px-3 py-1">
            <Gauge className="h-3.5 w-3.5 text-rose-600" /> 新手难度：{'●'.repeat(m.difficulty)}{'○'.repeat(3 - m.difficulty)}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-cream-100 px-3 py-1">
            <Clock className="h-3.5 w-3.5 text-rose-600" /> 预计耗时：约 {m.duration} 分钟
          </span>
        </div>

        <div className="mt-5 space-y-4">
          {[
            { label: '底妆质感', value: m.base },
            { label: '眉形', value: m.brows },
            { label: '眼妆', value: m.eyes },
            { label: '腮红', value: m.blush },
            { label: '修容', value: m.contour },
            { label: '唇色', value: m.lips },
          ].map((row) => (
            <div key={row.label} className="flex gap-3 border-b border-cream-200/60 pb-3">
              <span className="w-16 shrink-0 text-[12.5px] font-medium text-ink-500">{row.label}</span>
              <span className="text-[13.5px] text-ink-700">{row.value}</span>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <p className="mb-2 flex items-center gap-1.5 text-[13px] font-medium text-ink-700">
            <PaletteIcon className="h-4 w-4 text-rose-600" /> 适合的色彩范围
          </p>
          <ColorDots hexes={m.colors.map((c) => c.hex)} size="md" />
        </div>

        <TrendInfoBlock trendId={m.trend} trendNote={m.trendNote} />

        <div className="mt-5">
          <p className="mb-2 flex items-center gap-1.5 text-[13px] font-medium text-ink-700">
            <BarChart3 className="h-4 w-4 text-rose-600" /> 详细化妆步骤
          </p>
          <ol className="space-y-2">
            {m.steps.map((s, i) => (
              <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-ink-700">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-100 text-[11px] text-rose-700">
                  {i + 1}
                </span>
                {s}
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-5">
          <p className="mb-2 flex items-center gap-1.5 text-[13px] font-medium text-ink-700">
            <Layers className="h-4 w-4 text-rose-600" /> 可替换的产品类型或颜色（不指定品牌）
          </p>
          <div className="flex flex-wrap gap-2">
            {m.alternatives.map((a) => (
              <span key={a} className="chip !cursor-default">{a}</span>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <p className="mb-1 text-[13px] font-medium text-ink-700">适合人群</p>
          <p className="text-[13px] leading-relaxed text-ink-600">{m.suits}</p>
        </div>

        <div className="mt-5">
          <Notice tone="info">
            图片来源：{m.image.source === 'ai-generated' ? 'AI 生成示意图' : m.image.source} · {m.image.license} · {m.image.restrictions}
          </Notice>
        </div>
      </div>
    </div>
  )
}

export default function MakeupStudio() {
  const [type, setType] = useState('全部')
  const [diff, setDiff] = useState(0)
  const [trend, setTrend] = useState('全部')
  const [active, setActive] = useState<MakeupDesign | null>(null)

  const filtered = useMemo(
    () =>
      MAKEUP_DESIGNS.filter(
        (m) =>
          (type === '全部' || m.type === type) &&
          (diff === 0 || m.difficulty === diff) &&
          (trend === '全部' || m.trend === trend),
      ),
    [type, diff, trend],
  )

  // 每个筛选选项在当前其他条件下的结果数
  const typeCounts = useMemo(() => {
    const m: Record<string, number> = {}
    for (const t of TYPES) m[t] = MAKEUP_DESIGNS.filter((x) =>
      x.type === t && (diff === 0 || x.difficulty === diff) && (trend === '全部' || x.trend === trend)).length
    return m
  }, [diff, trend])
  const diffCounts = useMemo(() => {
    const m: Record<number, number> = {}
    for (const d of [1, 2, 3]) m[d] = MAKEUP_DESIGNS.filter((x) =>
      x.difficulty === d && (type === '全部' || x.type === type) && (trend === '全部' || x.trend === trend)).length
    return m
  }, [type, trend])
  const trendCounts = useMemo(() => {
    const m: Record<string, number> = {}
    for (const t of TREND_IDS) m[t] = MAKEUP_DESIGNS.filter((x) =>
      x.trend === t && (type === '全部' || x.type === type) && (diff === 0 || x.difficulty === diff)).length
    return m
  }, [type, diff])

  const FilterRow = ({ label, options, value, onChange, format, counts }: {
    label: string
    options: string[]
    value: string
    onChange: (v: string) => void
    format?: (v: string) => string
    counts: Record<string, number>
  }) => (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-16 shrink-0 text-[13px] text-ink-500">{label}</span>
      {options.map((o) => {
        const n = o === '全部' ? filtered.length : counts[o] ?? 0
        const zero = o !== '全部' && n === 0
        return (
          <button key={o} type="button" onClick={() => onChange(o)} className={`chip ${value === o ? 'chip-on' : ''}`}>
            {format ? format(o) : o}
            <span className={`ml-1 inline-flex min-w-[18px] items-center justify-center rounded-full px-1 text-[10.5px] leading-[16px] ${value === o ? 'bg-white/30' : zero ? 'bg-black/5 text-ink-300' : 'bg-black/10 text-ink-500'}`}>
              {n}
            </span>
          </button>
        )
      })}
    </div>
  )

  const activeFilterChips = [
    { label: '类型', v: type, set: () => setType('全部') },
    { label: '难度', v: diff === 0 ? '' : '★'.repeat(diff), set: () => setDiff(0) },
    { label: '潮流', v: trend, set: () => setTrend('全部') },
  ].filter((x) => (x.label === '难度' ? x.v !== '' : x.v !== '全部'))

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 max-w-2xl">
        <div className="mb-3 flex items-center gap-3">
          <span className="h-px w-9 bg-rose-500/70" />
          <p className="eyebrow text-rose-600">Makeup Studio · N°02</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-[30px] font-semibold text-ink-900 md:text-[38px]">
            妆容<em className="italic text-rose-600">设计室</em>
          </h1>
          <span className="pill-rose">共 {MAKEUP_DESIGNS.length} 套方案</span>
        </div>
        <p className="mt-3 text-[14.5px] leading-relaxed text-ink-500">
          日常、通勤、约会、甜美、辣妹、御姐、甜酷、清透、复古……每套方案包含质感、步骤、耗时与可替换产品，不要求购买指定品牌。选项上的数字表示当前条件下可选方案数。
        </p>
      </div>

      <div className="card mb-8 space-y-4 p-5">
        <FilterRow
          label="类型"
          options={['全部', ...TYPES]}
          value={type}
          onChange={setType}
          counts={typeCounts}
        />
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-16 shrink-0 text-[13px] text-ink-500">难度</span>
          {[0, 1, 2, 3].map((d) => {
            const n = d === 0 ? filtered.length : diffCounts[d] ?? 0
            const zero = d !== 0 && n === 0
            return (
              <button
                key={d}
                type="button"
                onClick={() => setDiff(d)}
                className={`chip ${diff === d ? 'chip-on' : ''}`}
              >
                {d === 0 ? '全部' : '★'.repeat(d)}
                <span className={`ml-1 inline-flex min-w-[18px] items-center justify-center rounded-full px-1 text-[10.5px] leading-[16px] ${diff === d ? 'bg-white/30' : zero ? 'bg-black/5 text-ink-300' : 'bg-black/10 text-ink-500'}`}>
                  {n}
                </span>
              </button>
            )
          })}
        </div>
        <FilterRow
          label="潮流"
          options={['全部', ...TREND_IDS]}
          value={trend}
          onChange={setTrend}
          format={(id) => getTrend(id)?.name ?? id}
          counts={trendCounts}
        />
        <Notice tone="info">
          <span className="mr-1.5">数字 = 当前其他条件下可匹配的方案数；数字为 0 的选项表示该组合暂无结果，可放宽筛选。</span>
        </Notice>
      </div>

      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center p-8 text-center">
          <EmptyState title="这个组合暂时没有完全匹配的方案" desc="所有方案都带展示图，只是该组合暂无内容。放宽任一筛选即可看到推荐。" />
          {activeFilterChips.length > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {activeFilterChips.map((x) => (
                <button key={x.label} type="button" onClick={x.set} className="chip">
                  去掉「{x.label}：{x.v}」
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setActive(m)}
              className="group card flex flex-col overflow-hidden text-left transition-all hover:-translate-y-1 hover:border-rose-200 hover:shadow-lift"
            >
              <SmartImage image={m.image} ratio="aspect-[3/2]" card />
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5">
                    <span className="pill-rose">{m.type}</span>
                    {m.trend && <TrendBadge trendId={m.trend} />}
                  </span>
                  <span className="text-[11.5px] text-ink-400">
                    {m.difficulty === 1 ? '新手友好' : m.difficulty === 2 ? '进阶' : '熟练'}
                    · {m.duration} 分钟
                  </span>
                </div>
                <h2 className="font-display text-[19px] font-semibold text-ink-900">{m.name}</h2>
                <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-ink-500">{m.description}</p>
                <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                  <ColorDots hexes={m.colors.map((c) => c.hex)} />
                  <span className="shrink-0 text-[13px] tracking-wider text-rose-500">
                    {'●'.repeat(m.difficulty)}{'○'.repeat(3 - m.difficulty)}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <DetailModal open={Boolean(active)} onClose={() => setActive(null)}>
        {active && <Detail m={active} />}
      </DetailModal>
    </div>
  )
}
