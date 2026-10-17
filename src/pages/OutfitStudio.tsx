import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Shirt, Sun, Wallet, Footprints, ShoppingBag, Layers } from 'lucide-react'
import { OUTFIT_DESIGNS } from '../data/outfits'
import { STYLES } from '../data/styles'
import { getTrend } from '../data/trends'
import type { OutfitDesign } from '../types'
import SmartImage from '../components/SmartImage'
import FavoriteButton from '../components/FavoriteButton'
import DetailModal from '../components/DetailModal'
import { EmptyState, Notice } from '../components/Feedback'
import { PaletteSwatches } from '../components/Palette'
import { TrendBadge, TrendInfoBlock, usedTrendIds } from '../components/Trend'

const SCENARIOS = [...new Set(OUTFIT_DESIGNS.map((o) => o.scenario))]
const SEASONS = ['春', '夏', '秋', '冬']
const BUDGETS = ['低', '中', '高']
const STYLE_NAMES = STYLES.map((s) => s.name)
const TREND_IDS = usedTrendIds(OUTFIT_DESIGNS)
/** 胶囊衣橱的场景命名与穿搭库不完全一致，跳转时做语义映射 */
const SCENARIO_MAP: Record<string, string> = { 休闲: '日常' }

function Detail({ o }: { o: OutfitDesign }) {
  const rows = [
    { label: '上装', value: o.top },
    { label: '下装/裙装', value: o.dress ?? o.bottom },
    { label: '外套', value: o.outer },
    { label: '鞋', value: o.shoes },
    { label: '包', value: o.bag },
    { label: '配饰', value: o.accessories.join('、') },
    { label: '版型', value: o.fit },
  ]
  return (
    <div>
      <SmartImage image={o.image} ratio="aspect-[16/9]" className="rounded-t-2xl" eager />
      <div className="p-6">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <p className="eyebrow text-rose-600">{o.scenario} · {o.seasons.join(' / ')} · 预算{o.budget}</p>
          <FavoriteButton type="outfit" refId={o.id} name={o.name} className="px-3 py-1.5 text-[12px]" />
        </div>
        <h2 className="font-display text-[24px] font-semibold text-ink-900">{o.name}</h2>

        <div className="mt-4 flex flex-wrap gap-2 text-[12.5px] text-ink-500">
          <span className="inline-flex items-center gap-1 rounded-full bg-cream-100 px-3 py-1">
            <Footprints className="h-3.5 w-3.5 text-rose-600" /> 舒适度：{o.comfort}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-cream-100 px-3 py-1">
            <Sun className="h-3.5 w-3.5 text-rose-600" /> 露肤度：{o.exposure}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-cream-100 px-3 py-1">
            <Layers className="h-3.5 w-3.5 text-rose-600" /> 搭配复杂度：{'●'.repeat(o.complexity)}{'○'.repeat(3 - o.complexity)}
          </span>
        </div>

        <div className="mt-5 space-y-3">
          {rows.map((r) => (
            <div key={r.label} className="flex gap-3 border-b border-cream-200/60 pb-3">
              <span className="w-20 shrink-0 text-[12.5px] font-medium text-ink-500">{r.label}</span>
              <span className="text-[13.5px] text-ink-700">{r.value}</span>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <p className="mb-2 text-[13px] font-medium text-ink-700">配色方案</p>
          <PaletteSwatches palette={o.palette} size="sm" />
        </div>

        <TrendInfoBlock trendId={o.trend} trendNote={o.trendNote} inspiration={o.inspiration} />

        <div className="mt-5 rounded-xl bg-cream-100/70 p-4">
          <p className="mb-1 text-[13px] font-medium text-ink-700">为什么这样搭</p>
          <p className="text-[13.5px] leading-relaxed text-ink-700">{o.reason}</p>
        </div>

        <div className="mt-5">
          <Notice tone="info">
            图片来源：{o.image.source === 'ai-generated' ? 'AI 生成示意图' : o.image.source} · {o.image.restrictions}
          </Notice>
        </div>
      </div>
    </div>
  )
}

export default function OutfitStudio() {
  const [params] = useSearchParams()
  // 从胶囊衣橱跳转过来时（?season= & scenario=）预填筛选，仅挂载时生效
  const [prefilled] = useState(() => params.has('scenario') || params.has('season'))
  const [scenario, setScenario] = useState(() => {
    const v = params.get('scenario')
    const mapped = v && SCENARIO_MAP[v] ? SCENARIO_MAP[v] : v
    return mapped && SCENARIOS.includes(mapped) ? mapped : '全部'
  })
  const [season, setSeason] = useState(() => {
    const v = params.get('season')
    return v && SEASONS.includes(v) ? v : '全部'
  })
  const [budget, setBudget] = useState('全部')
  const [styleName, setStyleName] = useState('全部')
  const [trend, setTrend] = useState('全部')

  const filtered = useMemo(
    () =>
      OUTFIT_DESIGNS.filter((o) => {
        if (scenario !== '全部' && o.scenario !== scenario) return false
        if (season !== '全部' && !o.seasons.includes(season)) return false
        if (budget !== '全部' && o.budget !== budget) return false
        if (styleName !== '全部' && !o.styleIds.some((id) => STYLES.find((s) => s.id === id)?.name === styleName)) return false
        if (trend !== '全部' && o.trend !== trend) return false
        return true
      }),
    [scenario, season, budget, styleName, trend],
  )

  // 每个筛选选项在当前其他条件下的结果数，帮助用户提前知道选它会匹配多少方案
  const scenarioCounts = useMemo(() => {
    const m: Record<string, number> = {}
    for (const s of SCENARIOS) m[s] = OUTFIT_DESIGNS.filter((o) =>
      o.scenario === s &&
      (season === '全部' || o.seasons.includes(season)) &&
      (budget === '全部' || o.budget === budget) &&
      (styleName === '全部' || o.styleIds.some((id) => STYLES.find((st) => st.id === id)?.name === styleName)) &&
      (trend === '全部' || o.trend === trend)).length
    return m
  }, [season, budget, styleName, trend])
  const seasonCounts = useMemo(() => {
    const m: Record<string, number> = {}
    for (const se of SEASONS) m[se] = OUTFIT_DESIGNS.filter((o) =>
      o.seasons.includes(se) &&
      (scenario === '全部' || o.scenario === scenario) &&
      (budget === '全部' || o.budget === budget) &&
      (styleName === '全部' || o.styleIds.some((id) => STYLES.find((st) => st.id === id)?.name === styleName)) &&
      (trend === '全部' || o.trend === trend)).length
    return m
  }, [scenario, budget, styleName, trend])
  const budgetCounts = useMemo(() => {
    const m: Record<string, number> = {}
    for (const b of BUDGETS) m[b] = OUTFIT_DESIGNS.filter((o) =>
      o.budget === b &&
      (scenario === '全部' || o.scenario === scenario) &&
      (season === '全部' || o.seasons.includes(season)) &&
      (styleName === '全部' || o.styleIds.some((id) => STYLES.find((st) => st.id === id)?.name === styleName)) &&
      (trend === '全部' || o.trend === trend)).length
    return m
  }, [scenario, season, styleName, trend])
  const styleCounts = useMemo(() => {
    const m: Record<string, number> = {}
    for (const s of STYLES) m[s.name] = OUTFIT_DESIGNS.filter((o) =>
      o.styleIds.includes(s.id) &&
      (scenario === '全部' || o.scenario === scenario) &&
      (season === '全部' || o.seasons.includes(season)) &&
      (budget === '全部' || o.budget === budget) &&
      (trend === '全部' || o.trend === trend)).length
    return m
  }, [scenario, season, budget, trend])
  const trendCounts = useMemo(() => {
    const m: Record<string, number> = {}
    for (const t of TREND_IDS) m[t] = OUTFIT_DESIGNS.filter((o) =>
      o.trend === t &&
      (scenario === '全部' || o.scenario === scenario) &&
      (season === '全部' || o.seasons.includes(season)) &&
      (budget === '全部' || o.budget === budget) &&
      (styleName === '全部' || o.styleIds.some((id) => STYLES.find((st) => st.id === id)?.name === styleName))).length
    return m
  }, [scenario, season, budget, styleName])

  const [active, setActive] = useState<OutfitDesign | null>(null)

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
    { label: '场景', v: scenario, set: setScenario },
    { label: '季节', v: season, set: setSeason },
    { label: '预算', v: budget, set: setBudget },
    { label: '风格', v: styleName, set: setStyleName },
    { label: '潮流', v: trend, set: setTrend },
  ].filter((x) => x.v !== '全部')

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 max-w-2xl">
        <div className="mb-3 flex items-center gap-3">
          <span className="h-px w-9 bg-rose-500/70" />
          <p className="eyebrow text-rose-600">Outfit Studio · N°04</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-[30px] font-semibold text-ink-900 md:text-[38px]">
            穿搭<em className="italic text-rose-600">设计室</em>
          </h1>
          <span className="pill-rose">共 {OUTFIT_DESIGNS.length} 套方案</span>
        </div>
        <p className="mt-3 text-[14.5px] leading-relaxed text-ink-500">
          按场景、季节、预算与风格筛选完整搭配方案：上装、下装、外套、鞋包、配饰、配色与搭配理由一应俱全。选项上的数字表示当前条件下可选方案数。
        </p>
      </div>

      {prefilled && (scenario !== '全部' || season !== '全部') && (
        <Notice tone="info" >
          <span className="mr-1.5">
            来自「胶囊衣橱」的推荐：已按
            <strong className="mx-1 text-ink-900">{scenario !== '全部' ? scenario : '任意'}场景</strong>
            ·
            <strong className="mx-1 text-ink-900">{season !== '全部' ? `${season}季` : '任意季节'}</strong>
            预筛。
          </span>
          <button
            type="button"
            onClick={() => {
              setScenario('全部')
              setSeason('全部')
            }}
            className="font-medium text-rose-600 underline-offset-2 hover:underline"
          >
            清除预筛
          </button>
        </Notice>
      )}

      <div className="card mb-8 space-y-4 p-5">
        <FilterRow label="场景" options={['全部', ...SCENARIOS]} value={scenario} onChange={setScenario} counts={scenarioCounts} />
        <FilterRow label="季节" options={['全部', ...SEASONS]} value={season} onChange={setSeason} counts={seasonCounts} />
        <FilterRow label="预算" options={['全部', ...BUDGETS]} value={budget} onChange={setBudget} counts={budgetCounts} />
        <FilterRow label="风格" options={['全部', ...STYLE_NAMES]} value={styleName} onChange={setStyleName} counts={styleCounts} />
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
                <button key={x.label} type="button" onClick={() => x.set('全部')} className="chip">
                  去掉「{x.label}：{x.v}」
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => setActive(o)}
              className="group card flex flex-col overflow-hidden text-left transition-all hover:-translate-y-1 hover:border-rose-200 hover:shadow-lift"
            >
              <SmartImage image={o.image} ratio="aspect-[3/2]" card />
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5">
                    <span className="pill-rose">{o.scenario}</span>
                    {o.trend && <TrendBadge trendId={o.trend} />}
                  </span>
                  <span className="flex items-center gap-1 text-[11.5px] text-ink-400">
                    <Wallet className="h-3 w-3" /> 预算{o.budget}
                  </span>
                </div>
                <h2 className="font-display text-[19px] font-semibold text-ink-900">{o.name}</h2>
                <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-ink-500">{o.reason}</p>
                <div className="mt-auto flex items-center gap-3 pt-4 text-[12px] text-ink-400">
                  <span className="inline-flex items-center gap-1"><Shirt className="h-3.5 w-3.5" />{o.top.split('（')[0]}</span>
                  <span className="inline-flex items-center gap-1"><ShoppingBag className="h-3.5 w-3.5" />{o.shoes.split('或')[0]}</span>
                  <span className="ml-auto flex items-center gap-1 text-[11px] text-ink-300">{o.seasons.join('/')}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <DetailModal open={Boolean(active)} onClose={() => setActive(null)}>
        {active && <Detail o={active} />}
      </DetailModal>
    </div>
  )
}
